class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initCanvas();
    }

    initCanvas() {
        // Increase canvas width to accommodate hold piece box
        this.canvas.width = BOARD_WIDTH + 300;
        this.canvas.height = BOARD_HEIGHT;
        this.ctx.scale(1, 1);
    }

    clearBoard() {
        // Clear with transparent background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBoard(board) {
        // Only render the visible portion of the board (bottom 20 rows)
        const startRow = ROWS - VISIBLE_ROWS;
        
        // Draw grid lines first
        this.drawGrid();
        
        // Then draw blocks
        for (let row = startRow; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cellValue = board[row][col];
                if (cellValue) { // Only draw non-empty cells
                    this.drawBlock(
                        col * BLOCK_SIZE,
                        (row - startRow) * BLOCK_SIZE,
                        COLORS[cellValue]
                    );
                }
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 0.5;

        // Draw vertical lines
        for (let col = 0; col <= COLS; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * BLOCK_SIZE, 0);
            this.ctx.lineTo(col * BLOCK_SIZE, BOARD_HEIGHT);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let row = 0; row <= VISIBLE_ROWS; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * BLOCK_SIZE);
            this.ctx.lineTo(BOARD_WIDTH, row * BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        
        // Draw block border
        this.ctx.strokeStyle = 'rgb(255, 255, 255)';
        this.ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
    
    drawGhostPiece(piece, ghostY) {
        const shape = piece.getShape();
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = ghostY + y;
                    
                    // Only draw if within the visible area
                    if (boardY >= ROWS - VISIBLE_ROWS) {
                        // Draw ghost piece with solid grey color
                        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
                        this.ctx.fillRect(
                            boardX * BLOCK_SIZE,
                            (boardY - (ROWS - VISIBLE_ROWS)) * BLOCK_SIZE,
                            BLOCK_SIZE,
                            BLOCK_SIZE
                        );
                    }
                }
            }
        }
    }
    
    drawHoldBox() {
        const boxWidth = 120;
        const boxHeight = 120;
        const controlsHeight = 300;
        const spacing = 40;
        const totalH = boxHeight + controlsHeight + spacing;

        const boxX = BOARD_WIDTH + 20;
        const boxY = (BOARD_HEIGHT - totalH) / 2;

        
        // Draw box background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw box border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw "HOLD" text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Hold', boxX + boxWidth / 2, boxY - 15);
    }
    
    drawHoldPiece(pieceType) {
        if (!pieceType) return;
        
        const tetromino = TETROMINOS[pieceType];
        const shape = tetromino.shape;
        const color = COLORS[tetromino.color];
        
        const boxWidth = 120;
        const boxHeight = 120;
        const controlsHeight = 300;
        const spacing = 40;
        const totalH = boxHeight + controlsHeight + spacing;

        const boxX = BOARD_WIDTH + 20;
        const boxY = (BOARD_HEIGHT - totalH) / 2;
        
        // Calculate block size for the hold piece (smaller than game blocks)
        const holdBlockSize = 20;
        
        // Calculate starting position to center the piece in the hold box
        const startX = boxX + (boxWidth - shape[0].length * holdBlockSize) / 2;
        const startY = boxY + (boxWidth - shape.length * holdBlockSize) / 2;
        
        // Draw the hold piece
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    // Draw block
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(
                        startX + x * holdBlockSize,
                        startY + y * holdBlockSize,
                        holdBlockSize,
                        holdBlockSize
                    );
                    
                    // Draw block border
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.strokeRect(
                        startX + x * holdBlockSize,
                        startY + y * holdBlockSize,
                        holdBlockSize,
                        holdBlockSize
                    );
                }
            }
        }
    }

    drawPause() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw "PAUSED" text
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        // Draw instructions
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press ESC or F1 to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('OR', this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press Enter to restart', this.canvas.width / 2, this.canvas.height / 2 + 110);
    }

    // Next piece box
    drawNextBox() {
        const boxWidth = 120;
        const boxHeight = 120;
        const controlsHeight = 300;
        const spacing = 40;
        const totalH = boxHeight + controlsHeight + spacing;

        const holdX = BOARD_WIDTH + 20;
        const holdY = (BOARD_HEIGHT - totalH) / 2;

        const boxX = holdX;
        const boxY = holdY + boxHeight + 40;
        
        // Draw box background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw box border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Draw "HOLD" text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Next Piece', boxX + boxWidth / 2, boxY - 15);
    }

    drawNextPiece(pieceType) {
        if (!pieceType) return;
        
        const tetromino = TETROMINOS[pieceType];
        const shape = tetromino.shape;
        const color = COLORS[tetromino.color];
        
        const boxWidth = 120;
        const boxHeight = 120;
        const controlsHeight = 300;
        const spacing = 40;
        const totalH = boxHeight + controlsHeight + spacing;

        const holdX = BOARD_WIDTH + 20;
        const holdY = (BOARD_HEIGHT - totalH) / 2;

        const boxX = holdX;
        const boxY = holdY + boxHeight + 40;
        
        // Calculate block size for the hold piece (smaller than game blocks)
        const holdBlockSize = 20;
        
        // Calculate starting position to center the piece in the hold box
        const startX = boxX + (boxWidth - shape[0].length * holdBlockSize) / 2;
        const startY = boxY + (boxWidth - shape.length * holdBlockSize) / 2;
        
        // Draw the hold piece
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    // Draw block
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(
                        startX + x * holdBlockSize,
                        startY + y * holdBlockSize,
                        holdBlockSize,
                        holdBlockSize
                    );
                    
                    // Draw block border
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.strokeRect(
                        startX + x * holdBlockSize,
                        startY + y * holdBlockSize,
                        holdBlockSize,
                        holdBlockSize
                    );
                }
            }
        }
    }

    drawGameOver(score, level, lines) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // "PAUSED" text
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Stats
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText(`Level: ${level}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.fillText(`Lines: ${lines}`, this.canvas.width / 2, this.canvas.height / 2 + 70);

        // Restart
        this.ctx.font = 'italic 20px Arial';
        this.ctx.fillText('Press Enter to restart', this.canvas.width / 2, this.canvas.height / 2 + 150);
    }
}
