const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rows = 10;
const cols = 4;
const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];

const r = 20; // circle radius
const spacing = 10;
const boardOffset = {x: 50, y: 50};
const paletteOffset = {x: 50, y: 600};

const secret = [];
let guesses = Array.from({length: rows}, () => Array(cols).fill(null));
let results = Array.from({length: rows}, () => null);
let activeRow = 0;
let selectedColor = 0;

function dist(ax, ay, bx, by) {
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw guess grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = boardOffset.x + col * (r * 2 + spacing);
            const y = boardOffset.y + row * (r * 2 + spacing);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = guesses[row][col] !== null ? colors[guesses[row][col]] : '#ddd';
            ctx.fill();
            ctx.stroke();
        }
        if (results[row]) {
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            const textX = boardOffset.x + cols * (r * 2 + spacing) + 20;
            const textY = boardOffset.y + row * (r * 2 + spacing) + r / 2;
            ctx.fillText(`${results[row].correct}B ${results[row].near}W`, textX, textY);
        }
    }
    // palette
    for (let i = 0; i < colors.length; i++) {
        const x = paletteOffset.x + i * (r * 2 + spacing);
        const y = paletteOffset.y;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = selectedColor === i ? '#000' : '#555';
        ctx.lineWidth = selectedColor === i ? 3 : 1;
        ctx.stroke();
    }
    // check button
    const btnX = paletteOffset.x + colors.length * (r * 2 + spacing) + 20;
    const btnY = paletteOffset.y - r;
    ctx.fillStyle = '#ccc';
    ctx.fillRect(btnX, btnY, 80, r * 2);
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.fillText('Check', btnX + 10, btnY + r + 5);
}

function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // palette selection
    for (let i = 0; i < colors.length; i++) {
        const px = paletteOffset.x + i * (r * 2 + spacing);
        const py = paletteOffset.y;
        if (dist(x, y, px, py) < r) {
            selectedColor = i;
            drawBoard();
            return;
        }
    }
    // check button
    const btnX = paletteOffset.x + colors.length * (r * 2 + spacing) + 20;
    const btnY = paletteOffset.y - r;
    if (x >= btnX && x <= btnX + 80 && y >= btnY && y <= btnY + r * 2) {
        checkGuess();
        drawBoard();
        return;
    }
    // board cell
    if (activeRow < rows) {
        for (let c = 0; c < cols; c++) {
            const cx = boardOffset.x + c * (r * 2 + spacing);
            const cy = boardOffset.y + activeRow * (r * 2 + spacing);
            if (dist(x, y, cx, cy) < r) {
                guesses[activeRow][c] = selectedColor;
                drawBoard();
                return;
            }
        }
    }
}

function checkGuess() {
    const guess = guesses[activeRow];
    if (guess.some(v => v === null)) return; // incomplete
    const secretCopy = secret.slice();
    let correct = 0;
    let near = 0;
    const tempGuess = guess.slice();
    for (let i = 0; i < cols; i++) {
        if (tempGuess[i] === secretCopy[i]) {
            correct++;
            secretCopy[i] = null;
            tempGuess[i] = null;
        }
    }
    for (let i = 0; i < cols; i++) {
        if (tempGuess[i] !== null) {
            const idx = secretCopy.indexOf(tempGuess[i]);
            if (idx !== -1) {
                near++;
                secretCopy[idx] = null;
            }
        }
    }
    results[activeRow] = { correct, near };
    if (correct === cols) {
        alert('You win!');
        activeRow = rows; // end game
    } else {
        activeRow++;
        if (activeRow >= rows) {
            const answer = secret.map(i => colors[i]).join(', ');
            alert('Game over! The code was ' + answer);
        }
    }
}

function init() {
    for (let i = 0; i < cols; i++) {
        secret.push(Math.floor(Math.random() * colors.length));
    }
    drawBoard();
}

canvas.addEventListener('click', handleClick);
init();
