// Tetromino definitions
const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: 'I'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: 'O'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 'T'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: 'S'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: 'Z'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 'J'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 'L'
    }
};

// Tetromino class to manage active piece
class Tetromino {
    constructor(type) {
        this.type = type;
        this.tetromino = TETROMINOS[type];
        this.color = this.tetromino.color;
        this.shape = this.tetromino.shape;
        
        // Position on the board
        // I and O spawn in the middle columns
        // The rest spawn in the left-middle columns
        if (type === 'I' || type === 'O') {
            this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        } else {
            this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2) - 1;
        }
        
        // Spawn above the visible playfield
        // Row 21 for I, and 21/22 for all other tetriminoes
        this.y = type === 'I' ? 20 : 21;
        
        // Rotation state (0, 1, 2, 3)
        this.rotation = 0;
    }
    
    // Get the current shape based on rotation
    getShape() {
        return this.rotate(this.shape, this.rotation);
    }
    
    // Rotate a matrix (shape) clockwise
    rotate(matrix, rotation) {
        // We need to rotate the matrix multiple times based on rotation value
        let result = [...matrix];
        
        for (let i = 0; i < rotation; i++) {
            // Create a new rotated matrix
            const rotated = [];
            for (let y = 0; y < result[0].length; y++) {
                const newRow = [];
                for (let x = result.length - 1; x >= 0; x--) {
                    newRow.push(result[x][y]);
                }
                rotated.push(newRow);
            }
            result = rotated;
        }
        
        return result;
    }
    
    // Move the tetromino
    move(direction) {
        if (direction === 'left') {
            this.x--;
        } else if (direction === 'right') {
            this.x++;
        } else if (direction === 'down') {
            this.y++;
        }
    }
    
    // Rotate the tetromino
    rotateClockwise() {
        this.rotation = (this.rotation + 1) % 4;
    }
    
    rotateCounterClockwise() {
        this.rotation = (this.rotation + 3) % 4; // +3 is equivalent to -1 in modulo 4
    }
} 