class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.board = this.createBoard();
        
        // Game state
        this.isRunning = false;
        this.gameOver = false;
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000; // default is 1 second - will decrease with levels
        
        // Active piece
        this.activePiece = null;
        
        // Hold piece
        this.holdPiece = null;
        this.canHold = true; // Can only hold once per piece

        // Next piece
        this.nextPiece = null;
        
        // Next pieces bag (7-bag system)
        this.bag = [];
        
        // Set up keyboard controls
        this.setupControls();
        
        this.init();
    }

    createBoard() {
        return Array.from(
            { length: ROWS }, 
            () => Array(COLS).fill(0)
        );
    }

    init() {
        // Generate the piece
        if (this.bag.length === 0) {
            this.fillBag();
        }

        // Pull active piece
        const firstPiece = this.bag.pop();
        this.activePiece = new Tetromino(firstPiece);

        // Pull next piece
        const secondPiece = this.bag.pop();
        this.nextPiece = secondPiece;
        
        // Start the game
        this.isRunning = true;
        this.gameLoop(0);

        // Stats
        this.score = 0;
        this.level = 1;
        this.lines = 0;

        this.displayScore();
    }
    
    gameLoop(time = 0) {
        // Calculate time delta
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        // Update drop counter
        this.dropCounter += deltaTime;
        
        // If it's time to drop the piece
        if (this.dropCounter > this.dropInterval) {
            this.tick();
            this.dropCounter = 0;
        }
        
        // Render the current state
        this.render();
        
        // Continue the game loop if the game is running
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    tick() {
        // Move the active piece down
        if (this.activePiece) {
            this.movePiece('down');
        }
    }

    render() {
        this.renderer.clearBoard();
        
        // Draw the board (locked pieces)
        this.renderer.drawBoard(this.board);
        
        // Draw the hold box and piece
        this.renderer.drawHoldBox();
        if (this.holdPiece) {
            this.renderer.drawHoldPiece(this.holdPiece);
        }

        this.renderer.drawNextBox();
        if (this.nextPiece) {
            this.renderer.drawNextPiece(this.nextPiece);
        }
        
        // Draw the ghost piece
        if (this.activePiece) {
            const ghostY = this.getGhostPiecePosition();
            this.renderer.drawGhostPiece(this.activePiece, ghostY);
        }
        
        // Draw the active piece
        if (this.activePiece) {
            this.drawActivePiece();
        }

        // Display "PAUSED" if the game is paused
        if (!this.isRunning && !this.gameOver) {
            this.renderer.drawPause();
        }

        // Display "Game Over" if the game is over
        if (this.gameOver) {
            this.renderer.drawGameOver(this.score, this.level, this.lines);
        }
    }
    
    drawActivePiece() {
        const shape = this.activePiece.getShape();
        const color = this.activePiece.color;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = this.activePiece.x + x;
                    const boardY = this.activePiece.y + y;
                    
                    // Only draw if within the visible area
                    if (boardY >= ROWS - VISIBLE_ROWS) {
                        this.renderer.drawBlock(
                            boardX * BLOCK_SIZE,
                            (boardY - (ROWS - VISIBLE_ROWS)) * BLOCK_SIZE,
                            COLORS[color]
                        );
                    }
                }
            }
        }
    }
    
    getGhostPiecePosition() {
        // Start from the current position
        let ghostY = this.activePiece.y;
        
        // Move down until collision
        while (!this.checkCollision(this.activePiece.x, ghostY + 1, this.activePiece.getShape())) {
            ghostY++;
        }
        
        return ghostY;
    }
    
    generateNewPiece() {
        // Make next piece the active piece
        this.activePiece = new Tetromino(this.nextPiece);
        
        // Pull a new next piece
        if (this.bag.length === 0) {
            this.fillBag();
        }
        const pulledPiece = this.bag.pop();
        this.nextPiece = pulledPiece;
        
        // Reset hold flag
        this.canHold = true;
        
        // Game over
        if (this.checkCollision(this.activePiece.x, this.activePiece.y, this.activePiece.getShape())) {
            this.gameOver = true;
            this.isRunning = false;
            console.log('Game Over!');
        }
    }
    
    fillBag() {
        // 7-bag system: all 7 tetrominos in random order
        this.bag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        
        // Shuffle the bag
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }
    
    checkCollision(x = this.activePiece.x, y = this.activePiece.y, shape = this.activePiece.getShape()) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;
                    
                    // Check if out of bounds
                    if (
                        boardX < 0 || 
                        boardX >= COLS || 
                        boardY >= ROWS || 
                        // Check if collides with locked pieces
                        (boardY >= 0 && this.board[boardY][boardX])
                    ) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    lockPiece() {
        const shape = this.activePiece.getShape();
        const color = this.activePiece.color;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = this.activePiece.x + x;
                    const boardY = this.activePiece.y + y;
                    
                    // Only lock if within the board
                    if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                        this.board[boardY][boardX] = color;
                    }
                }
            }
        }
        
        // Check for completed lines
        this.checkLines();
        
        // Generate a new piece
        this.generateNewPiece();
    }

    updateScore(countCleared) {
        let points = 0;

        switch (countCleared) {
            case 1:
                points = 40 * this.level;
                break;
            case 2:
                points = 100 * this.level;
                break;
            case 3:
                points = 300 * this.level;
                break;
            case 4:
                points = 1200 * this.level;
                break;
        }

        this.score += points;
        this.lines += countCleared;
        this.updateLevel();
        this.displayScore();
    }

    updateLevel() {
        const newLvl = Math.floor(this.lines / 10) + 1;
        if (newLvl > this.level) {
            this.level = newLvl;
            this.dropInterval = Math.max(100, 1000 - ((this.level - 1) * 100));
        }

        this.displayScore();
    }
    
    checkLines() {
        // Cleared line counter
        let countCleared = 0;

        for (let row = ROWS - 1; row >= 0; row--) {
            // If every cell in the row is filled, remove the row and add a new empty row at the top    
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(COLS).fill(0));
                row++;
                countCleared++;
            }
        }

        if (countCleared > 0) {
            this.updateScore(countCleared);
        }
    }
    
    movePiece(direction) {
        // Store original position
        const originalX = this.activePiece.x;
        const originalY = this.activePiece.y;
        
        // Move the piece
        this.activePiece.move(direction);
        
        // If the move causes a collision, revert it
        if (this.checkCollision()) {
            this.activePiece.x = originalX;
            this.activePiece.y = originalY;
            
            // If trying to move down and collision, lock the piece
            if (direction === 'down') {
                this.lockPiece();
            }
            
            return false;
        }
        
        return true;
    }
    
    rotatePiece(direction) {
        // Store original rotation
        const originalRotation = this.activePiece.rotation;
        
        // Rotate the piece
        if (direction === 'clockwise') {
            this.activePiece.rotateClockwise();
        } else {
            this.activePiece.rotateCounterClockwise();
        }
        
        // If the rotation causes a collision, revert it
        if (this.checkCollision()) {
            this.activePiece.rotation = originalRotation;
            return false;
        }
        
        return true;
    }
    
    holdCurrentPiece() {
        // Can only hold once per piece
        if (!this.canHold) return;
        
        const currentType = this.activePiece.type;
        
        if (this.holdPiece === null) {
            // First hold - generate a new piece
            this.holdPiece = currentType;
            this.generateNewPiece();
        } else {
            // Swap with hold piece
            const tempType = this.holdPiece;
            this.holdPiece = currentType;
            this.activePiece = new Tetromino(tempType);
        }
        
        // Prevent holding again until a piece is locked
        this.canHold = false;
    }
    
    setupControls() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' || event.key === 'F1') {
                this.togglePause();
                return;
            }

            if (event.key === 'Enter') {
                this.reset();
                return;
            }

            if (!this.isRunning || this.gameOver) return;
            
            switch (event.key) {
                case 'ArrowLeft':
                    this.movePiece('left');
                    break;
                case 'ArrowRight':
                    this.movePiece('right');
                    break;
                case 'ArrowDown':
                    this.movePiece('down');
                    break;
                case 'ArrowUp':
                case 'X':
                case 'x':
                    this.rotatePiece('clockwise');
                    break;
                case 'z':
                case 'Z':
                case 'Control':
                    this.rotatePiece('counterclockwise');
                    break;
                case 'c':
                case 'C':
                case 'Shift':
                    this.holdCurrentPiece();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
            }
        });
    }
    
    hardDrop() {
        // Move the piece down until it collides
        while (this.movePiece('down')) {
            // Continue moving down
        }
        // The piece is now locked by the movePiece method
    }
    
    togglePause() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.resume();
        }
    }
    
    pause() {
        this.isRunning = false;
    }
    
    resume() {
        if (!this.gameOver) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }
    }
    
    reset() {
        this.board = this.createBoard();
        this.gameOver = false;
        this.dropInterval = 1000;
        this.bag = [];
        this.holdPiece = null;
        this.canHold = true;
        this.generateNewPiece();
        this.resume();
    }

    displayScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('level').textContent = `Level: ${this.level}`;
        document.getElementById('lines').textContent = `Lines: ${this.lines}`;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
});
