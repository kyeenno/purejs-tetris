const COLS = 10;
const ROWS = 40;
const VISIBLE_ROWS = 20;
const BLOCK_SIZE = 30;
const BOARD_WIDTH = COLS * BLOCK_SIZE;
const BOARD_HEIGHT = VISIBLE_ROWS * BLOCK_SIZE;

const COLORS = {
    I: '#00f0f0', // Cyan
    O: '#f0f000', // Yellow
    T: '#a000f0', // Purple
    S: '#00f000', // Green
    Z: '#f00000', // Red
    J: '#0000f0', // Blue
    L: '#f0a000', // Orange
    empty: 'transparent', // Transparent instead of blue
    ghost: '#1a1a1a', // Dark gray
};

// Wall kick data for J, L, S, T, Z tetrominoes
const WALL_KICK_JLSTZ = {
    "0>>1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    "1>>0": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    "1>>2": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    "2>>1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    "2>>3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    "3>>2": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    "3>>0": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    "0>>3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
};

// I-piece needs special wall kick data (rotates differently)
const WALL_KICK_I = {
    "0>>1": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    "1>>0": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    "1>>2": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
    "2>>1": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    "2>>3": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    "3>>2": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    "3>>0": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    "0>>3": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
};

// O piece doesn't need complex wall kicks (it rotates symmetrically)
const WALL_KICK_O = {
    "0>>1": [[0, 0]],
    "1>>0": [[0, 0]],
    "1>>2": [[0, 0]],
    "2>>1": [[0, 0]],
    "2>>3": [[0, 0]],
    "3>>2": [[0, 0]],
    "3>>0": [[0, 0]],
    "0>>3": [[0, 0]]
};

// Function to get the right kick data for each piece
function getWallKickData(pieceType, initialRotation, newRotation) {
    const key = `${initialRotation}>>${newRotation}`;
    
    if (pieceType === 'I') {
        return WALL_KICK_I[key];
    } else if (pieceType === 'O') {
        return WALL_KICK_O[key];
    } else {
        return WALL_KICK_JLSTZ[key]; // For J, L, S, T, Z pieces
    }
}