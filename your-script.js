document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 500, 1500);
    camera.lookAt(0, 0, 0);

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
        const trunkHeight = 100; // Significantly increased height
        const trunkRadius = 5; // Increased radius for visibility
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 32);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        const leavesHeight = 50; // Increased height for leaves
        const leavesRadius = 20; // Increased radius for a larger canopy
        const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 32);
        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = trunkHeight;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        tree.position.set(THREE.MathUtils.randFloatSpread(7000), 0, THREE.MathUtils.randFloatSpread(-16000, -8000));

        return tree;
    }

    // Create and add trees to the scene
    const trees = [];
    for (let i = 0; i < 500; i++) {
        const tree = createTree();
        trees.push(tree);
        scene.add(tree);
    }

    // Starry sky
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 1.0, sizeAttenuation: true });
    const starVertices = [];
    for (let i = 0; i < 20000; i++) {
        starVertices.push(THREE.MathUtils.randFloatSpread(20000), THREE.MathUtils.randFloat(1000, 3000), THREE.MathUtils.randFloatSpread(20000));
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Move trees towards the camera to simulate forward motion
        trees.forEach(tree => {
            tree.position.z += 5;
            if (tree.position.z > 500) {
                tree.position.z = THREE.MathUtils.randFloatSpread(-16000, -8000);
            }
        });

        renderer.render(scene, camera);
    }

    animate();
});
