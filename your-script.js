document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Increasing the ground plane size
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(4000, 4000); // Doubled ground plane size
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0; // Correctly positioned at y = 0
    scene.add(ground);

    // Tree function with adjusted positioning and scaling
    function createTree(x, z) {
        const trunkHeight = Math.random() * 2 + 1;
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z); // Ensuring base is at ground level

        const leavesHeight = Math.random() * 1 + 0.5;
        const leavesGeometry = new THREE.ConeGeometry(0.5, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight + leavesHeight / 2, z);

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        scene.add(tree);
        return tree;
    }

    // Trees array and dynamic creation logic
    let trees = [];
    const treeCount = 5000; // Target number of trees
    for (let i = 0; i < treeCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(3200); // Adjusted for the increased ground plane size
        const z = THREE.MathUtils.randFloatSpread(-8000, -4000); // Extended spread towards the horizon
        trees.push(createTree(x, z));
    }

    // Adjusting camera perspective for clarity
    camera.position.set(0, 500, 1000); // Adjusted camera position for a better overview
    camera.lookAt(0, 0, 0);

    // Animation loop for smooth infinite terrain
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();
});
