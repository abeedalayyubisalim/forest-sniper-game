// Animals Database
const ANIMALS_DB = [
    // Deer Family
    { name: 'Rusa Putih', icon: '', score: 100, health: 100, speed: 2, size: 40, color: '#F5F5DC' },
    { name: 'Rusa Coklat', icon: '', score: 80, health: 90, speed: 2.5, size: 38, color: '#8B4513' },
    { name: 'Kijang', icon: '🦌', score: 60, health: 70, speed: 3, size: 30, color: '#D2691E' },
    
    // Bear Family
    { name: 'Beruang Coklat', icon: '🐻', score: 200, health: 200, speed: 1.5, size: 60, color: '#8B4513' },
    { name: 'Beruang Hitam', icon: '🐻‍❄️', score: 250, health: 250, speed: 1.8, size: 65, color: '#2F4F4F' },
    
    // Wolf Family
    { name: 'Serigala', icon: '🐺', score: 120, health: 110, speed: 3.5, size: 35, color: '#696969' },
    { name: 'Serigala Putih', icon: '🐺', score: 150, health: 120, speed: 3.8, size: 36, color: '#F0F8FF' },
    
    // Big Cats
    { name: 'Harimau', icon: '🐅', score: 300, health: 180, speed: 4, size: 50, color: '#FF8C00' },
    { name: 'Macan Tutul', icon: '🐆', score: 250, health: 150, speed: 4.5, size: 45, color: '#FFD700' },
    
    // Birds
    { name: 'Elang', icon: '🦅', score: 90, health: 60, speed: 5, size: 30, color: '#8B4513' },
    { name: 'Burung Hantu', icon: '🦉', score: 70, health: 50, speed: 3, size: 25, color: '#8B7355' },
    
    // Others
    { name: 'Babi Hutan', icon: '🐗', score: 100, health: 130, speed: 2.5, size: 40, color: '#696969' },
    { name: 'Rubah', icon: '🦊', score: 80, health: 70, speed: 4, size: 30, color: '#FF6347' },
    { name: 'Kelinci', icon: '🐇', score: 40, health: 40, speed: 4.5, size: 25, color: '#F5F5F5' },
    { name: 'Tupai', icon: '️', score: 30, health: 30, speed: 5, size: 20, color: '#A0522D' },
    { name: 'Ular', icon: '🐍', score: 50, health: 50, speed: 2, size: 35, color: '#228B22' },
    { name: 'Buaya', icon: '🐊', score: 180, health: 160, speed: 1.5, size: 55, color: '#556B2F' },
    { name: 'Kera', icon: '🐒', score: 70, health: 80, speed: 3.5, size: 35, color: '#8B4513' },
    { name: 'Gajah', icon: '🐘', score: 350, health: 300, speed: 1, size: 80, color: '#808080' },
    { name: 'Badak', icon: '', score: 320, health: 280, speed: 1.2, size: 75, color: '#696969' },
    { name: 'Zebra', icon: '🦓', score: 130, health: 120, speed: 3, size: 50, color: '#FFFFFF' },
    { name: 'Jerapah', icon: '🦒', score: 160, health: 140, speed: 2, size: 70, color: '#FFD700' },
    { name: 'Singa', icon: '🦁', score: 280, health: 200, speed: 3.5, size: 55, color: '#FFA500' },
    { name: 'Kuda', icon: '🐎', score: 110, health: 100, speed: 4, size: 50, color: '#8B4513' },
    { name: 'Sapi', icon: '🐄', score: 90, health: 110, speed: 1.5, size: 50, color: '#000000' },
    { name: 'Kambing', icon: '🐐', score: 60, health: 65, speed: 2.5, size: 35, color: '#FFFFFF' }
];

class Animal {
    constructor(data, x, y) {
        this.name = data.name;
        this.icon = data.icon;
        this.score = data.score;
        this.maxHealth = data.health;
        this.health = data.health;
        this.speed = data.speed;
        this.size = data.size;
        this.color = data.color;
        this.x = x;
        this.y = y;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.moveTimer = 0;
        this.alive = true;
        this.id = Date.now() + Math.random();
    }

    update(canvasWidth, canvasHeight) {
        if (!this.alive) return;

        this.moveTimer++;
        
        // Change direction randomly
        if (this.moveTimer > 100 + Math.random() * 100) {
            this.direction *= -1;
            this.moveTimer = 0;
        }

        // Move
        this.x += this.speed * this.direction;
        
        // Boundary check
        if (this.x < this.size) {
            this.x = this.size;
            this.direction = 1;
        }
        if (this.x > canvasWidth - this.size) {
            this.x = canvasWidth - this.size;
            this.direction = -1;
        }

        // Slight vertical movement
        if (Math.random() < 0.02) {
            this.y += (Math.random() - 0.5) * 20;
            this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }

    render(ctx) {
        if (!this.alive) return;

        // Draw animal
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size/2, this.size/2, this.size/6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animal icon
        ctx.fillText(this.icon, this.x, this.y);

        // Health bar
        if (this.health < this.maxHealth) {
            const barWidth = this.size;
            const barHeight = 5;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 10, barWidth, barHeight);
            
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 10, barWidth * healthPercent, barHeight);
        }
    }
}

class AnimalManager {
    constructor() {
        this.animals = [];
        this.spawnTimer = 0;
    }

    spawn(canvasWidth, canvasHeight) {
        const randomAnimal = ANIMALS_DB[Math.floor(Math.random() * ANIMALS_DB.length)];
        const x = Math.random() * (canvasWidth - 100) + 50;
        const y = Math.random() * (canvasHeight - 100) + 50;
        
        const animal = new Animal(randomAnimal, x, y);
        this.animals.push(animal);
        
        return animal;
    }

    update(canvasWidth, canvasHeight) {
        this.animals = this.animals.filter(animal => animal.alive);
        this.animals.forEach(animal => animal.update(canvasWidth, canvasHeight));
    }

    render(ctx) {
        this.animals.forEach(animal => animal.render(ctx));
    }

    checkShot(x, y, weapon) {
        for (let animal of this.animals) {
            if (!animal.alive) continue;

            const dx = x - animal.x;
            const dy = y - animal.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < animal.size/2 + 10) {
                // Check weapon range
                if (distance <= weapon.range) {
                    const killed = animal.takeDamage(weapon.damage);
                    return {
                        hit: true,
                        killed: killed,
                        animal: animal,
                        score: killed ? animal.score : 0
                    };
                } else {
                    return { hit: true, killed: false, message: 'Terlalu jauh!' };
                }
            }
        }
        return { hit: false };
    }

    getAnimalCount() {
        return this.animals.filter(a => a.alive).length;
    }
}