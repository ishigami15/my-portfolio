const grid = [];
const gridHeight = 20;
const gridWidth = 10;
let currentPiece = null;
let intervalId = null;
let isWaiting = true;
let lineClearedCount = 0;
let gameOver = false;

class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor(gridWidth / 2) - 1;
        this.y = 0;
    }

    draw() {
        this.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    const x = this.x + dx;
                    const y = this.y + dy;
                    if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                        grid[y][x].style.backgroundColor = this.color;
                    }
                }
            });
        });
    }

    erase() {
        this.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    const x = this.x + dx;
                    const y = this.y + dy;
                    if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                        grid[y][x].style.backgroundColor = '';
                    }
                }
            });
        });
    }

    moveDown() {
        this.erase();
        this.y++;
        if (!this.isValidPosition()) {
            this.y--;
            this.draw();
            checkCompleteRows();
            if (!gameOver) addPiece();
            return;
        }
        this.draw();
    }

    move(dx) {
        this.erase();
        this.x += dx;
        if (!this.isValidPosition()) {
            this.x -= dx;
        }
        this.draw();
    }

    rotate(direction) {
        this.erase();
        let newShape = [];
        for (let x = 0; x < this.shape[0].length; x++) {
            newShape.push(this.shape.map(row => row[x]));
        }
        if (direction === 'left') {
            this.shape = newShape.map(row => row.reverse());
        } else {
            this.shape = newShape.reverse();
        }
        if (!this.isValidPosition()) {
            if (direction === 'left') {
                this.rotate('right');
            } else {
                this.rotate('left');
            }
        }
        this.draw();
    }

    isValidPosition() {
        return this.shape.every((row, dy) => {
            return row.every((cell, dx) => {
                if (!cell) return true;
                const x = this.x + dx;
                const y = this.y + dy;
                return x >= 0 && x < gridWidth && y < gridHeight && (!grid[y] || !grid[y][x].style.backgroundColor);
            });
        });
    }
}

const pieces = [
    { shape: [[1, 1, 1, 1]], color: 'cyan' },
    { shape: [[1, 1], [1, 1]], color: 'yellow' },
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' },
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },
    { shape: [[1, 0, 0], [1, 1, 1]], color: 'blue' },
    { shape: [[0, 0, 1], [1, 1, 1]], color: 'orange' }
];

function initGrid() {
    const tetrisContainer = document.getElementById('tetris');
    tetrisContainer.innerHTML = '';
    for (let y = 0; y < gridHeight; y++) {
        const row = document.createElement('div');
        row.className = 'row';
        grid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            row.appendChild(cell);
            grid[y][x] = cell;
        }
        tetrisContainer.appendChild(row);
    }
    addPiece();
}

function addPiece() {
    if (gameOver) return;
    clearInterval(intervalId);
    isWaiting = true;
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = new Piece(piece.shape, piece.color);
    if (!currentPiece.isValidPosition()) {
        endGame('GAME OVER');
        return;
    }
    currentPiece.draw();
    setTimeout(() => {
        isWaiting = false;
        intervalId = setInterval(() => {
            if (currentPiece) {
                currentPiece.moveDown();
            }
        }, 714);
    }, 3000);
}

function checkCompleteRows() {
    let clearedInThisCheck = 0;
    for (let y = gridHeight - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell.style.backgroundColor !== '')) {
            for (let row = y; row > 0; row--) {
                for (let x = 0; x < gridWidth; x++) {
                    grid[row][x].style.backgroundColor = grid[row - 1][x].style.backgroundColor;
                }
            }
            y++;
            clearedInThisCheck++;
        }
    }
    if (clearedInThisCheck > 0) {
        lineClearedCount += clearedInThisCheck;
        if (lineClearedCount >= 3) {
            endGame('SUCCESS');
        }
    }
}

function endGame(message) {
    gameOver = true;
    clearInterval(intervalId);
    currentPiece = null;
    document.removeEventListener('keydown', handleKeyPress);
    displayEndMessage(message);
}

function displayEndMessage(message) {
    const endMessage = document.createElement('div');
    endMessage.textContent = message;
    endMessage.style.color = message === 'SUCCESS' ? 'green' : 'red';
    endMessage.style.fontSize = '20px';
    endMessage.style.position = 'absolute';
    endMessage.style.top = '50%';
    endMessage.style.left = '50%';
    endMessage.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(endMessage);

    const restartHandler = function (event) {
        if (event.key === 'ArrowRight') {
            endMessage.remove();
            resetGame();
            document.addEventListener('keydown', handleKeyPress);
        }
    };

    document.removeEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', restartHandler, { once: true });
}

function displayStartMessage() {
    const startMessage = document.createElement('div');
    startMessage.textContent = 'Press Right Arrow to Start';
    startMessage.style.color = 'blue';
    startMessage.style.fontSize = '20px';
    startMessage.style.position = 'absolute';
    startMessage.style.top = '50%';
    startMessage.style.left = '50%';
    startMessage.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(startMessage);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
            startMessage.remove();
            resetGame();
            document.addEventListener('keydown', handleKeyPress);
        }
    }, { once: true });
}

function resetGame() {
    gameOver = false;
    lineClearedCount = 0;
    clearGrid();      // 🟢 追加：前のグリッドをクリア
    initGrid();       // グリッド初期化＋新しいピースを投入
}

function clearGrid() {
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            grid[y][x].style.backgroundColor = '';
        }
    }
}

function handleKeyPress(event) {
    if (!currentPiece || gameOver) return;
    if (isWaiting) {
        switch (event.key) {
            case 'ArrowLeft':
                currentPiece.rotate('left');
                break;
            case 'ArrowRight':
                currentPiece.rotate('right');
                break;
        }
    } else {
        switch (event.key) {
            case 'ArrowLeft':
                currentPiece.move(-1);
                break;
            case 'ArrowRight':
                currentPiece.move(1);
                break;
        }
    }
}

displayStartMessage();
