// PointerLockControls - Inline version (tidak perlu load dari CDN)
THREE.PointerLockControls = function (camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document.body;
    this.isLocked = false;

    const scope = this;
    const changeEvent = { type: 'change' };
    const lockEvent = { type: 'lock' };
    const unlockEvent = { type: 'unlock' };

    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    const PI_2 = Math.PI / 2;

    function onMouseMove(event) {
        if (scope.isLocked === false) return;

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.setFromQuaternion(camera.quaternion);
        euler.y -= movementX * 0.002;
        euler.x -= movementY * 0.002;
        euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
        camera.quaternion.setFromEuler(euler);

        scope.dispatchEvent(changeEvent);
    }

    function onPointerlockChange() {
        if (document.pointerLockElement === scope.domElement) {
            scope.dispatchEvent(lockEvent);
            scope.isLocked = true;
        } else {
            scope.dispatchEvent(unlockEvent);
            scope.isLocked = false;
        }
    }

    function onPointerlockError() {
        console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
    }

    this.connect = function () {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('pointerlockchange', onPointerlockChange);
        document.addEventListener('pointerlockerror', onPointerlockError);
    };

    this.disconnect = function () {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('pointerlockchange', onPointerlockChange);
        document.removeEventListener('pointerlockerror', onPointerlockError);
    };

    this.dispose = function () {
        this.disconnect();
    };

    this.getObject = function () {
        return camera;
    };

    this.getDirection = function () {
        const direction = new THREE.Vector3(0, 0, -1);
        return function (v) {
            return v.copy(direction).applyQuaternion(camera.quaternion);
        };
    }();

    this.moveForward = function (distance) {
        const v = new THREE.Vector3();
        return function (distance) {
            v.setFromMatrixColumn(camera.matrix, 0);
            v.crossVectors(camera.up, v);
            camera.position.addScaledVector(v, distance);
        };
    }();

    this.moveRight = function (distance) {
        const v = new THREE.Vector3();
        return function (distance) {
            v.setFromMatrixColumn(camera.matrix, 0);
            camera.position.addScaledVector(v, distance);
        };
    }();

    this.lock = function () {
        this.domElement.requestPointerLock();
    };

    this.unlock = function () {
        document.exitPointerLock();
    };

    this.connect();
};

THREE.PointerLockControls.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;
