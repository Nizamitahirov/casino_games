// --- GLOBAL HELPER FUNCTIONS & STATE ---
const playerBalanceElement = document.getElementById('playerBalance');
let playerBalance = 1000;

function updateBalance(amount, isWin = false) {
    if (!isWin && amount < 0 && playerBalance + amount < 0) { // amount < 0 for betting
        // This alert is now mostly handled by individual game bet checks
        // but good as a fallback.
        // alert("Balansınızda kifayət qədər vəsait yoxdur!");
        return false;
    }
    playerBalance += amount;
    playerBalanceElement.textContent = playerBalance;
    playerBalanceElement.style.transition = 'none';
    playerBalanceElement.style.color = amount > 0 ? 'var(--neon-green)' : (amount < 0 ? 'var(--casino-red-vibrant)' : '');
    playerBalanceElement.style.transform = 'scale(1.15)';
    playerBalanceElement.style.textShadow = amount > 0 ? '0 0 8px var(--neon-green)' : (amount < 0 ? '0 0 8px var(--casino-red-vibrant)' : 'none');


    setTimeout(() => {
        playerBalanceElement.style.transition = 'color 0.5s, transform 0.5s, text-shadow 0.5s';
        playerBalanceElement.style.color = 'var(--neon-green)';
        playerBalanceElement.style.transform = 'scale(1)';
        playerBalanceElement.style.textShadow = '0 0 5px var(--neon-green)';
    }, 150);
    setTimeout(() => {
        playerBalanceElement.style.transition = 'none';
    }, 650);
    return true;
}

function getPlayerBalance() {
    return playerBalance;
}

// --- ADD FUNDS MODAL LOGIC ---
const addFundsButton = document.getElementById('addFundsButton');
const addFundsModal = document.getElementById('addFundsModal');
const closeButton = document.querySelector('#addFundsModal .close-button');
const confirmDepositButton = document.getElementById('confirmDepositButton');
const depositAmountInput = document.getElementById('depositAmount');
const modalMessage = document.getElementById('modalMessage');

if (addFundsButton) {
    addFundsButton.onclick = function() {
        addFundsModal.style.display = "block";
        depositAmountInput.value = ''; // Clear previous amount
        modalMessage.textContent = ''; // Clear previous message
        document.getElementById('cardNumber').value = ''; // Clear fake fields
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCVV').value = '';
    }
}
if (closeButton) {
    closeButton.onclick = function() {
        addFundsModal.style.display = "none";
    }
}
window.onclick = function(event) {
    if (event.target == addFundsModal) {
        addFundsModal.style.display = "none";
    }
}
if (confirmDepositButton) {
    confirmDepositButton.onclick = function() {
        const amount = parseInt(depositAmountInput.value);
        if (isNaN(amount) || amount <= 0) {
            modalMessage.textContent = "Zəhmət olmasa, düzgün məbləğ daxil edin.";
            modalMessage.className = 'message small lose';
            return;
        }
        // Fake card validation (just check if something is entered for show)
        const cardNumber = document.getElementById('cardNumber').value;
        if (cardNumber.length < 10) { // Arbitrary length
            modalMessage.textContent = "Zəhmət olmasa, (fake) kart nömrəsini daxil edin.";
            modalMessage.className = 'message small lose';
            return;
        }

        updateBalance(amount, true); // true to indicate it's a deposit, not a win
        modalMessage.textContent = `$${amount} balansınıza uğurla əlavə olundu!`;
        modalMessage.className = 'message small win';
        setTimeout(() => {
            addFundsModal.style.display = "none";
        }, 1500);
    }
}


// --- LEADERBOARD LOGIC ---
const leaderboardTableBody = document.querySelector('#leaderboardTable tbody');
const playerNameInput = document.getElementById('playerName');
const addPlayerToLeaderboardButton = document.getElementById('addPlayerToLeaderboard');
const resetLeaderboardButton = document.getElementById('resetLeaderboard');
const LEADERBOARD_KEY = 'nizamiCasinoLeaderboard_v2';

function getLeaderboard() {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
}
function saveLeaderboard(board) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
}
function renderLeaderboard() {
    if (!leaderboardTableBody) return;
    const board = getLeaderboard();
    board.sort((a, b) => b.score - a.score);
    leaderboardTableBody.innerHTML = '';
    board.slice(0, 10).forEach((entry, index) => {
        const row = leaderboardTableBody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = entry.name;
        row.insertCell().textContent = `$${entry.score}`;
    });
}
if (addPlayerToLeaderboardButton) {
    addPlayerToLeaderboardButton.addEventListener('click', () => { /* ... (previous logic mostly same) ... */
        const playerName = playerNameInput.value.trim();
        const currentBalance = getPlayerBalance();
        if (!playerName) { alert("Zəhmət olmasa, adınızı daxil edin."); return; }

        const board = getLeaderboard();
        const existingPlayerIndex = board.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());

        if (existingPlayerIndex > -1) {
            if (currentBalance > board[existingPlayerIndex].score) {
                board[existingPlayerIndex].score = currentBalance;
                alert(`${playerName}, xalınız yeniləndi: $${currentBalance}`);
            } else {
                alert(`${playerName}, mövcud xalınız ($${board[existingPlayerIndex].score}) daha yüksəkdir və ya bərabərdir.`);
                playerNameInput.value = ''; return;
            }
        } else {
            board.push({ name: playerName, score: currentBalance });
            alert(`${playerName}, xalınız ($${currentBalance}) liderlər cədvəlinə əlavə olundu!`);
        }
        saveLeaderboard(board);
        renderLeaderboard();
        playerNameInput.value = '';
    });
}
if (resetLeaderboardButton) {
    resetLeaderboardButton.addEventListener('click', () => { /* ... (previous logic same) ... */
        if (confirm("Liderlər cədvəlini sıfırlamaq istədiyinizə əminsiniz?")) {
            localStorage.removeItem(LEADERBOARD_KEY);
            renderLeaderboard();
            alert("Liderlər cədvəli sıfırlandı.");
        }
    });
}


// --- SLOT MACHINE LOGIC ---
const slotReel1 = document.getElementById('reel1');
const slotReel2 = document.getElementById('reel2');
const slotReel3 = document.getElementById('reel3');
const spinButton = document.getElementById('spinButton');
const slotBetInput = document.getElementById('slotBet');
const slotMessage = document.getElementById('slotMessage');

const slotSymbols = ['🍒', '🍋', '🍊', '🍉', '🔔', '⭐', '💎', '💰']; // Cherry, Lemon, Orange, Watermelon, Bell, Star, Diamond, MoneyBag
const slotPayouts = { // Payout multiplier
    '🍒🍒🍒': 10, '🍋🍋🍋': 15, '🍊🍊🍊': 20, '🍉🍉🍉': 25,
    '🔔🔔🔔': 60, '⭐⭐⭐': 80, '💎💎💎': 120, '💰💰💰': 250,
};

function createSlotSymbolTrack(reelElement) { /* ... (previous logic same) ... */
    if (!reelElement) return;
    let track = reelElement.querySelector('.symbol-track');
    if (track) track.remove();
    track = document.createElement('div');
    track.className = 'symbol-track';
    let shuffledSymbols = [...slotSymbols].sort(() => 0.5 - Math.random());
    shuffledSymbols.forEach(symbol => { const span = document.createElement('span'); span.textContent = symbol; track.appendChild(span); });
    shuffledSymbols.slice(0, 3).forEach(symbol => { const span = document.createElement('span'); span.textContent = symbol; track.appendChild(span); });
    reelElement.appendChild(track);
    return track;
}

const slotReelElements = [slotReel1, slotReel2, slotReel3];
if (slotReel1 && slotReel2 && slotReel3) {
    slotReelElements.forEach(r => { if (r) createSlotSymbolTrack(r); });
}

function spinSingleReel(reelElement, finalSymbolIndex) { /* ... (previous logic same, adjust duration if needed) ... */
    return new Promise(resolve => {
        if (!reelElement) { resolve(); return; }
        const track = createSlotSymbolTrack(reelElement);
        reelElement.classList.add('spinning');
        const spinDuration = 1000 + Math.random() * 800; // Slightly longer, smoother feel

        setTimeout(() => {
            reelElement.classList.remove('spinning');
            if (track) track.remove();
            reelElement.textContent = slotSymbols[finalSymbolIndex];
            resolve();
        }, spinDuration);
    });
}

if (spinButton) {
    spinButton.addEventListener('click', () => { /* ... (previous logic mostly same, update messages) ... */
        const betAmount = parseInt(slotBetInput.value);
        if (isNaN(betAmount) || betAmount <= 0) {
            slotMessage.textContent = "Düzgün mərc daxil edin!"; slotMessage.className = 'message lose'; return;
        }
        if (getPlayerBalance() < betAmount) {
            slotMessage.textContent = "Kifayət qədər balansınız yoxdur!"; slotMessage.className = 'message lose'; return;
        }
        if (!updateBalance(-betAmount)) { return; } // updateBalance already handles alerts for insufficient funds

        slotMessage.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Fırlanır...`; slotMessage.className = 'message';
        spinButton.disabled = true;

        const result1 = Math.floor(Math.random() * slotSymbols.length);
        const result2 = Math.floor(Math.random() * slotSymbols.length);
        const result3 = Math.floor(Math.random() * slotSymbols.length);

        Promise.all([
            spinSingleReel(slotReel1, result1), spinSingleReel(slotReel2, result2), spinSingleReel(slotReel3, result3)
        ]).then(() => {
            const finalSymbols = [slotSymbols[result1], slotSymbols[result2], slotSymbols[result3]];
            if(slotReel1) slotReel1.textContent = finalSymbols[0];
            if(slotReel2) slotReel2.textContent = finalSymbols[1];
            if(slotReel3) slotReel3.textContent = finalSymbols[2];
            const combination = finalSymbols.join('');
            let winnings = 0;

            if (slotPayouts[combination]) {
                winnings = slotPayouts[combination] * betAmount;
                slotMessage.innerHTML = `<i class="fas fa-star"></i> QAZANDINIZ! ${finalSymbols.join(' ')} (+${winnings}$) <i class="fas fa-star"></i>`;
                slotMessage.className = 'message win';
                updateBalance(winnings, true);
            } else if (finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2] || finalSymbols[0] === finalSymbols[2]) {
                winnings = Math.floor(betAmount * 2); // Two of a kind pays 2x bet
                 if (winnings > 0) {
                    slotMessage.innerHTML = `<i class="fas fa-thumbs-up"></i> İkili Uduş! (+${winnings}$)`;
                    slotMessage.className = 'message win'; updateBalance(winnings, true);
                 } else {
                    slotMessage.innerHTML = `<i class="fas fa-times-circle"></i> Uduzduz. Yenidən cəhd edin!`; slotMessage.className = 'message lose';
                 }
            } else {
                slotMessage.innerHTML = `<i class="fas fa-times-circle"></i> Uduzduz. Yenidən cəhd edin!`; slotMessage.className = 'message lose';
            }
            spinButton.disabled = false;
        });
    });
}


// --- ROULETTE LOGIC (SVG BASED) ---
const rouletteWheelSVG = document.getElementById('rouletteWheelSVG');
const rouletteWheelGroup = document.getElementById('rouletteWheelGroup');
const rouletteResultDisplay = document.getElementById('rouletteResult');
const spinRouletteButton = document.getElementById('spinRouletteButton');
const rouletteBetAmountInput = document.getElementById('rouletteBetAmount');
const rouletteNumberBetInput = document.getElementById('rouletteNumberBet');
const rouletteBetOptionButtons = document.querySelectorAll('.roulette-controls .bet-option');
const rouletteMessage = document.getElementById('rouletteMessage');

const rouletteSegmentsData = [
    { num: 0, color: 'var(--neon-green)' }, { num: 1, color: 'var(--casino-red-vibrant)' }, { num: 2, color: '#333' }, // Black
    { num: 3, color: 'var(--casino-red-vibrant)' }, { num: 4, color: '#333' }, { num: 5, color: 'var(--casino-red-vibrant)' },
    { num: 6, color: '#333' }, { num: 7, color: 'var(--casino-red-vibrant)' }, { num: 8, color: '#333' },
    { num: 9, color: 'var(--casino-red-vibrant)' }, { num: 10, color: '#333' }
];
const ROULETTE_TOTAL_SEGMENTS = rouletteSegmentsData.length;
const ROULETTE_ANGLE_PER_SEGMENT = 360 / ROULETTE_TOTAL_SEGMENTS;
let currentRouletteBet = null;
let isRouletteSpinning = false;

function getArcPath(startX, startY, endX, endY, radius, largeArcFlag = 0) {
    return `M 0 0 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
}

function createRouletteWheel() {
    if (!rouletteWheelGroup) return;
    rouletteWheelGroup.innerHTML = ''; // Clear previous wheel

    const radius = 140; // SVG viewBox is 300x300, center is 150,150. Radius leaves space for border/glow.
    
    for (let i = 0; i < ROULETTE_TOTAL_SEGMENTS; i++) {
        const segmentData = rouletteSegmentsData[i];
        const startAngle = i * ROULETTE_ANGLE_PER_SEGMENT;
        const endAngle = (i + 1) * ROULETTE_ANGLE_PER_SEGMENT;

        // Convert angles to radians for Math.sin/cos
        const startRad = (startAngle - 90) * Math.PI / 180; // -90 to start from top
        const endRad = (endAngle - 90) * Math.PI / 180;

        const x1 = radius * Math.cos(startRad);
        const y1 = radius * Math.sin(startRad);
        const x2 = radius * Math.cos(endRad);
        const y2 = radius * Math.sin(endRad);
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", getArcPath(x1, y1, x2, y2, radius, ROULETTE_ANGLE_PER_SEGMENT > 180 ? 1 : 0));
        path.setAttribute("fill", segmentData.color);
        path.setAttribute("stroke", "rgba(255,255,255,0.1)"); // Light border between segments
        path.setAttribute("stroke-width", "1");
        rouletteWheelGroup.appendChild(path);

        // Add text
        const textAngle = startAngle + ROULETTE_ANGLE_PER_SEGMENT / 2;
        const textRad = (textAngle - 90) * Math.PI / 180;
        const textRadius = radius * 0.75; // Position text inside the segment
        const textX = textRadius * Math.cos(textRad);
        const textY = textRadius * Math.sin(textRad);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);
        text.setAttribute("transform", `rotate(${textAngle} ${textX} ${textY})`); // Rotate text with segment
        if (segmentData.color === 'var(--neon-green)' || segmentData.color === 'var(--casino-red-vibrant)') {
            text.setAttribute("fill", "#111"); // Dark text on light/bright colors
        } else {
            text.setAttribute("fill", "var(--casino-light-text)");
        }
        text.textContent = segmentData.num;
        rouletteWheelGroup.appendChild(text);
    }
     // Add a center circle
    const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerCircle.setAttribute("cx", "0");
    centerCircle.setAttribute("cy", "0");
    centerCircle.setAttribute("r", "20"); // Radius of center circle
    centerCircle.setAttribute("fill", "var(--casino-gold)");
    centerCircle.setAttribute("stroke", "var(--casino-dark-bg)");
    centerCircle.setAttribute("stroke-width", "3");
    rouletteWheelGroup.appendChild(centerCircle);
}
createRouletteWheel(); // Initial wheel creation

rouletteBetOptionButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (isRouletteSpinning) return;
        currentRouletteBet = { type: button.dataset.betType, value: button.dataset.value };
        rouletteBetOptionButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        if(rouletteNumberBetInput) rouletteNumberBetInput.value = '';
        if(rouletteMessage) {
            rouletteMessage.textContent = `Mərciniz: ${button.textContent}`; rouletteMessage.className = 'message';
        }
    });
});

if (rouletteNumberBetInput) {
    rouletteNumberBetInput.addEventListener('input', () => {
        if (isRouletteSpinning) return;
        const numVal = parseInt(rouletteNumberBetInput.value);
        if (!isNaN(numVal) && numVal >= 0 && numVal <= 10) {
            currentRouletteBet = { type: 'number', value: numVal };
            rouletteBetOptionButtons.forEach(btn => btn.classList.remove('selected'));
            if(rouletteMessage) {
                rouletteMessage.textContent = `Mərciniz: Nömrə ${numVal}`; rouletteMessage.className = 'message';
            }
        } else { currentRouletteBet = null; }
    });
}

let currentRotation = 0;
if (spinRouletteButton) {
    spinRouletteButton.addEventListener('click', () => {
        if (isRouletteSpinning) return;
        const betAmount = parseInt(rouletteBetAmountInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            rouletteMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Düzgün mərc məbləği daxil edin.`; rouletteMessage.className = 'message lose'; return;
        }
        if (!currentRouletteBet) {
            rouletteMessage.innerHTML = `<i class="fas fa-hand-paper"></i> Zəhmət olmasa, bir mərc seçin.`; rouletteMessage.className = 'message lose'; return;
        }
         if (getPlayerBalance() < betAmount) {
            rouletteMessage.innerHTML = `<i class="fas fa-wallet"></i> Kifayət qədər balansınız yoxdur!`; rouletteMessage.className = 'message lose'; return;
        }
        if (!updateBalance(-betAmount)) { return; }

        isRouletteSpinning = true;
        spinRouletteButton.disabled = true;
        rouletteBetOptionButtons.forEach(b => b.disabled = true);
        if(rouletteNumberBetInput) rouletteNumberBetInput.disabled = true;
        if(rouletteResultDisplay) rouletteResultDisplay.textContent = "Fırlanır...";
        rouletteMessage.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Nəticə gözlənilir...`; rouletteMessage.className = 'message';

        const randomIndex = Math.floor(Math.random() * ROULETTE_TOTAL_SEGMENTS);
        const winningSegmentData = rouletteSegmentsData[randomIndex];

        // Calculate target rotation:
        // Each spin is at least 3-5 full rotations + angle to winning segment
        const fullRotations = (3 + Math.floor(Math.random() * 3)) * 360;
        // Angle to the middle of the target segment. Pointer is at 0 degrees (top)
        // We want the middle of the segment to align with the pointer.
        const angleToSegmentCenter = (randomIndex * ROULETTE_ANGLE_PER_SEGMENT) + (ROULETTE_ANGLE_PER_SEGMENT / 2);
        // We need to rotate clockwise (negative for SVG transform rotate) to bring segment to top.
        const targetAngle = -angleToSegmentCenter;
        
        currentRotation += fullRotations - (currentRotation % 360) + targetAngle ; // Add to current rotation, ensuring it lands correctly

        rouletteWheelGroup.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Ensure transition is set
        rouletteWheelGroup.style.transform = `rotate(${currentRotation}deg)`;

        setTimeout(() => {
            if(rouletteResultDisplay) rouletteResultDisplay.innerHTML = `Nəticə: <strong style="color:${winningSegmentData.color}; text-shadow: 0 0 3px ${winningSegmentData.color};">${winningSegmentData.num}</strong>`;
            let winnings = 0; let win = false;
            const winningColor = winningSegmentData.color === 'var(--neon-green)' ? 'green' : (winningSegmentData.color === 'var(--casino-red-vibrant)' ? 'red' : 'black');

            if (currentRouletteBet.type === 'color' && currentRouletteBet.value === winningColor) {
                winnings = betAmount * 2; win = true;
            } else if (currentRouletteBet.type === 'parity') {
                const isEven = winningSegmentData.num % 2 === 0 && winningSegmentData.num !== 0;
                const isOdd = winningSegmentData.num % 2 !== 0;
                if ((currentRouletteBet.value === 'even' && isEven) || (currentRouletteBet.value === 'odd' && isOdd)) {
                    winnings = betAmount * 2; win = true;
                }
            } else if (currentRouletteBet.type === 'number' && currentRouletteBet.value === winningSegmentData.num) {
                winnings = betAmount * (ROULETTE_TOTAL_SEGMENTS - 2); win = true; // e.g. for 11 numbers, 9:1 payout
            }

            if (win) {
                rouletteMessage.innerHTML = `<i class="fas fa-trophy"></i> QAZANDINIZ! +$${winnings}`; rouletteMessage.className = 'message win';
                updateBalance(winnings, true);
            } else {
                rouletteMessage.innerHTML = `<i class="fas fa-heart-broken"></i> Uduzduz. Yenidən cəhd edin.`; rouletteMessage.className = 'message lose';
            }

            isRouletteSpinning = false;
            spinRouletteButton.disabled = false;
            rouletteBetOptionButtons.forEach(b => b.disabled = false);
            if(rouletteNumberBetInput) rouletteNumberBetInput.disabled = false;
            rouletteBetOptionButtons.forEach(btn => btn.classList.remove('selected'));
            currentRouletteBet = null;
        }, 5100); // Slightly after CSS transition ends
    });
}

// --- TAB SWITCHING LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const gameContents = document.querySelectorAll('.game-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isRouletteSpinning && button.dataset.game !== 'roulette') {
                 // Prevent tab switching if roulette is spinning, unless it's to the roulette tab itself
                // (though ideally, all controls should be disabled anyway)
                alert("Ruletka fırlanarkən başqa oyuna keçə bilməzsiniz.");
                return;
            }
            tabButtons.forEach(btn => btn.classList.remove('active'));
            gameContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const gameId = button.getAttribute('data-game');
            const activeGameContent = document.getElementById(gameId);
            if (activeGameContent) activeGameContent.classList.add('active');
            if (gameId === 'leaderboard-section') renderLeaderboard();
             if (gameId === 'roulette' && !rouletteWheelGroup.childNodes.length) {
                createRouletteWheel(); // Recreate if it was somehow cleared
            }
        });
    });
    if (document.getElementById('leaderboard-section') && document.getElementById('leaderboard-section').classList.contains('active')) {
        renderLeaderboard();
    }
     // Set initial balance text shadow
    playerBalanceElement.style.color = 'var(--neon-green)';
    playerBalanceElement.style.textShadow = '0 0 5px var(--neon-green)';
});
