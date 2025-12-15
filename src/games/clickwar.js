// 5. 爱心填充 (Heart Click War)
gameManager.games.clickwar = {
    myScore: 0,
    oppScore: 0,
    timer: 30, // 30 seconds
    interval: null,
    
    init(container) {
        container.innerHTML = `
            <div class="w-full max-w-md text-center">
                <div class="mb-6">
                    <div class="text-8xl mb-4" id="heart-display">❤️</div>
                    <div class="text-2xl font-bold text-gray-800 mb-2" id="timer">00:30</div>
                    <p class="text-gray-500">点击爱心，比比谁的手速更快！</p>
                </div>
                
                <div class="grid grid-cols-2 gap-6 mb-8">
                    <div class="ios-card p-4 rounded-2xl">
                        <p class="text-xs text-gray-400 uppercase tracking-wider">你的分数</p>
                        <p id="my-score" class="text-3xl font-black text-blue-500">0</p>
                    </div>
                    <div class="ios-card p-4 rounded-2xl">
                        <p class="text-xs text-gray-400 uppercase tracking-wider">对方分数</p>
                        <p id="opp-score" class="text-3xl font-black text-pink-500">0</p>
                    </div>
                </div>
                
                <button id="click-btn" onclick="gameManager.games.clickwar.click()" 
                    class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-400 to-pink-500 shadow-lg active:scale-95 transition-transform flex items-center justify-center text-6xl touch-none">
                    ❤️
                </button>
            </div>
        `;
        
        this.startTimer();
        this.bindClickEvent();
    },
    
    bindClickEvent() {
        const btn = document.getElementById('click-btn');
        if (btn) {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.click();
            });
        }
    },
    
    click() {
        this.myScore++;
        const myScoreEl = document.getElementById('my-score');
        if (myScoreEl) {
            myScoreEl.innerText = this.myScore;
        }
        
        const btn = document.getElementById('click-btn');
        if (btn) {
            btn.classList.add('scale-90');
            setTimeout(() => btn.classList.remove('scale-90'), 100);
        }
        
        gameManager.sendGameData({ type: 'CLICK', score: this.myScore });
    },
    
    startTimer() {
        this.timer = 30;
        this.updateTimerDisplay();
        
        this.interval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();
            
            if(this.timer <= 0) {
                this.endGame();
            }
        }, 1000);
    },
    
    updateTimerDisplay() {
        const timerEl = document.getElementById('timer');
        if (timerEl) {
            timerEl.innerText = `00:${this.timer.toString().padStart(2, '0')}`;
        }
    },
    
    endGame() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        
        let resultType, resultText;
        if(this.myScore > this.oppScore) {
            resultType = 'win';
            resultText = `你赢了！${this.myScore}:${this.oppScore}`;
        } else if(this.oppScore > this.myScore) {
            resultType = 'lose';
            resultText = `对方获胜！${this.myScore}:${this.oppScore}`;
        } else {
            resultType = 'draw';
            resultText = `平局！${this.myScore}:${this.oppScore}`;
        }
        
        gameManager.showResult(resultType, resultText, this.myScore !== this.oppScore);
    },
    
    onData(d) {
        if(d.type === 'CLICK') {
            this.oppScore = d.score;
            const oppScoreEl = document.getElementById('opp-score');
            if (oppScoreEl) {
                oppScoreEl.innerText = this.oppScore;
            }
        }
    }
};