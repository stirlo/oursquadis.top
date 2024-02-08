document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5; // Ensure trees are placed above the ground
    scene.add(ground);

    // Tree function
    function createTree(x, z) {
        const trunkHeight = Math.random() * 2 + 1;
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 0, z); // Adjusted for correct ground positioning

        const leavesHeight = Math.random() * 1 + 0.5;
        const leavesGeometry = new THREE.ConeGeometry(0.5, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight, z); // Adjusted for correct ground positioning

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        scene.add(tree);
        return tree;
    }

    // Trees array and recycling logic
    let trees = [];
    const treeCount = 20000; // Significantly increased number of trees
    for (let i = 0; i < treeCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(800); // Spread within the ground area
        const z = THREE.MathUtils.randFloatSpread(-500); // Initial placement
        trees.push(createTree(x, z));
    }

    function resetTree(tree) {
        tree.position.x = THREE.MathUtils.randFloatSpread(800);
        tree.position.z = -500; // Reset back to the horizon
    }

    // Starry sky (unchanged, assuming star code remains the same)

    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // Animation loop for smooth infinite terrain
    const animate = () => {
        requestAnimationFrame(animate);

        // Move trees towards the camera for the illusion of forward movement
        trees.forEach(tree => {
            tree.position.z += 2; // Adjust speed as needed
            if (tree.position.z > 100) { // Reset when trees hit the bottom of the window
                resetTree(tree); // Recycle trees for a smooth infinite terrain illusion
            }
        });

        renderer.render(scene, camera);
    };
    animate();
});
