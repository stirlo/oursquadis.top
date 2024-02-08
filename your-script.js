document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(4000, 4000);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Tree function with significantly increased scale
    function createTree(x, z) {
        const trunkHeight = Math.random() * 20 + 10; // Substantially increased height
        const trunkRadius = 1; // Increased radius for visibility
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.5, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z);

        const leavesHeight = Math.random() * 10 + 5; // Increased height for leaves
        const leavesRadius = 4; // Increased radius for a larger canopy
        const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight + leavesHeight / 2, z);

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        scene.add(tree);
        return tree;
    }

    // Trees array for dynamic creation and movement
    let trees = [];
    const treeCount = 5000;
    for (let i = 0; i < treeCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(3200); // Spread within the ground area
        const z = THREE.MathUtils.randFloatSpread(-8000, -4000); // Extended spread towards the horizon
        trees.push(createTree(x, z));
    }

    // Adjusting camera perspective to better capture the scale of the trees
    camera.position.set(0, 200, 500); // Lower and closer to the ground for a better view of the trees
    camera.lookAt(0, 0, 0);

    // Animation loop for moving trees to create the illusion of forward movement
    const animate = () => {
        requestAnimationFrame(animate);

        // Move trees towards the camera
        trees.forEach(tree => {
            tree.position.z += 2;
            if (tree.position.z > 200) {
                tree.position.z = THREE.MathUtils.randFloatSpread(-8000, -4000);
            }
        });

        renderer.render(scene, camera);
    };
    animate();
});
