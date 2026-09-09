// Weapons System
class Weapon {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.found = false;
        this.damage = this.getDamage();
        this.range = this.getRange();
        this.ammo = this.getMaxAmmo();
        this.icon = this.getIcon();
    }

    getDamage() {
        const damages = { 'axe': 25, 'bow': 50, 'sniper': 100 };
        return damages[this.type] || 0;
    }

    getRange() {
        const ranges = { 'axe': 100, 'bow': 400, 'sniper': 800 };
        return ranges[this.type] || 0;
    }

    getMaxAmmo() {
        const ammos = { 'axe': Infinity, 'bow': 30, 'sniper': 10 };
        return ammos[this.type] || 0;
    }

    getIcon() {
        const icons = { 'axe': '', 'bow': '🏹', 'sniper': '🔫' };
        return icons[this.type] || '❓';
    }

    use() {
        if (this.ammo > 0) {
            if (this.ammo !== Infinity) this.ammo--;
            return true;
        }
        return false;
    }

    reload() {
        if (this.ammo !== Infinity) this.ammo = this.getMaxAmmo();
    }
}

// Weapon Manager
class WeaponManager {
    constructor() {
        this.weapons = [];
        this.currentWeapon = null;
        this.inventory = { axe: false, bow: false, sniper: false };
    }

    spawnRandomWeapon(canvasWidth, canvasHeight) {
        const types = ['axe', 'bow', 'sniper'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight - 100) + 50;
        
        const weapon = new Weapon(type, x, y);
        this.weapons.push(weapon);
        
        return weapon;
    }

    collectWeapon(weapon, player) {
        if (!this.inventory[weapon.type]) {
            this.inventory[weapon.type] = true;
            this.currentWeapon = weapon;
            
            supabaseManager.saveWeapon({
                player_id: player.id,
                weapon_type: weapon.type,
                position_x: weapon.x,
                position_y: weapon.y,
                found_at: new Date()
            });
            
            return true;
        }
        return false;
    }

    switchWeapon(type) {
        if (this.inventory[type]) {
            const weapon = this.weapons.find(w => w.type === type);
            if (weapon) {
                this.currentWeapon = weapon;
                return true;
            }
        }
        return false;
    }

    getCurrentWeapon() {
        return this.currentWeapon;
    }

    render(ctx) {
        this.weapons.forEach(weapon => {
            if (!weapon.found) {
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FFD700';
                ctx.fillText(weapon.icon, weapon.x, weapon.y);
                ctx.shadowBlur = 0;
            }
        });
    }

    checkCollision(playerX, playerY, radius = 30) {
        for (let weapon of this.weapons) {
            if (!weapon.found) {
                const dx = playerX - weapon.x;
                const dy = playerY - weapon.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < radius) {
                    weapon.found = true;
                    return weapon;
                }
            }
        }
        return null;
    }

    // 3D Methods
    spawnRandomWeapon3D(scene) {
        const types = ['axe', 'bow', 'sniper'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = (Math.random() - 0.5) * 900;
        const z = (Math.random() - 0.5) * 900;
        
        const weapon3D = new Weapon3D(type, x, z, scene);
        this.weapons.push(weapon3D);
        
        return weapon3D;
    }

    checkCollision3D(playerPosition, radius) {
        for (let weapon of this.weapons) {
            if (!weapon.found && weapon.mesh) {
                const distance = playerPosition.distanceTo(weapon.mesh.position);
                if (distance < radius) {
                    weapon.found = true;
                    return weapon;
                }
            }
        }
        return null;
    }
}

// 3D Weapon Class
class Weapon3D {
    constructor(type, x, z, scene) {
        this.type = type;
        this.found = false;
        this.damage = { 'axe': 25, 'bow': 50, 'sniper': 100 }[type] || 0;
        this.range = { 'axe': 50, 'bow': 200, 'sniper': 400 }[type] || 0;
        this.ammo = { 'axe': Infinity, 'bow': 30, 'sniper': 10 }[type] || 0;
        this.icon = { 'axe': '🪓', 'bow': '🏹', 'sniper': '🔫' }[type] || '';
        
        this.createMesh(x, z, scene);
    }

    createMesh(x, z, scene) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 3, z);

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);

        // Weapon icon (simple box with color)
        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshLambertMaterial({
            color: this.type === 'axe' ? 0x8B4513 : 
                   this.type === 'bow' ? 0x8B4513 : 0x2F4F4F
        });
        const box = new THREE.Mesh(geometry, material);
        this.mesh.add(box);

        // Floating animation
        this.mesh.userData.floatOffset = Math.random() * Math.PI * 2;

        scene.add(this.mesh);
    }

    use() {
        if (this.ammo > 0) {
            if (this.ammo !== Infinity) this.ammo--;
            return true;
        }
        return false;
    }

    update(time) {
        if (this.mesh && !this.found) {
            this.mesh.position.y = 3 + Math.sin(time * 0.003 + this.mesh.userData.floatOffset) * 0.5;
            this.mesh.rotation.y += 0.02;
        }
    }
}
