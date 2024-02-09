

// Import necessary modules from Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js';

function initScene() {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Earth geometry and texture
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    // Milky Way background
    const bgGeometry = new THREE.SphereGeometry(500, 64, 64);
        const bgTexture = new THREE.TextureLoader().load('https://www.eso.org/public/archives/images/large/eso0932a.jpg'); // Replace 'MilkyWayTextureURL' with the actual texture URL
  const bgMaterial = new THREE.MeshBasicMaterial({
        map: bgTexture,
        side: THREE.BackSide
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(background);

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
}

initScene();

// Redirect on click
document.addEventListener('click', function() {
    window.location.href = "https://stirlo.space";
});
