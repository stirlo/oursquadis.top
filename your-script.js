document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Basic colors
    const colors = {
        ground: 0x228B22, // Green
        treeTrunk: 0x8B4513, // Brown
        treeLeaves: 0x006400, // DarkGreen
        star: 0xFFFFFF // White
    };

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(400, 400);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: colors.ground });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to lay flat
    scene.add(ground);

    // Tree function
    const createTree = (x, z) => {
        const trunkHeight = Math.random() * 2 + 1; // Random height between 1 and 3
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: colors.treeTrunk });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z);
        scene.add(trunk);

        const leavesHeight = Math.random() * 1 + 0.5; // Random height between 0.5 and 1.5
        const leavesGeometry = new THREE.ConeGeometry(0.5, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: colors.treeLeaves });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight + leavesHeight / 2, z);
        scene.add(leaves);
    };

    // Create forest
    const numberOfTrees = 200;
    for (let i = 0; i < numberOfTrees; i++) {
        const x = THREE.MathUtils.randFloatSpread(400); // Spread trees across the ground
        const z = THREE.MathUtils.randFloatSpread(400);
        createTree(x, z);
    }

    // Starry sky
    const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: colors.star });
    const stars = 1000;
    for (let i = 0; i < stars; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const x = THREE.MathUtils.randFloatSpread(200);
        const y = THREE.MathUtils.randFloat(100, 200); // Keep stars in the top third
        const z = THREE.MathUtils.randFloatSpread(200);
        star.position.set(x, y, z);
        scene.add(star);
    }

    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();
});
