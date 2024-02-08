document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(4000, 4000); // Ground plane size
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0; // Ground positioned at y = 0
    scene.add(ground);

    // Tree function with corrected trunk base positioning
    function createTree(x, z) {
        const trunkHeight = Math.random() * 2 + 1;
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z); // Base of the trunk at y = 0

        const leavesHeight = Math.random() * 1 + 0.5;
        const leavesGeometry = new THREE.ConeGeometry(0.5, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight, z);

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        scene.add(tree);
        return tree;
    }

    // Trees array for dynamic creation and movement
    let trees = [];
    const treeCount = 5000; // Number of trees
    for (let i = 0; i < treeCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(3200); // Spread within the ground area
        const z = THREE.MathUtils.randFloatSpread(-8000, -4000); // Extended spread towards the horizon
        trees.push(createTree(x, z));
    }

    // Starry sky with adjusted values
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1.5, sizeAttenuation: true });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(4000); // Match the ground plane spread
        const y = THREE.MathUtils.randFloat(50, 1500); // Adjusted to ensure stars cover from just above the ground to higher up
        const z = THREE.MathUtils.randFloatSpread(4000); // Match the ground plane spread
        starVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Adjusting camera perspective
    camera.position.set(0, 500, 1000); // Camera position for a better overview
    camera.lookAt(0, 0, 0);

    // Animation loop for moving trees to create the illusion of forward movement
    const animate = () => {
        requestAnimationFrame(animate);

        // Move trees towards the camera
        trees.forEach(tree => {
            tree.position.z += 2; // Speed of movement towards the camera
            if (tree.position.z > 200) { // Check if the tree has moved past the camera
                tree.position.z = THREE.MathUtils.randFloatSpread(-8000, -4000); // Reset tree position back towards the horizon
            }
        });

        renderer.render(scene, camera);
    };
    animate();
});
