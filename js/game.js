// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.canvasWidth;
        this.canvas.height = CONFIG.canvasHeight;

        this.state = 'start'; // start, playing, paused, gameover
        this.score = 0;
        this.time = 0;
        this.startTime = 0;
        
        this.player = {
            id: 'player_' + Date.now(),
            name: 'Hunter_' + Math.floor(Math.random() * 1000),
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            mouseX: 0,
            mouseY: 0
        };

        this.weaponManager = new WeaponManager();
        this.animalManager = new AnimalManager();
        this.forestMap = new ForestMap(this.canvas.width, this.canvas.height);

        this.lastShot = 0;
        this.shotCooldown = 500; // ms

        this.bindEvents();
        this.init();
    }

    async init() {
        await supabaseManager.init();
        this.showScreen('start-screen');
    }

    bindEvents() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.mouseX = e.clientX - rect.left;
            this.player.mouseY = e.clientY - rect.top;
            
            // Update crosshair
            const crosshair = document.getElementById('crosshair');
            crosshair.style.left = e.clientX + 'px';
            crosshair.style.top = e.clientY + 'px';
        });

        // Shooting
        this.canvas.addEventListener('click', (e) => {
            if (this.state === 'playing') {
                this.shoot();
            }
        });

        // Weapon selection
        document.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const weaponType = slot.dataset.weapon;
                if (this.weaponManager.switchWeapon(weaponType)) {
                    document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
                    slot.classList.add('active');
                    this.updateHUD();
                }
            });
        });

        // Controls
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveGame();
        });

        document.getElementById('menu-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
            this.state = 'paused';
        });

        document.getElementById('resume-btn').addEventListener('click', () => {
            this.showScreen('game-screen');
            this.state = 'playing';
            this.gameLoop();
        });

        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboard();
        });

        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('back-menu-btn').addEventListener('click', () => {
            this.showScreen('menu-screen');
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') this.selectWeapon('axe');
            if (e.key === '2') this.selectWeapon('bow');
            if (e.key === '3') this.selectWeapon('sniper');
            if (e.key === 'Escape') this.togglePause();
        });
    }

    startGame() {
        this.state = 'playing';
        this.startTime = Date.now();
        this.score = 0;
        this.time = 0;
        
        // Spawn initial weapons
        for (let i = 0; i < 3; i++) {
            this.weaponManager.spawnRandomWeapon(this.canvas.width, this.canvas.height);
        }
        
        // Spawn initial animals
        for (let i = 0; i < 5; i++) {
            this.animalManager.spawn(this.canvas.width, this.canvas.height);
        }

        this.showScreen('game-screen');
        this.gameLoop();
        this.spawnLoop();
        this.updateTimer();
    }

    spawnLoop() {
        if (this.state !== 'playing') return;

        // Spawn animals
        if (this.animalManager.getAnimalCount() < 10) {
            this.animalManager.spawn(this.canvas.width, this.canvas.height);
        }

        // Spawn weapons occasionally
        if (Math.random() < 0.001) {
            this.weaponManager.spawnRandomWeapon(this.canvas.width, this.canvas.height);
        }

        setTimeout(() => this.spawnLoop(), CONFIG.spawnRate);
    }

    gameLoop() {
        if (this.state !== 'playing') return;

        this.update();
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Update animals
        this.animalManager.update(this.canvas.width, this.canvas.height);

        // Check weapon collection
        const collectedWeapon = this.weaponManager.checkCollision(
            this.player.x, 
            this.player.y
        );

        if (collectedWeapon) {
            if (this.weaponManager.collectWeapon(collectedWeapon, this.player)) {
                this.showNotification(`Dapat ${collectedWeapon.icon} ${collectedWeapon.type.toUpperCase()}!`);
                this.updateHUD();
                
                // Auto-select new weapon
                this.selectWeapon(collectedWeapon.type);
            }
        }

        // Check game end
        if (this.time >= CONFIG.gameDuration) {
            this.endGame();
        }
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw forest
        this.forestMap.render(this.ctx);

        // Draw weapons
        this.weaponManager.render(this.ctx);

        // Draw animals
        this.animalManager.render(this.ctx);

        // Draw player (hidden - first person view)
        // Could add gun sight here
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return;

        const weapon = this.weaponManager.getCurrentWeapon();
        if (!weapon) {
            this.showNotification('Cari senjata dulu!');
            return;
        }

        if (!weapon.use()) {
            this.showNotification('Ammo habis!');
            return;
        }

        this.lastShot = now;

        // Check hit
        const result = this.animalManager.checkShot(
            this.player.mouseX,
            this.player.mouseY,
            weapon
        );

        if (result.hit) {
            if (result.killed) {
                this.score += result.score;
                this.showNotification(`+${result.score} ${result.animal.name}!`);
                
                // Save hunt to database
                supabaseManager.saveHunt({
                    player_id: this.player.id,
                    animal_name: result.animal.name,
                    weapon_used: weapon.type,
                    score: result.score,
                    hunted_at: new Date()
                });

                // Remove dead animal after animation
                setTimeout(() => {
                    this.animalManager.animals = this.animalManager.animals.filter(
                        a => a.id !== result.animal.id
                    );
                }, 1000);
            } else if (result.message) {
                this.showNotification(result.message);
            } else {
                this.showNotification('Meleset!');
            }
        }

        this.updateHUD();
    }

    selectWeapon(type) {
        if (this.weaponManager.switchWeapon(type)) {
            document.querySelectorAll('.slot').forEach(slot => {
                slot.classList.toggle('active', slot.dataset.weapon === type);
            });
            this.updateHUD();
        }
    }

    updateHUD() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        
        const weapon = this.weaponManager.getCurrentWeapon();
        if (weapon) {
            document.getElementById('weapon-display').textContent = 
                `Weapon: ${weapon.icon} ${weapon.type.toUpperCase()}`;
            document.getElementById('ammo').textContent = 
                `Ammo: ${weapon.ammo === Infinity ? '∞' : weapon.ammo}`;
        } else {
            document.getElementById('weapon-display').textContent = 'Weapon: None';
            document.getElementById('ammo').textContent = 'Ammo: -';
        }
    }

    updateTimer() {
        if (this.state !== 'playing') return;

        this.time = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(this.time / 60).toString().padStart(2, '0');
        const seconds = (this.time % 60).toString().padStart(2, '0');
        document.getElementById('time').textContent = `Time: ${minutes}:${seconds}`;

        setTimeout(() => this.updateTimer(), 1000);
    }

    async saveGame() {
        const gameData = {
            player_id: this.player.id,
            player_name: this.player.name,
            score: this.score,
            time: this.time,
            weapons: this.weaponManager.inventory,
            saved_at: new Date()
        };

        await supabaseManager.savePlayer(gameData);
        await supabaseManager.updateLeaderboard(
            this.player.id,
            this.score,
            this.player.name
        );

        this.showNotification('Game tersimpan!');
    }

    async showLeaderboard() {
        this.showScreen('leaderboard-screen');
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '<p>Loading...</p>';

        const data = await supabaseManager.getLeaderboard();
        
        if (data.length === 0) {
            list.innerHTML = '<p>Belum ada data</p>';
            return;
        }

        list.innerHTML = data.map((entry, index) => `
            <div class="leaderboard-item">
                <span>#${index + 1} ${entry.player_name}</span>
                <span>${entry.score} pts</span>
            </div>
        `).join('');
    }

    endGame() {
        this.state = 'gameover';
        this.showNotification(`Game Over! Score: ${this.score}`);
        
        setTimeout(async () => {
            await this.saveGame();
            alert(`Game Over!\nScore Akhir: ${this.score}`);
            this.resetGame();
        }, 2000);
    }

    resetGame() {
        this.state = 'start';
        this.score = 0;
        this.time = 0;
        this.weaponManager = new WeaponManager();
        this.animalManager = new AnimalManager();
        this.forestMap = new ForestMap(this.canvas.width, this.canvas.height);
        this.showScreen('start-screen');
    }

    togglePause() {
        if (this.state === 'playing') {
            this.showScreen('menu-screen');
            this.state = 'paused';
        } else if (this.state === 'paused') {
            this.showScreen('game-screen');
            this.state = 'playing';
            this.gameLoop();
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showNotification(message) {
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.style.display = 'block';
        
        setTimeout(() => {
            notif.style.display = 'none';
        }, 2000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});