// 1. 心动清单 (Date Matcher) - 替换决定转盘
gameManager.games.datematch = {
    ideas: [
        "去海边看日落", "一起做一顿晚餐", "去游乐园坐摩天轮", "窝在沙发看恐怖片", 
        "去猫咖撸猫", "互相给对方按摩", "去电玩城抓娃娃", "一起拼一个大乐高",
        "去吃一顿火锅", "拍一组搞怪合照", "去公园野餐", "通宵打游戏"
    ],
    init(container) {
        this.queue = [...this.ideas].sort(() => 0.5 - Math.random()).slice(0, 6); // 取6个
        this.currentIndex = 0;
        this.myLikes = [];
        this.oppLikes = null;
        
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center relative">
                <div id="card-stack" class="relative w-64 h-80 perspective-1000">
                    <!-- Cards go here -->
                </div>
                <div class="flex gap-8 mt-10">
                    <button onclick="gameManager.games.datematch.vote(false)" class="w-16 h-16 rounded-full bg-white shadow-lg text-3xl flex items-center justify-center border-2 border-gray-100 active:scale-90 transition-transform">❌</button>
                    <button onclick="gameManager.games.datematch.vote(true)" class="w-16 h-16 rounded-full bg-pink-500 shadow-lg text-white text-3xl flex items-center justify-center active:scale-90 transition-transform">❤️</button>
                </div>
                <p class="mt-6 text-gray-400 text-sm font-medium">还剩 <span id="card-count">6</span> 张</p>
            </div>
        `;
        this.renderCard();
    },
    renderCard() {
        const stack = document.getElementById('card-stack');
        const idea = this.queue[this.currentIndex];
        
        if(!idea) {
            stack.innerHTML = `<div class="w-full h-full bg-white rounded-3xl shadow-xl flex items-center justify-center text-center p-6"><h3 class="text-xl font-bold text-gray-400">等待对方...</h3></div>`;
            if(this.oppLikes !== null) this.showResults();
            return;
        }

        stack.innerHTML = `
            <div class="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center pop-in transform transition-all hover:-translate-y-2">
                <div class="text-6xl mb-6">💡</div>
                <h3 class="text-2xl font-bold text-gray-800">${idea}</h3>
                <p class="text-xs text-gray-400 mt-4 uppercase tracking-widest">Date Idea</p>
            </div>
        `;
        document.getElementById('card-count').innerText = this.queue.length - this.currentIndex;
    },
    vote(liked) {
        if(this.currentIndex >= this.queue.length) return;
        if(liked) this.myLikes.push(this.queue[this.currentIndex]);
        this.currentIndex++;
        
        if(this.currentIndex >= this.queue.length) {
            gameManager.sendGameData({ type: 'DONE', likes: this.myLikes });
            this.renderCard(); // Show waiting
        } else {
            this.renderCard();
        }
    },
    onData(d) {
        if(d.type === 'DONE') {
            this.oppLikes = d.likes;
            if(this.currentIndex >= this.queue.length) this.showResults();
        }
    },
    showResults() {
        const matches = this.myLikes.filter(item => this.oppLikes.includes(item));
        const board = document.getElementById('game-board');
        
        if(matches.length > 0) {
            board.innerHTML = `
                <div class="text-center w-full max-w-sm pop-in">
                    <div class="text-6xl mb-4">✨</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">太棒了！</h3>
                    <p class="text-gray-500 mb-6">我们共同想做的事情：</p>
                    <div class="bg-white rounded-2xl shadow-sm p-4 space-y-2 text-left max-h-60 overflow-y-auto">
                        ${matches.map(m => `<div class="p-3 bg-pink-50 rounded-xl text-pink-600 font-bold flex items-center gap-2"><span>✅</span> ${m}</div>`).join('')}
                    </div>
                    <button onclick="gameManager.restartGame()" class="mt-6 text-gray-400 text-sm underline">再玩一次</button>
                </div>
            `;
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } else {
            board.innerHTML = `
                <div class="text-center">
                    <div class="text-6xl mb-4">🤔</div>
                    <h3 class="text-xl font-bold text-gray-800">这次没有匹配到哦</h3>
                    <p class="text-gray-500 mt-2">没关系，只要在一起做什么都好</p>
                    <button onclick="gameManager.restartGame()" class="mt-6 bg-gray-900 text-white px-6 py-2 rounded-xl">再试一次</button>
                </div>
            `;
        }
    }
};