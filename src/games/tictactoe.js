// 7. 爱的连线 (Tic Tac Toe)
gameManager.games.tictactoe = {
    board: Array(9).fill(null),
    currentPlayer: 'X', // X starts
    gameOver: false,
    
    init(container) {
        container.innerHTML = `
            <div class="w-full max-w-xs">
                <div class="grid grid-cols-3 gap-2 mb-6" id="board">
                    ${Array(9).fill().map((_, i) => `
                        <div onclick="gameManager.games.tictactoe.makeMove(${i})" 
                            class="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-4xl font-black ios-card cursor-pointer active:scale-95 transition-transform">
                            <span id="cell-${i}"></span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="text-center">
                    <p id="status" class="text-lg font-bold text-green-600 mb-4">轮到你了！请选择</p>
                    <button onclick="gameManager.games.tictactoe.reset()" class="px-6 py-2 bg-gray-100 rounded-xl font-bold text-gray-600">重新开始</button>
                </div>
            </div>
        `;
        
        this.updateStatus();
    },
    
    makeMove(index) {
        if(this.board[index] || this.gameOver || app.role !== this.currentPlayer) return;
        
        this.board[index] = app.role;
        const cell = document.getElementById(`cell-${index}`);
        if (cell) {
            cell.innerText = app.role === 'host' ? '⭕' : '❌';
        }
        
        gameManager.sendGameData({ type: 'MOVE', index, player: app.role });
        
        if(this.checkWin()) {
            this.gameOver = true;
            if(app.role === this.currentPlayer) {
                gameManager.showResult('win', '恭喜你获胜了！', true);
            }
        } else if(this.board.every(cell => cell !== null)) {
            // Draw
            this.gameOver = true;
            gameManager.showResult('draw', '平局！你们都很棒！');
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    },
    
    onData(d) {
        if(d.type === 'MOVE') {
            this.board[d.index] = d.player;
            const cell = document.getElementById(`cell-${d.index}`);
            if (cell) {
                cell.innerText = d.player === 'host' ? '⭕' : '❌';
            }
            
            if(this.checkWinForPlayer(d.player)) {
                this.gameOver = true;
                if(d.player !== app.role) {
                    gameManager.showResult('lose', '对方获胜了，加油下次！');
                }
            } else if(this.board.every(cell => cell !== null)) {
                // Draw
                this.gameOver = true;
                gameManager.showResult('draw', '平局！你们都很棒！');
            } else {
                // Switch player
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                this.updateStatus();
            }
        } else if(d.type === 'RESET') {
            this.reset();
        }
    },
    
    checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    },
    
    checkWinForPlayer(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];
        
        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] === player && this.board[b] === player && this.board[c] === player;
        });
    },
    
    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        
        for(let i = 0; i < 9; i++) {
            const cell = document.getElementById(`cell-${i}`);
            if (cell) {
                cell.innerText = '';
            }
        }
        
        this.updateStatus();
        gameManager.sendGameData({ type: 'RESET' });
    },
    
    updateStatus() {
        const status = document.getElementById('status');
        if (!status) return;
        
        if(this.gameOver) {
            status.innerText = '游戏结束';
        } else {
            status.innerText = this.currentPlayer === app.role ? "轮到你了！请选择" : "对方正在思考...";
            status.className = this.currentPlayer === app.role ? "mb-6 font-bold text-green-600 animate-pulse" : "mb-6 font-bold text-gray-400";
        }
    }
};