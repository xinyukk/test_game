// --- 游戏管理器 ---
const gameManager = {
    currentGame: null,
    state: {},

    requestGame(gameId) {
        app.send({ type: 'GAME_LAUNCH', gameId: gameId });
        this.loadGame(gameId);
    },

    loadGame(gameId) {
        const gameDef = GAMES.find(g => g.id === gameId);
        if(!gameDef) {
            app.showToast("游戏不存在", "⚠️");
            return;
        }
        
        document.getElementById('game-title').innerText = gameDef.name;
        app.switchScreen(SCREENS.GAME);
        
        const board = document.getElementById('game-board');
        if (!board) return;
        
        board.innerHTML = '';
        this.currentGame = gameId;
        
        if(this.games[gameId]) {
            this.games[gameId].init(board);
        } else {
            app.showToast("游戏加载失败", "⚠️");
        }
    },

    handleRemoteData(payload) {
        if(this.currentGame && this.games[this.currentGame]) {
            this.games[this.currentGame].onData(payload);
        }
    },

    sendGameData(payload) {
        app.send({ type: 'GAME_DATA', payload });
    },

    showResult(type, customText = null, showPunish = false) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('result-title');
        const desc = document.getElementById('result-desc');
        const punishBox = document.getElementById('punishment-box');
        const punishText = document.getElementById('result-punishment');
        
        if (!modal || !title || !desc || !punishBox || !punishText) {
            console.error('Missing result modal elements');
            return;
        }
        
        modal.classList.remove('hidden');
        
        // 默认文案
        if(type === 'win') {
            title.innerText = "你赢啦!";
            title.className = "text-2xl font-black mb-2 text-green-600";
            desc.innerText = "太厉害了！";
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
        } else if(type === 'lose') {
            title.innerText = "再接再厉";
            title.className = "text-2xl font-black mb-2 text-gray-700";
            desc.innerText = "差一点点就赢了~";
        } else if(type === 'draw') {
            title.innerText = "完美同步";
            title.className = "text-2xl font-black mb-2 text-pink-500";
            desc.innerText = "你们的默契令人羡慕！";
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 }, colors: ['#FF2D55', '#FFCC00'] });
            }
        }

        if(customText) desc.innerText = customText;

        if(showPunish) {
            punishBox.classList.remove('hidden');
            punishText.innerText = SWEET_ACTIONS[Math.floor(Math.random() * SWEET_ACTIONS.length)];
        } else {
            punishBox.classList.add('hidden');
        }
    },

    restartGame() {
        const modal = document.getElementById('result-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        if (this.currentGame) {
            app.send({ type: 'GAME_LAUNCH', gameId: this.currentGame });
            this.loadGame(this.currentGame);
        }
    },

    exitGame(notify = true) {
        if(notify) {
            app.send({ type: 'GAME_EXIT' });
        }
        
        const modal = document.getElementById('result-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        app.switchScreen(SCREENS.LOBBY);
        this.currentGame = null;
        
        // Stop any audio
        if(window.audioCtx) {
            try {
                window.audioCtx.close();
            } catch (e) {
                console.error('Error closing audio context:', e);
            }
        }
        window.audioCtx = null;
    },

    // --- 游戏逻辑实现 ---
    games: {}
};