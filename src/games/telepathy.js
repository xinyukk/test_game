// 4. 默契大考验 (Telepathy Test)
gameManager.games.telepathy = {
    questions: [
        { q: "更喜欢在家还是出门约会？", opts: ["在家", "出门"], correct: 0 },
        { q: "更喜欢甜食还是咸食？", opts: ["甜食", "咸食"], correct: 0 },
        { q: "周末更喜欢运动还是休息？", opts: ["运动", "休息"], correct: 1 },
        { q: "更喜欢猫还是狗？", opts: ["猫", "狗"], correct: 0 },
        { q: "更喜欢夏天还是冬天？", opts: ["夏天", "冬天"], correct: 0 }
    ],
    currentQ: 0,
    myAnswer: null,
    oppAnswer: null,
    
    init(container) {
        this.shuffleQuestions();
        container.innerHTML = `
            <div class="w-full max-w-md text-center">
                <h3 id="question-text" class="text-xl font-bold text-gray-800 mb-8 px-4"></h3>
                
                <div class="space-y-4 mb-8" id="options-container">
                    <!-- Options will be inserted here -->
                </div>
                
                <div id="result-area" class="hidden">
                    <p id="result-text" class="text-lg font-bold mb-4"></p>
                    <p class="text-gray-500 text-sm">等待对方回答...</p>
                </div>
            </div>
        `;
        this.nextQuestion();
    },
    
    shuffleQuestions() {
        this.questions = [...this.questions].sort(() => 0.5 - Math.random()).slice(0, 3); // Take 3 random questions
    },
    
    nextQuestion() {
        if(this.currentQ >= this.questions.length) {
            // All questions answered
            this.showFinalResult();
            return;
        }
        
        const q = this.questions[this.currentQ];
        const questionEl = document.getElementById('question-text');
        if (questionEl) {
            questionEl.innerText = q.q;
        }
        
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = q.opts.map((opt, i) => `
                <button onclick="gameManager.games.telepathy.select(${i})" 
                    class="block w-full text-left p-4 ios-card rounded-2xl font-bold text-gray-800 mb-2 last:mb-0 active:scale-[0.98] transition-transform">
                    ${opt}
                </button>
            `).join('');
        }
        
        // Reset state
        this.myAnswer = null;
        this.oppAnswer = null;
        
        const resultArea = document.getElementById('result-area');
        if (resultArea) {
            resultArea.classList.add('hidden');
        }
        
        if (optionsContainer) {
            optionsContainer.classList.remove('hidden');
        }
    },
    
    select(optionIndex) {
        if(this.myAnswer !== null) return; // Already answered
        
        this.myAnswer = optionIndex;
        gameManager.sendGameData({ type: 'ANSWER', answer: optionIndex });
        
        // Disable buttons temporarily
        const buttons = document.querySelectorAll('#options-container button');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('opacity-50');
        });
        
        // Show waiting state if we answered first
        if(this.oppAnswer === null) {
            const resultText = document.getElementById('result-text');
            if (resultText) {
                resultText.innerText = `你选择了：${this.questions[this.currentQ].opts[optionIndex]}`;
            }
            
            const resultArea = document.getElementById('result-area');
            const optionsContainer = document.getElementById('options-container');
            if (resultArea && optionsContainer) {
                resultArea.classList.remove('hidden');
                optionsContainer.classList.add('hidden');
            }
        }
        
        // Check if both answered
        this.checkBothAnswered();
    },
    
    onData(d) {
        if(d.type === 'ANSWER') {
            this.oppAnswer = d.answer;
            
            if(this.myAnswer !== null) {
                this.showResult();
            } else {
                // Opponent answered first
                const q = this.questions[this.currentQ];
                const resultText = document.getElementById('result-text');
                if (resultText) {
                    resultText.innerText = `对方选择了：${q.opts[d.answer]}`;
                }
                
                const resultArea = document.getElementById('result-area');
                const optionsContainer = document.getElementById('options-container');
                if (resultArea && optionsContainer) {
                    resultArea.classList.remove('hidden');
                    optionsContainer.classList.add('hidden');
                }
            }
        }
    },
    
    checkBothAnswered() {
        if(this.myAnswer !== null && this.oppAnswer !== null) {
            setTimeout(() => this.showResult(), 500);
        }
    },
    
    showResult() {
        const q = this.questions[this.currentQ];
        const myOpt = q.opts[this.myAnswer];
        const oppOpt = q.opts[this.oppAnswer];
        
        const resultText = document.getElementById('result-text');
        if (resultText) {
            resultText.innerText = `默契测试结果`;
        }
        
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="ios-card p-4 rounded-2xl">
                        <p class="text-xs text-gray-400 uppercase tracking-wider">你的选择</p>
                        <p class="font-bold text-lg text-blue-500">${myOpt}</p>
                    </div>
                    <div class="ios-card p-4 rounded-2xl">
                        <p class="text-xs text-gray-400 uppercase tracking-wider">对方选择</p>
                        <p class="font-bold text-lg text-pink-500">${oppOpt}</p>
                    </div>
                </div>
                <button onclick="gameManager.games.telepathy.nextQuestion()" class="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">
                    ${this.currentQ < this.questions.length - 1 ? '下一题' : '查看结果'}
                </button>
            `;
        }
        
        const resultArea = document.getElementById('result-area');
        if (resultArea) {
            resultArea.classList.remove('hidden');
        }
        
        if(this.myAnswer === this.oppAnswer) {
            // Match!
            if (resultText) {
                resultText.innerHTML = `默契度MAX! <span class="text-pink-500">✓</span>`;
            }
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
            }
        } else {
            if (resultText) {
                resultText.innerHTML = `有点分歧呢 <span class="text-gray-500">?</span>`;
            }
        }
    },
    
    showFinalResult() {
        // Count matches
        const matches = this.questions.filter((_, i) => {
            const myAns = this.myAnswer !== null ? this.myAnswer : null;
            const oppAns = this.oppAnswer !== null ? this.oppAnswer : null;
            return myAns !== null && oppAns !== null && myAns === oppAns;
        }).length;
        
        const percent = Math.round((matches / this.questions.length) * 100);
        
        const board = document.getElementById('game-board');
        if (board) {
            board.innerHTML = `
                <div class="text-center max-w-md">
                    <div class="text-6xl mb-4">${percent === 100 ? '💯' : percent >= 60 ? '💕' : '🤝'}</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">默契大考验完成！</h3>
                    <p class="text-gray-500 mb-6">你们的默契度：${percent}% (${matches}/${this.questions.length})</p>
                    
                    <div class="space-y-3">
                        <button onclick="gameManager.restartGame()" class="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">再测一次</button>
                        <button onclick="gameManager.exitGame()" class="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">返回大厅</button>
                    </div>
                </div>
            `;
        }
    }
};