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
        const damages = {
            'axe': 25,
            'bow': 50,
            'sniper': 100
        };
        return damages[this.type] || 0;
    }

    getRange() {
        const ranges = {
            'axe': 100,
            'bow': 400,
            'sniper': 800
        };
        return ranges[this.type] || 0;
    }

    getMaxAmmo() {
        const ammos = {
            'axe': Infinity,
            'bow': 30,
            'sniper': 10
        };
        return ammos[this.type] || 0;
    }

    getIcon() {
        const icons = {
            'axe': '🪓',
            'bow': '🏹',
            'sniper': '🔫'
        };
        return icons[this.type] || '❓';
    }

    use() {
        if (this.ammo > 0) {
            if (this.ammo !== Infinity) {
                this.ammo--;
            }
            return true;
        }
        return false;
    }

    reload() {
        if (this.ammo !== Infinity) {
            this.ammo = this.getMaxAmmo();
        }
    }
}

// Weapon Manager
class WeaponManager {
    constructor() {
        this.weapons = [];
        this.currentWeapon = null;
        this.inventory = {
            axe: false,
            bow: false,
            sniper: false
        };
    }

    // Spawn random weapon
    spawnRandomWeapon(canvasWidth, canvasHeight) {
        const types = ['axe', 'bow', 'sniper'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight - 100) + 50;
        
        const weapon = new Weapon(type, x, y);
        this.weapons.push(weapon);
        
        return weapon;
    }

    // Collect weapon
    collectWeapon(weapon, player) {
        if (!this.inventory[weapon.type]) {
            this.inventory[weapon.type] = true;
            this.currentWeapon = weapon;
            
            // Save to database
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

    // Switch weapon
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

    // Get current weapon
    getCurrentWeapon() {
        return this.currentWeapon;
    }

    // Render weapons on canvas
    render(ctx) {
        this.weapons.forEach(weapon => {
            if (!weapon.found) {
                // Draw weapon
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(weapon.icon, weapon.x, weapon.y);
                
                // Glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#FFD700';
                ctx.fillText(weapon.icon, weapon.x, weapon.y);
                ctx.shadowBlur = 0;
            }
        });
    }

    // Check collision with player
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
}