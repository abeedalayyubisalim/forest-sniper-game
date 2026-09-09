// Tambahkan di akhir file animals.js

// 3D Animal Manager
class AnimalManager3D {
    constructor() {
        this.animals = [];
        this.meshes = [];
    }

    spawn(scene) {
        const randomAnimal = ANIMALS_DB[Math.floor(Math.random() * ANIMALS_DB.length)];
        const x = (Math.random() - 0.5) * 900;
        const z = (Math.random() - 0.5) * 900;
        
        const animal3D = new Animal3D(randomAnimal, x, z, scene);
        this.animals.push(animal3D);
        this.meshes.push(animal3D.mesh);
    }

    update() {
        this.animals = this.animals.filter(animal => animal.alive);
        this.animals.forEach(animal => animal.update());
    }

    getMeshes() {
        return this.meshes.filter(mesh => mesh.visible);
    }

    checkHit(mesh, damage) {
        const animal = this.animals.find(a => a.mesh === mesh || a.mesh.children.includes(mesh));
        if (animal && animal.alive) {
            const killed = animal.takeDamage(damage);
            if (killed) {
                // Remove mesh
                animal.mesh.visible = false;
                setTimeout(() => {
                    this.meshes = this.meshes.filter(m => m !== animal.mesh);
                }, 2000);
            }
            return {
                killed: killed,
                animalName: animal.name,
                score: killed ? animal.score : 0
            };
        }
        return null;
    }

    getAnimalCount() {
        return this.animals.filter(a => a.alive).length;
    }
}

// 3D Animal Class
class Animal3D {
    constructor(data, x, z, scene) {
        this.name = data.name;
        this.score = data.score;
        this.maxHealth = data.health;
        this.health = data.health;
        this.speed = data.speed;
        this.size = data.size / 10; // Scale down
        this.color = data.color || 0x8B4513;
        this.alive = true;
        this.id = Date.now() + Math.random();
        
        this.direction = new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        ).normalize();
        
        this.moveTimer = 0;
        this.scene = scene;
        
        this.createMesh(x, z);
    }

    createMesh(x, z) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, this.size, z);

        // Body
        const bodyGeometry = new THREE.BoxGeometry(this.size * 2, this.size * 1.5, this.size * 3);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = this.size * 0.75;
        body.castShadow = true;
        this.mesh.add(body);

        // Head
        const headGeometry = new THREE.BoxGeometry(this.size, this.size, this.size * 1.5);
        const head = new THREE.Mesh(headGeometry, bodyMaterial);
        head.position.set(0, this.size * 1.8, this.size * 1.5);
        head.castShadow = true;
        this.mesh.add(head);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(this.size * 0.3, this.size * 0.3, this.size, 6);
        const legPositions = [
            [-this.size * 0.8, 0, -this.size],
            [this.size * 0.8, 0, -this.size],
            [-this.size * 0.8, 0, this.size],
            [this.size * 0.8, 0, this.size]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, bodyMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.mesh.add(leg);
        });

        this.scene.add(this.mesh);
    }

    update() {
        if (!this.alive) return;

        this.moveTimer++;
        
        if (this.moveTimer > 100 + Math.random() * 100) {
            this.direction.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
            this.moveTimer = 0;
        }

        this.mesh.position.x += this.direction.x * this.speed;
        this.mesh.position.z += this.direction.z * this.speed;

        // Boundary check
        if (Math.abs(this.mesh.position.x) > 900 || Math.abs(this.mesh.position.z) > 900) {
            this.direction.multiplyScalar(-1);
        }

        // Rotate to face direction
        this.mesh.lookAt(
            this.mesh.position.x + this.direction.x,
            this.mesh.position.y,
            this.mesh.position.z + this.direction.z
        );
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }
}
