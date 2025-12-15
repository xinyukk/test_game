// --- 应用核心逻辑 ---
const app = {
    peer: null,
    conn: null,
    role: null, 
    roomId: null,
    
    init() {
        this.bindEvents();
        this.renderLobby();
        // 添加触摸事件优化
        document.addEventListener('touchstart', function() {}, {passive: true});
    },

    bindEvents() {
        // 绑定按钮事件
        document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
        document.getElementById('disconnect-btn').addEventListener('click', () => this.disconnect());
        document.getElementById('exit-game-btn').addEventListener('click', () => gameManager.exitGame());
        document.getElementById('restart-game-btn').addEventListener('click', () => gameManager.restartGame());
        document.getElementById('return-lobby-btn').addEventListener('click', () => gameManager.exitGame());
    },

    showToast(msg, icon='🔔') {
        const el = document.getElementById('toast');
        document.getElementById('toast-msg').innerText = msg;
        document.getElementById('toast-icon').innerText = icon;
        el.classList.remove('opacity-0', 'translate-y-[-20px]');
        setTimeout(() => el.classList.add('opacity-0', 'translate-y-[-20px]'), 3000);
    },

    switchScreen(screenId) {
        Object.values(SCREENS).forEach(id => {
            const screen = document.getElementById(`screen-${id}`);
            if (screen) {
                screen.classList.toggle('hidden', id !== screenId);
            }
        });
        
        if(screenId === SCREENS.LOBBY) {
            const avatar = document.getElementById('avatar-me');
            if(this.role === 'host') {
                avatar.innerText = '🐳';
                avatar.classList.add('bg-blue-50');
            } else {
                avatar.innerText = '🌸';
                avatar.classList.add('bg-pink-50');
            }
        }
    },

    createRoom() {
        this.role = 'host';
        this.roomId = Math.floor(Math.random() * 900000 + 100000).toString();
        this.showToast("小屋搭建中...", "🧱");
        
        try {
            this.peer = new Peer('couple_space_' + this.roomId);
            this.peer.on('open', (id) => {
                this.showToast(`小屋创建成功：${this.roomId}`, "🏡");
                document.getElementById('room-code').value = this.roomId;
                
                const btn = document.getElementById('create-room-btn');
                btn.innerHTML = `<span class="font-mono text-2xl tracking-widest">${this.roomId}</span><span class="text-xs opacity-70 ml-2">等待对方回家...</span>`;
                btn.classList.replace('bg-[#007AFF]', 'bg-[#2C2C2E]');
            });

            this.peer.on('connection', (conn) => {
                this.conn = conn;
                this.setupConnection();
                this.showToast("欢迎回家！", "💑");
                this.switchScreen(SCREENS.LOBBY);
            });
            
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                if(err.type === 'unavailable-id') {
                    // 重试创建房间
                    setTimeout(() => this.createRoom(), 1000);
                } else if(err.type === 'network') {
                    this.showToast("网络连接问题，请检查网络", "⚠️");
                } else {
                    this.showToast("网络开小差了: " + err.type, "⚠️");
                }
            });
        } catch (error) {
            console.error('Error creating room:', error);
            this.showToast("创建房间失败，请重试", "⚠️");
        }
    },

    joinRoom() {
        const input = document.getElementById('room-code').value;
        if(input.length !== 6) {
            this.showToast("请输入6位门牌号", "🔑");
            return;
        }
        
        this.role = 'guest';
        this.roomId = input;
        this.showToast("正在敲门...", "✊");
        
        try {
            this.peer = new Peer();
            this.peer.on('open', () => {
                this.conn = this.peer.connect('couple_space_' + this.roomId);
                this.conn.on('open', () => {
                    this.setupConnection();
                    this.showToast("进屋啦！", "❤️");
                    this.switchScreen(SCREENS.LOBBY);
                });
                
                this.conn.on('error', (err) => {
                    console.error('Connection error:', err);
                    this.showToast("连接失败: " + err.message, "⚠️");
                });
                
                setTimeout(() => {
                    if(!this.conn || !this.conn.open) {
                        this.showToast("没人开门，检查下号码？", "🤔");
                    }
                }, 10000); // 增加超时时间到10秒
            });
            
            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                this.showToast("网络连接问题: " + err.type, "⚠️");
            });
        } catch (error) {
            console.error('Error joining room:', error);
            this.showToast("加入房间失败，请重试", "⚠️");
        }
    },

    setupConnection() {
        if (!this.conn) return;
        
        this.conn.on('data', (data) => {
            if(data.type === 'GAME_LAUNCH') {
                gameManager.loadGame(data.gameId);
            } else if(data.type === 'GAME_DATA') {
                gameManager.handleRemoteData(data.payload);
            } else if(data.type === 'GAME_EXIT') {
                gameManager.exitGame(false);
            }
        });
        
        this.conn.on('close', () => {
            this.showToast("对方离开了小屋", "👋");
            setTimeout(() => location.reload(), 2000);
        });
        
        this.conn.on('error', (err) => {
            console.error('Connection error:', err);
            this.showToast("连接出现错误", "⚠️");
        });
    },

    send(data) {
        if(this.conn && this.conn.open) {
            try {
                this.conn.send(data);
            } catch (error) {
                console.error('Error sending data:', error);
                this.showToast("发送数据失败", "⚠️");
            }
        }
    },

    disconnect() {
        try {
            if(this.conn) {
                this.conn.close();
            }
            if(this.peer) {
                this.peer.destroy();
            }
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
        location.reload();
    },

    renderLobby() {
        const list = document.getElementById('game-list');
        if (!list) return;
        
        list.innerHTML = GAMES.map(game => `
            <div onclick="gameManager.requestGame('${game.id}')" class="ios-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 active:scale-95 transition-all cursor-pointer h-36 relative overflow-hidden group border-0 shadow-sm hover:shadow-md">
                <div class="absolute inset-0 ${game.color} opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div class="text-4xl mb-1 transform group-hover:scale-110 transition-transform duration-300">${game.icon}</div>
                <h4 class="font-bold text-gray-800 text-sm tracking-tight">${game.name}</h4>
                <p class="text-[10px] text-gray-400 font-medium leading-tight px-1">${game.desc}</p>
            </div>
        `).join('');
    }
};