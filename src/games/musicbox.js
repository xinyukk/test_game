// 2. 双人乐章 (Love Piano) - 替换家务骰子
gameManager.games.musicbox = {
    init(container) {
        // 使用简单的五声音阶，怎么弹都好听
        const notes = [
            { n: 'C4', f: 261.63, c: 'bg-red-100 text-red-500' },
            { n: 'D4', f: 293.66, c: 'bg-orange-100 text-orange-500' },
            { n: 'E4', f: 329.63, c: 'bg-yellow-100 text-yellow-500' },
            { n: 'G4', f: 392.00, c: 'bg-green-100 text-green-500' },
            { n: 'A4', f: 440.00, c: 'bg-blue-100 text-blue-500' },
            { n: 'C5', f: 523.25, c: 'bg-purple-100 text-purple-600' }
        ];
        
        // Audio Context Setup
        if(!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        container.innerHTML = `
            <div class="w-full flex flex-col gap-4 items-center justify-center h-full px-4">
                <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">PENTATONIC SCALE</p>
                <div class="grid grid-cols-2 gap-4 w-full max-w-sm">
                    ${notes.map((n, i) => `
                        <button id="key-${i}" onmousedown="gameManager.games.musicbox.play(${i})" ontouchstart="gameManager.games.musicbox.play(${i})" 
                            class="${n.c} piano-key h-20 rounded-2xl font-bold text-xl shadow-sm border border-white/50 select-none touch-none flex items-center justify-center">
                            🎵
                        </button>
                    `).join('')}
                </div>
                <p class="text-xs text-gray-400 mt-4">轻触琴键，合奏属于你们的旋律</p>
            </div>
        `;
        
        this.notes = notes;
    },
    play(idx, isRemote = false) {
        const note = this.notes[idx];
        const btn = document.getElementById(`key-${idx}`);
        
        // Visual
        if (btn) {
            btn.classList.add('scale-95', 'brightness-95');
            setTimeout(() => btn.classList.remove('scale-95', 'brightness-95'), 150);
        }
        
        // Audio
        if(window.audioCtx && window.audioCtx.state !== 'closed') {
            if(window.audioCtx.state === 'suspended') window.audioCtx.resume();
            const osc = window.audioCtx.createOscillator();
            const gain = window.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.f, window.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.5, window.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, window.audioCtx.currentTime + 1);
            osc.connect(gain);
            gain.connect(window.audioCtx.destination);
            osc.start();
            osc.stop(window.audioCtx.currentTime + 0.8);
        }
        
        // Send to remote player
        if(!isRemote) {
            gameManager.sendGameData({ type: 'PLAY_NOTE', idx });
        }
    },
    onData(d) {
        if(d.type === 'PLAY_NOTE') {
            this.play(d.idx, true);
        }
    }
};