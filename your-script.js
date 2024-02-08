document.addEventListener("DOMContentLoaded", function() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Basic colors
    var colors = {
        ground: 0x8B4513, // Brown
        figure: 0x000000, // Black
    };

    // Ground
    var groundGeometry = new THREE.BoxGeometry(10, 0.5, 10);
    var groundMaterial = new THREE.MeshBasicMaterial({ color: colors.ground });
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(ground);

    // Stick figure function
    function createStickFigure(x, y, z) {
        var bodyGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        var bodyMaterial = new THREE.MeshBasicMaterial({ color: colors.figure });
        var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(x, y, z);
        scene.add(body);
    }

    // Create figures
    for (let i = -2; i <= 2; i++) {
        createStickFigure(i, 0.75, 0); // Bottom level
        if (i % 2 == 0) createStickFigure(i, 2, 0); // Top level
    }

    camera.position.z = 10;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
});
