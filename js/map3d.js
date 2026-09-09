// 3D Forest Map Generator
class ForestMap3D {
    constructor(scene) {
        this.scene = scene;
        this.trees = [];
        this.rocks = [];
        this.bushes = [];
        this.rivers = [];
        this.colliders = [];
    }

    generate() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a7d3a });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Generate Trees
        const treeCount = 300;
        for (let i = 0; i < treeCount; i++) {
            this.createRandomTree();
        }

        // Generate Rocks
        const rockCount = 50;
        for (let i = 0; i < rockCount; i++) {
            this.createRandomRock();
        }

        // Generate Bushes
        const bushCount = 100;
        for (let i = 0; i < bushCount; i++) {
            this.createRandomBush();
        }

        // Generate River
        this.createRiver();
    }

    createRandomTree() {
        const x = (Math.random() - 0.5) * 1800;
        const z = (Math.random() - 0.5) * 1800;
        const type = Math.floor(Math.random() * 3);
        
        let tree;
        if (type === 0) {
            tree = this.createPineTree(x, z);
        } else if (type === 1) {
            tree = this.createOakTree(x, z);
        } else {
            tree = this.createBirchTree(x, z);
        }
        
        this.trees.push(tree);
        this.colliders.push({
            position: new THREE.Vector3(x, 0, z),
            radius: 3 + Math.random() * 5
        });
    }

    createPineTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 1, 8, 6);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 4;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves (cones)
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x1a5c1a });
        
        for (let i = 0; i < 3; i++) {
            const coneGeometry = new THREE.ConeGeometry(6 - i * 1.5, 10, 6);
            const cone = new THREE.Mesh(coneGeometry, leavesMaterial);
            cone.position.y = 10 + i * 5;
            cone.castShadow = true;
            group.add(cone);
        }

        this.scene.add(group);
        return group;
    }

    createOakTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1.5, 2, 10, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x3d2817 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 5;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves (sphere)
        const leavesGeometry = new THREE.SphereGeometry(12, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x2d7a2d });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 15;
        leaves.castShadow = true;
        group.add(leaves);

        this.scene.add(group);
        return group;
    }

    createBirchTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);

        // Trunk (white)
        const trunkGeometry = new THREE.CylinderGeometry(0.6, 1, 12, 6);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 6;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(8, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x4a9c4a });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 14;
        leaves.castShadow = true;
        group.add(leaves);

        this.scene.add(group);
        return group;
    }

    createRandomRock() {
        const x = (Math.random() - 0.5) * 1800;
        const z = (Math.random() - 0.5) * 1800;
        const size = 2 + Math.random() * 5;

        const geometry = new THREE.DodecahedronGeometry(size, 0);
        const material = new THREE.MeshLambertMaterial({ color: 0x696969 });
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(x, size/2, z);
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        this.scene.add(rock);
        this.rocks.push(rock);
        this.colliders.push({
            position: new THREE.Vector3(x, 0, z),
            radius: size
        });
    }

    createRandomBush() {
        const x = (Math.random() - 0.5) * 1800;
        const z = (Math.random() - 0.5) * 1800;
        const size = 1 + Math.random() * 3;

        const geometry = new THREE.SphereGeometry(size, 6, 4);
        const material = new THREE.MeshLambertMaterial({ color: 0x2d5a2d });
        const bush = new THREE.Mesh(geometry, material);
        bush.position.set(x, size/2, z);
        bush.castShadow = true;
        
        this.scene.add(bush);
        this.bushes.push(bush);
    }

    createRiver() {
        const riverGeometry = new THREE.PlaneGeometry(30, 1000, 10, 100);
        const riverMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1,
            transparent: true,
            opacity: 0.7
        });
        const river = new THREE.Mesh(riverGeometry, riverMaterial);
        river.rotation.x = -Math.PI / 2;
        river.position.y = 0.1;
        
        this.scene.add(river);
        this.rivers.push(river);
    }

    checkCollision(position, radius) {
        for (let collider of this.colliders) {
            const distance = position.distanceTo(collider.position);
            if (distance < radius + collider.radius) {
                return true;
            }
        }
        return false;
    }
}
