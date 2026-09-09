// Tambahkan di class WeaponManager:

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

// 3D Weapon Class
class Weapon3D {
    constructor(type, x, z, scene) {
        this.type = type;
        this.found = false;
        this.damage = { 'axe': 25, 'bow': 50, 'sniper': 100 }[type] || 0;
        this.range = { 'axe': 50, 'bow': 200, 'sniper': 400 }[type] || 0;
        this.ammo = { 'axe': Infinity, 'bow': 30, 'sniper': 10 }[type] || 0;
        this.icon = { 'axe': '🪓', 'bow': '', 'sniper': '🔫' }[type] || '❓';
        
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
            if (this.ammo !== Infinity) {
                this.ammo--;
            }
            return true;
        }
        return false;
    }

    update(time) {
        if (this.mesh && !this.found) {
            // Floating animation
            this.mesh.position.y = 3 + Math.sin(time * 0.003 + this.mesh.userData.floatOffset) * 0.5;
            this.mesh.rotation.y += 0.02;
        }
    }
}
