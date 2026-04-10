let db, storage;
let currentUser = {
    id: null,
    groupCode: null,
    isAdmin: false
};
let gameState = {
    images: [],
    board: [],
    markedCells: new Set(),
    calledImages: new Set()
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined') {
        alert('Firebase not loaded. Please check your firebase-config.js file.');
        return;
    }

    db = firebase.database();
    storage = firebase.storage();

    initializeEventListeners();
});

function initializeEventListeners() {
    document.getElementById('create-group-btn').addEventListener('click', createGroup);
    document.getElementById('join-group-btn').addEventListener('click', joinGroup);
    document.getElementById('upload-btn').addEventListener('click', () => {
        document.getElementById('image-upload').click();
    });
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('logout-btn').addEventListener('click', leaveGroup);
    document.getElementById('shuffle-btn').addEventListener('click', shuffleBoard);
    document.getElementById('reset-btn').addEventListener('click', resetBoard);
    document.getElementById('leave-game-btn').addEventListener('click', leaveGroup);
    document.getElementById('play-again-btn').addEventListener('click', playAgain);
}

function generateGroupCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substring(2, 15);
}

async function createGroup() {
    const groupName = document.getElementById('new-group-name').value.trim();
    
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }

    const groupCode = generateGroupCode();
    currentUser.id = generateUserId();
    currentUser.groupCode = groupCode;
    currentUser.isAdmin = true;

    try {
        await db.ref(`groups/${groupCode}`).set({
            name: groupName,
            admin: currentUser.id,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'setup',
            images: [],
            players: {
                [currentUser.id]: {
                    online: true,
                    joinedAt: firebase.database.ServerValue.TIMESTAMP
                }
            }
        });

        showScreen('admin-screen');
        document.getElementById('admin-group-name').textContent = groupName;
        document.getElementById('admin-group-code').textContent = groupCode;

        listenToGroupChanges();
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Failed to create group. Please try again.');
    }
}

async function joinGroup() {
    const groupCode = document.getElementById('join-group-code').value.trim().toUpperCase();
    
    if (!groupCode) {
        alert('Please enter a group code');
        return;
    }

    try {
        const snapshot = await db.ref(`groups/${groupCode}`).once('value');
        
        if (!snapshot.exists()) {
            alert('Group not found. Please check the code.');
            return;
        }

        const groupData = snapshot.val();
        currentUser.id = generateUserId();
        currentUser.groupCode = groupCode;
        currentUser.isAdmin = false;

        await db.ref(`groups/${groupCode}/players/${currentUser.id}`).set({
            online: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });

        if (groupData.status === 'playing') {
            gameState.images = groupData.images || [];
            showScreen('game-screen');
            document.getElementById('game-group-name').textContent = groupData.name;
            document.getElementById('game-group-code').textContent = groupCode;
            initializeBoard();
        } else {
            alert('Game is not started yet. Waiting for admin to upload images and start the game.');
        }

        listenToGroupChanges();
    } catch (error) {
        console.error('Error joining group:', error);
        alert('Failed to join group. Please try again.');
    }
}

async function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    
    if (files.length !== 25) {
        alert('Please select exactly 25 images');
        return;
    }

    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="loading"></span> Uploading...';

    const progressDiv = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressStatus = document.getElementById('upload-status');
    progressDiv.style.display = 'block';

    const imageUrls = [];
    const previewGrid = document.getElementById('image-preview');
    previewGrid.innerHTML = '';

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (!file.type.match('image/(png|jpeg|jpg)')) {
                throw new Error(`File ${file.name} is not a valid image format`);
            }

            if (file.size > 2 * 1024 * 1024) {
                throw new Error(`File ${file.name} exceeds 2MB limit`);
            }

            const valid = await validateImageDimensions(file);
            if (!valid) {
                throw new Error(`File ${file.name} should be square-shaped`);
            }

            const storageRef = storage.ref(`groups/${currentUser.groupCode}/images/${i}_${file.name}`);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();
            
            imageUrls.push(url);

            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `<img src="${url}" alt="Image ${i + 1}">`;
            previewGrid.appendChild(previewItem);

            const progress = ((i + 1) / files.length) * 100;
            progressFill.style.width = progress + '%';
            progressStatus.textContent = `Uploaded ${i + 1} of ${files.length}`;
        }

        await db.ref(`groups/${currentUser.groupCode}/images`).set(imageUrls);

        progressStatus.textContent = 'Upload complete!';
        document.getElementById('start-game-btn').style.display = 'block';
        uploadBtn.style.display = 'none';

    } catch (error) {
        console.error('Error uploading images:', error);
        alert('Upload failed: ' + error.message);
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<span>📤 Select Images</span>';
        progressDiv.style.display = 'none';
    }
}

function validateImageDimensions(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            const aspectRatio = img.width / img.height;
            resolve(aspectRatio >= 0.9 && aspectRatio <= 1.1);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(false);
        };
        
        img.src = url;
    });
}

async function startGame() {
    try {
        await db.ref(`groups/${currentUser.groupCode}/status`).set('playing');
        
        showScreen('game-screen');
        const groupSnapshot = await db.ref(`groups/${currentUser.groupCode}`).once('value');
        const groupData = groupSnapshot.val();
        
        document.getElementById('game-group-name').textContent = groupData.name;
        document.getElementById('game-group-code').textContent = currentUser.groupCode;
        
        gameState.images = groupData.images;
        initializeBoard();
    } catch (error) {
        console.error('Error starting game:', error);
        alert('Failed to start game. Please try again.');
    }
}

function initializeBoard() {
    const shuffledImages = shuffleArray([...gameState.images]);
    gameState.board = shuffledImages;
    gameState.markedCells = new Set();
    renderBoard();
}

function shuffleBoard() {
    const shuffledImages = shuffleArray([...gameState.images]);
    gameState.board = shuffledImages;
    gameState.markedCells = new Set();
    renderBoard();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function renderBoard() {
    const board = document.getElementById('pingo-board');
    board.innerHTML = '';

    gameState.board.forEach((imageUrl, index) => {
        const cell = document.createElement('div');
        cell.className = 'pingo-cell';
        cell.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Cell ${index + 1}`;
        
        cell.appendChild(img);
        cell.addEventListener('click', () => toggleCell(index));
        
        if (gameState.markedCells.has(index)) {
            cell.classList.add('marked');
        }
        
        board.appendChild(cell);
    });
}

async function toggleCell(index) {
    const imageUrl = gameState.board[index];
    
    if (gameState.markedCells.has(index)) {
        gameState.markedCells.delete(index);
        gameState.calledImages.delete(imageUrl);
    } else {
        gameState.markedCells.add(index);
        gameState.calledImages.add(imageUrl);
        
        await db.ref(`groups/${currentUser.groupCode}/calledImages/${imageUrl.replace(/[.#$[\]]/g, '_')}`).set(true);
    }
    
    renderBoard();
    checkForWin();
}

function checkForWin() {
    const marked = Array.from(gameState.markedCells);
    
    const winPatterns = [
        [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
        [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
        [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];
    
    for (const pattern of winPatterns) {
        if (pattern.every(index => marked.includes(index))) {
            announceWin();
            return;
        }
    }
}

async function announceWin() {
    try {
        await db.ref(`groups/${currentUser.groupCode}/winners`).push({
            userId: currentUser.id,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        showWinnerModal(`You got PINGO!`);
    } catch (error) {
        console.error('Error announcing win:', error);
    }
}

function showWinnerModal(text) {
    const modal = document.getElementById('winner-modal');
    document.getElementById('winner-text').textContent = text;
    modal.classList.add('active');
}

function hideWinnerModal() {
    document.getElementById('winner-modal').classList.remove('active');
}

function playAgain() {
    hideWinnerModal();
    resetBoard();
}

function resetBoard() {
    gameState.markedCells = new Set();
    renderBoard();
}

function listenToGroupChanges() {
    const groupRef = db.ref(`groups/${currentUser.groupCode}`);
    
    groupRef.on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        
        const data = snapshot.val();
        
        if (data.status === 'playing' && !currentUser.isAdmin) {
            gameState.images = data.images || [];
            if (gameState.board.length === 0) {
                showScreen('game-screen');
                document.getElementById('game-group-name').textContent = data.name;
                document.getElementById('game-group-code').textContent = currentUser.groupCode;
                initializeBoard();
            }
        }
        
        const playerCount = data.players ? Object.keys(data.players).length : 0;
        const playersElement = document.getElementById('players-online');
        if (playersElement) {
            playersElement.textContent = `Players: ${playerCount}`;
        }
    });
    
    const winnersRef = db.ref(`groups/${currentUser.groupCode}/winners`);
    winnersRef.on('child_added', (snapshot) => {
        const winner = snapshot.val();
        if (winner.userId !== currentUser.id) {
            addGameMessage(`Another player got PINGO!`, 'winner');
        }
    });
    
    const calledRef = db.ref(`groups/${currentUser.groupCode}/calledImages`);
    calledRef.on('child_added', (snapshot) => {
        const imageKey = snapshot.key;
        addGameMessage(`Image called by another player`, 'info');
    });
    
    window.addEventListener('beforeunload', () => {
        if (currentUser.groupCode && currentUser.id) {
            db.ref(`groups/${currentUser.groupCode}/players/${currentUser.id}/online`).set(false);
        }
    });
}

function addGameMessage(text, type) {
    const messagesDiv = document.getElementById('game-messages');
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    messagesDiv.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function leaveGroup() {
    if (currentUser.groupCode && currentUser.id) {
        db.ref(`groups/${currentUser.groupCode}/players/${currentUser.id}`).remove();
    }
    
    currentUser = {
        id: null,
        groupCode: null,
        isAdmin: false
    };
    
    gameState = {
        images: [],
        board: [],
        markedCells: new Set(),
        calledImages: new Set()
    };
    
    showScreen('welcome-screen');
    
    document.getElementById('new-group-name').value = '';
    document.getElementById('join-group-code').value = '';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
