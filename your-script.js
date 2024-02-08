
document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Ground
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Instanced mesh for trees, rocks, and bushes
    const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const treeGeometry = new THREE.CylinderGeometry(0.1, 0.2, 3, 32);
    const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });
    const leavesGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
    const rockMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const rockGeometry = new THREE.DodecahedronGeometry(0.3);
    const bushMaterial = new THREE.MeshBasicMaterial({ color: 0x2E8B57 });
    const bushGeometry = new THREE.SphereGeometry(0.5, 32, 32);

    // Helper function to add objects
    function addObject(x, z, geometry, material) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);
        scene.add(mesh);
    }

    // Populate the scene
    const elements = 1000;
    for (let i = 0; i < elements; i++) {
        const x = THREE.MathUtils.randFloatSpread(500);
        const z = THREE.MathUtils.randFloatSpread(500);
        const choice = Math.random();
        if (choice < 0.5) {
            addObject(x, z, treeGeometry, treeMaterial);
            addObject(x, z + 1.5, leavesGeometry, leavesMaterial); // Offset for leaves
        } else if (choice < 0.75) {
            addObject(x, z, rockGeometry, rockMaterial);
        } else {
            addObject(x, z, bushGeometry, bushMaterial);
        }
    }

    // Starry sky
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const stars = 2000;
    for (let i = 0; i < stars; i++) {
        const x = THREE.MathUtils.randFloatSpread(1000);
        const y = THREE.MathUtils.randFloat(200, 300);
        const z = THREE.MathUtils.randFloatSpread(1000);
        addObject(x, y, starGeometry, starMaterial);
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
