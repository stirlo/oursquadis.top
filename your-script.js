
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
        rock: 0x808080, // Grey
        bush: 0x2E8B57, // SeaGreen
        star: 0xFFFFFF // White
    };

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
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

    // Rock function
    const createRock = (x, z) => {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.1);
        const rockMaterial = new THREE.MeshBasicMaterial({ color: colors.rock });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, 0, z);
        scene.add(rock);
    };

    // Bush function
    const createBush = (x, z) => {
        const bushGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.25, 32, 32);
        const bushMaterial = new THREE.MeshBasicMaterial({ color: colors.bush });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        bush.position.set(x, 0, z);
        scene.add(bush);
    };

    // Create forest, rocks, and bushes
    const elements = 1000; // Increased number of elements
    for (let i = 0; i < elements; i++) {
        const x = THREE.MathUtils.randFloatSpread(500); // Increased spread
        const z = THREE.MathUtils.randFloatSpread(500);
        const elementType = Math.random();
        if (elementType < 0.5) {
            createTree(x, z);
        } else if (elementType < 0.75) {
            createRock(x, z);
        } else {
            createBush(x, z);
        }
    }

    // Starry sky
    const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: colors.star });
    const stars = 2000; // Increased number of stars for better visibility
    for (let i = 0; i < stars; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const x = THREE.MathUtils.randFloatSpread(1000); // Wider spread
        const y = THREE.MathUtils.randFloat(200, 300); // Positioned higher
        const z = THREE.MathUtils.randFloatSpread(100); 
        star.position.set(x, y, z);
        scene.add(star);
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
