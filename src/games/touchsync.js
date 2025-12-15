// 3. 指尖感应 (Touch Sync) - 替换情侣问答
gameManager.games.touchsync = {
    targetX: 0,
    targetY: 0,
    init(container) {
        container.innerHTML = `
            <div class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                <div id="target-area" class="relative w-64 h-64 rounded-full bg-white/30 border-2 border-dashed border-white flex items-center justify-center">
                    <div id="target" class="w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-300 flex items-center justify-center">
                        <span class="text-pink-500 text-2xl">💕</span>
                    </div>
                </div>
                <div class="mt-8 text-center">
                    <p id="status" class="text-gray-600 font-bold mb-4">请在屏幕上找到对方的指尖</p>
                    <div class="flex gap-4">
                        <div class="text-center">
                            <p class="text-xs text-gray-400">你的位置</p>
                            <p id="my-pos" class="text-lg font-bold text-blue-500">0, 0</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xs text-gray-400">对方位置</p>
                            <p id="opp-pos" class="text-lg font-bold text-pink-500">?, ?</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.generateTarget();
        this.bindEvents(container);
    },
    generateTarget() {
        // Generate random position within the target area
        const area = document.getElementById('target-area');
        if (!area) return;
        
        const rect = area.getBoundingClientRect();
        const padding = 64; // Keep target away from edges
        
        this.targetX = Math.random() * (rect.width - padding * 2) + padding;
        this.targetY = Math.random() * (rect.height - padding * 2) + padding;
        
        const target = document.getElementById('target');
        if (target) {
            target.style.left = `${this.targetX - target.offsetWidth / 2}px`;
            target.style.top = `${this.targetY - target.offsetHeight / 2}px`;
        }
    },
    bindEvents(container) {
        const area = document.getElementById('target-area');
        if (!area) return;
        
        area.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.checkPosition(e.touches[0], area);
        });
        
        area.addEventListener('mousemove', (e) => {
            if(e.buttons === 1) { // Only when mouse is pressed
                this.checkPosition(e, area);
            }
        });
        
        area.addEventListener('touchend', () => this.sendPosition());
        area.addEventListener('mouseup', () => this.sendPosition());
    },
    checkPosition(event, area) {
        if (!area) return;
        
        const rect = area.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const myPosEl = document.getElementById('my-pos');
        if (myPosEl) {
            myPosEl.innerText = `${Math.round(x)}, ${Math.round(y)}`;
        }
        
        // Calculate distance to target
        const distance = Math.sqrt(Math.pow(x - this.targetX, 2) + Math.pow(y - this.targetY, 2));
        const target = document.getElementById('target');
        
        // Visual feedback based on proximity
        if (target) {
            const intensity = Math.max(0.2, 1 - distance/200);
            target.style.backgroundColor = `rgba(236, 72, 153, ${intensity})`;
            target.style.transform = `scale(${0.8 + intensity * 0.4})`;
        }
    },
    sendPosition() {
        // Send current position to opponent
        gameManager.sendGameData({ 
            type: 'TOUCH_POS', 
            x: this.targetX, 
            y: this.targetY 
        });
    },
    onData(d) {
        if(d.type === 'TOUCH_POS') {
            const oppPosEl = document.getElementById('opp-pos');
            if (oppPosEl) {
                oppPosEl.innerText = `${Math.round(d.x)}, ${Math.round(d.y)}`;
            }
            
            // Check if positions match closely enough
            const myPosEl = document.getElementById('my-pos');
            if (myPosEl) {
                const posText = myPosEl.innerText.split(', ');
                const myX = parseInt(posText[0]);
                const myY = parseInt(posText[1]);
                
                if(!isNaN(myX) && !isNaN(myY)) {
                    const distance = Math.sqrt(Math.pow(myX - d.x, 2) + Math.pow(myY - d.y, 2));
                    if(distance < 40) {
                        gameManager.showResult('draw', '完美同步！你们的指尖相遇了 💕', true);
                    }
                }
            }
        }
    }
};