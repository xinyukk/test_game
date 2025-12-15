// 6. 灵魂画手 (Drawing Canvas)
gameManager.games.drawing = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    
    init(container) {
        container.innerHTML = `
            <div class="w-full h-full flex flex-col">
                <div class="mb-4 flex gap-2">
                    <button onclick="gameManager.games.drawing.setColor('black')" class="w-8 h-8 rounded-full bg-black border-2 border-gray-300"></button>
                    <button onclick="gameManager.games.drawing.setColor('red')" class="w-8 h-8 rounded-full bg-red-500"></button>
                    <button onclick="gameManager.games.drawing.setColor('blue')" class="w-8 h-8 rounded-full bg-blue-500"></button>
                    <button onclick="gameManager.games.drawing.setColor('green')" class="w-8 h-8 rounded-full bg-green-500"></button>
                    <button onclick="gameManager.games.drawing.clearCanvas()" class="px-3 py-1 ios-card rounded-lg text-sm font-bold ml-auto">清空</button>
                </div>
                
                <div class="flex-grow relative border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-white">
                    <canvas id="drawing-canvas" class="absolute inset-0 w-full h-full touch-none"></canvas>
                </div>
                
                <p class="mt-4 text-center text-gray-500 text-sm">一起画画吧，看看能创造出什么</p>
            </div>
        `;
        
        this.setupCanvas();
    },
    
    setupCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) return;
        
        // Set canvas size to match display
        const resizeCanvas = () => {
            if (!this.canvas || !this.ctx) return;
            
            const displayWidth = this.canvas.clientWidth;
            const displayHeight = this.canvas.clientHeight;
            
            if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
                this.canvas.width = displayWidth;
                this.canvas.height = displayHeight;
                
                // Set drawing styles
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
                this.ctx.lineWidth = 4;
                this.ctx.strokeStyle = '#000000';
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Drawing event listeners
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.ctx) return;
            this.isDrawing = true;
            [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing || !this.ctx) return;
            this.draw(e.offsetX, e.offsetY);
            gameManager.sendGameData({ type: 'DRAW_LINE', x1: this.lastX, y1: this.lastY, x2: e.offsetX, y2: e.offsetY });
            [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
        });
        
        this.canvas.addEventListener('mouseup', () => this.isDrawing = false);
        this.canvas.addEventListener('mouseout', () => this.isDrawing = false);
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            if (!this.ctx) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.isDrawing = true;
            [this.lastX, this.lastY] = [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top];
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.isDrawing || !this.ctx) return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            this.draw(this.lastX, this.lastY, x, y);
            gameManager.sendGameData({ type: 'DRAW_LINE', x1: this.lastX, y1: this.lastY, x2: x, y2: y });
            [this.lastX, this.lastY] = [x, y];
        });
        
        this.canvas.addEventListener('touchend', () => this.isDrawing = false);
    },
    
    draw(x1, y1, x2, y2) {
        if (!this.ctx) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    },
    
    setColor(color) {
        if (this.ctx) {
            this.ctx.strokeStyle = color;
        }
    },
    
    clearCanvas() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            gameManager.sendGameData({ type: 'CLEAR_CANVAS' });
        }
    },
    
    onData(d) {
        if(d.type === 'DRAW_LINE') {
            this.draw(d.x1, d.y1, d.x2, d.y2);
        } else if(d.type === 'CLEAR_CANVAS') {
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
};