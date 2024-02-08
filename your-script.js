<!DOCTYPE html>
<html>
<head>
    <title>Rotating Earth</title>
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script src="https://threejs.org/build/three.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Earth geometry and texture
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const material = new THREE.MeshPhongMaterial({ map: texture });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 3, 5);
        scene.add(light);

        // Camera position
        camera.position.z = 3;

        // Animation: Rotate Earth
        const rotationSpeed = 2 * Math.PI / 60; // One full rotation per minute

        function animate() {
            requestAnimationFrame(animate);

            // Rotate Earth
            earth.rotation.y += rotationSpeed / 60; // Divide by 60 for 60 FPS

            renderer.render(scene, camera);
        }

        animate();
    </script>
</body>
</html>
