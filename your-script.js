document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000); // Set background color to black
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Tree function
    function createTree(x, z) {
        const trunkHeight = Math.random() * 2 + 1; // Random height between 1 and 3
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, trunkHeight / 2, z);

        const leavesHeight = Math.random() * 1 + 0.5; // Random height between 0.5 and 1.5
        const leavesGeometry = new THREE.ConeGeometry(0.5, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight + leavesHeight / 2, z); // Corrected to sit on top of the trunk

        // Group trunk and leaves together
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        scene.add(tree);
        return tree;
    }

    // Array to hold trees
    let trees = [];

    // Populate initial trees
    for (let i = 0; i < 100; i++) {
        const x = THREE.MathUtils.randFloatSpread(500);
        const z = THREE.MathUtils.randFloatSpread(-500, 0); // Start from the horizon to near the camera
        trees.push(createTree(x, z));
    }

    // Function to reset tree position
    function resetTree(tree) {
        const x = THREE.MathUtils.randFloatSpread(500);
        const z = -500; // Move back to the horizon
        tree.position.set(x, 0, z);
    }

   // Starry sky
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 1.5,
        sizeAttenuation: true
    });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(1000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Move trees towards the camera
        trees.forEach(tree => {
            tree.position.z += 2; // Adjust speed as needed
            if (tree.position.z > 50) { // Check if the tree has moved past the camera
                resetTree(tree); // Reset its position back to the horizon
            }
        });

        renderer.render(scene, camera);
    };
    animate();
});
