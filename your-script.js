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
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
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
    const treeSpacing = 5; // Increase spacing to avoid clumping
    for (let i = -20; i <= 20; i += treeSpacing) {
        for (let j = -20; j <= 20; j += treeSpacing) {
            if (Math.random() > 0.1) { // 90% chance to create a tree, slightly increased density
                createTree(i, j);
            }
        }
    }

    // Starry sky
    const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: colors.star });
    const stars = 1000;
    for (let i = 0; i < stars; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
        star.position.set(x, y, z);
        scene.add(star);
    }

    camera.position.set(0, 20, 50);
    camera.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();
});
