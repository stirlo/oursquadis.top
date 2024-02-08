document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(8000, 8000); // Increased ground size for larger trees
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Tree function with significantly increased scale
    function createTree(x, z) {
        const trunkHeight = 100; // Significantly increased height
        const trunkRadius = 5; // Increased radius for visibility
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z); // Adjusted for increased height

        const leavesHeight = 50; // Increased height for leaves
        const leavesRadius = 20; // Increased radius for a larger canopy
        const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight + leavesHeight / 2, z); // Adjusted for increased size

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        scene.add(tree);
        return tree;
    }

    // Trees array for dynamic creation and movement
    let trees = [];
    const treeCount = 500; // Reduced tree count to manage performance with larger trees
    for (let i = 0; i < treeCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(7000); // Adjusted for the increased ground area
        const z = THREE.MathUtils.randFloatSpread(-16000, -8000); // Extended spread towards the horizon
        trees.push(createTree(x, z));
    }

    // Adjusting camera perspective to better capture the scale of the trees
    camera.position.set(0, 800, 1600); // Adjusted camera position for a comprehensive view
    camera.lookAt(0, 0, 0);

    // Animation loop for moving trees to create the illusion of forward movement
    const animate = () => {
        requestAnimationFrame(animate);

        // Move trees towards the camera
        trees.forEach(tree => {
            tree.position.z += 5; // Increased speed of movement towards the camera
            if (tree.position.z > 500) { // Check if the tree has moved past the camera
                tree.position.z = THREE.MathUtils.randFloatSpread(-16000, -8000); // Reset tree position back towards the horizon
            }
        });

        renderer.render(scene, camera);
    };
    animate();
});
