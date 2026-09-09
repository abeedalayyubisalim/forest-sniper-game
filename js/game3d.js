// Main Game 3D FPS Class
class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.weaponManager = new WeaponManager();
        this.animalManager = new AnimalManager3D();
        this.forestMap = null;
        
        this.state = 'start';
        this.score = 0;
        this.time = 0;
        this.startTime = 0;
        this.health = 100;
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        
        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        this.lastShot = 0;
        this.player = {
            id: 'player_' + Date.now(),
            name: 'Hunter_' + Math.floor(Math.random() * 1000)
        };

        this.init();
    }

    async init() {
        await supabaseManager.init();
        this.setupScene();
        this.setupControls();
        this.setupLights();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 0, 750);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        this.camera.position.y = 10;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Map
        this.forestMap = new ForestMap3D(this.scene);
        this.forestMap.generate();
    }

    setupControls() {
        this.controls = new THREE.PointerLockControls(this.camera, document.body);

        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
            this.state = 'playing';
            if (this.startTime === 0) {
                this.startGame();
            }
        });

        this.controls.addEventListener('unlock', () => {
            blocker.style.display = 'flex';
            instructions.style.display = 'flex';
            this.state = 'paused';
        });

        this.scene.add(this.controls.getObject());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(500, 1000, 500);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        // Keyboard
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'Space':
                    if (this.canJump === true) {
                        this.velocity.y += 350;
                        this.canJump = false;
                    }
                    break;
                case 'Digit1':
                    this.selectWeapon('axe');
                    break;
                case 'Digit2':
                    this.selectWeapon('bow');
                    break;
                case 'Digit3':
                    this.selectWeapon('sniper');
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Mouse click (shoot)
        document.addEventListener('mousedown', (event) => {
            if (event.button === 0 && this.state === 'playing') {
                this.shoot();
            }
        });

        // UI Buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.controls.unlock());

        // Weapon slots
        document.querySelectorAll('.slot').forEach(slot => {
            slot.addEventListener('click', () => {
                if (this.weaponManager.switchWeapon(slot.dataset.weapon)) {
                    document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
                    slot.classList.add('active');
                    this.updateHUD();
                }
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    startGame() {
        this.startTime = Date.now();
        this.score = 0;
        this.time = 0;
        this.health = 100;

        // Spawn initial weapons
        for (let i = 0; i < 5; i++) {
            this.weaponManager.spawnRandomWeapon3D(this.scene);
        }

        // Spawn initial animals
        for (let i = 0; i < 10; i++) {
            this.animalManager.spawn(this.scene);
        }

        this.updateTimer();
        this.spawnLoop();
    }

    spawnLoop() {
        if (this.state !== 'playing') return;

        if (this.animalManager.getAnimalCount() < 15) {
            this.animalManager.spawn(this.scene);
        }

        if (Math.random() < 0.001) {
            this.weaponManager.spawnRandomWeapon3D(this.scene);
        }

        setTimeout(() => this.spawnLoop(), 3000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.state !== 'playing') return;

        const time = performance.now();
        const delta = (time - this.prevTime) / 1000;

        // Movement
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;
        this.velocity.y -= 9.8 * 100.0 * delta; // Gravity

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * 400.0 * delta;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * 400.0 * delta;
        }

        // Apply movement
        const controlsObject = this.controls.getObject();
        const oldPosition = controlsObject.position.clone();
        
        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);
        controlsObject.position.y += this.velocity.y * delta;

        // Check collision
        if (this.forestMap.checkCollision(controlsObject.position, 5)) {
            controlsObject.position.copy(oldPosition);
            this.velocity.x = 0;
            this.velocity.z = 0;
        }

        // Ground collision
        if (controlsObject.position.y < 10) {
            this.velocity.y = 0;
            controlsObject.position.y = 10;
            this.canJump = true;
        }

        // Update animals
        this.animalManager.update();

        // Check weapon collection
        const collectedWeapon = this.weaponManager.checkCollision3D(
            controlsObject.position,
            15
        );

        if (collectedWeapon) {
            if (this.weaponManager.collectWeapon(collectedWeapon, this.player)) {
                this.showNotification(`Dapat ${collectedWeapon.icon} ${collectedWeapon.type.toUpperCase()}!`);
                this.updateHUD();
                this.selectWeapon(collectedWeapon.type);
            }
        }

        this.prevTime = time;
        this.renderer.render(this.scene, this.camera);
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot < 500) return;

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

        // Raycasting untuk tembak
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const animalMeshes = this.animalManager.getMeshes();
        const intersects = raycaster.intersectObjects(animalMeshes, true);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            if (intersect.distance <= weapon.range) {
                // Find animal and damage
                const result = this.animalManager.checkHit(intersect.object, weapon.damage);
                
                if (result) {
                    this.score += result.score;
                    this.showNotification(`+${result.score} ${result.animalName}!`);
                    
                    supabaseManager.saveHunt({
                        player_id: this.player.id,
                        animal_name: result.animalName,
                        weapon_used: weapon.type,
                        score: result.score,
                        hunted_at: new Date()
                    });
                } else {
                    this.showNotification('Meleset!');
                }
            } else {
                this.showNotification('Terlalu jauh!');
            }
        }

        this.updateHUD();
    }

    selectWeapon(type) {
        if (this.weaponManager.switchWeapon(type)) {
            document.querySelectorAll('.slot').forEach(s => 
                s.classList.toggle('active', s.dataset.weapon === type)
            );
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
        document.getElementById('health').textContent = `❤️ Health: ${this.health}`;
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
        await supabaseManager.savePlayer({
            player_id: this.player.id,
            player_name: this.player.name,
            score: this.score,
            time: this.time,
            weapons: this.weaponManager.inventory,
            saved_at: new Date()
        });
        await supabaseManager.updateLeaderboard(
            this.player.id,
            this.score,
            this.player.name
        );
        this.showNotification('Game tersimpan!');
    }

    showNotification(message) {
        // Bisa tambahkan notification UI di sini
        console.log(message);
    }

    getAnimalCount() {
        return this.animalManager.getAnimalCount();
    }
}

// Initialize game
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new Game3D();
});
