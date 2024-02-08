document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    // Position the camera to a higher point and angle it downwards
    camera.position.set(0, 1500, 1500);
    camera.lookAt(new THREE.Vector3(0, 0, -2000)); // Look at a point further down the z-axis

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(8000, 8000);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Tree function
    function createTree() {
        const trunkHeight = 100; // Tree height
        const trunkRadius = 5; // Tree width
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        const leavesHeight = 50; // Leaves height
        const leavesRadius = 20; // Leaves width
        const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = trunkHeight;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        tree.position.set(THREE.MathUtils.randFloatSpread(7000), 0, THREE.MathUtils.randFloatSpread(-8000, -4000));

        return tree;
    }

    // Trees array for dynamic creation and movement
    let trees = [];
    const treeCount = 500; // Number of trees
    for (let i = 0; i < treeCount; i++) {
        const tree = createTree();
        trees.push(tree);
        scene.add(tree);
    }

    // Starry sky
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1.0, sizeAttenuation: true });
    const starVertices = [];
    for (let i = 0; i < 20000; i++) {
        starVertices.push(THREE.MathUtils.randFloatSpread(10000), THREE.MathUtils.randFloat(500, 3000), THREE.MathUtils.randFloatSpread(10000));
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Move trees towards the camera
        trees.forEach(tree => {
            tree.position.z += 5;
            if (tree.position.z > 500) {
                tree.position.z = THREE.MathUtils.randFloatSpread(-8000, -4000); // Reset tree position
            }
        });

        renderer.render(scene, camera);
    };

    animate();
});

