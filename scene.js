// Import necessary modules from Three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.117.1/build/three.module.js';

function initScene() {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Array of planet texture URLs
    const planetTextures = [
        '8k_mercury.jpg', // Mercury
        '8k_venus_surface.jpg', // Venus
        '2k_earth_daymap.jpg', // Earth
        '8k_mars.jpg', // Mars
        '8k_jupiter.jpg', // Jupiter
        '8k_sun.jpg', // Sun
        '8k_moon.jpg', // Moon
        '2k_uranus.jpg', // Uranus
        '2k_neptune.jpg', // Neptune
    ];

    // Randomly select a planet texture
    const randomTextureUrl = planetTextures[Math.floor(Math.random() * planetTextures.length)];

    // Planet geometry and texture
    const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
    const planetTexture = new THREE.TextureLoader().load(randomTextureUrl);
    const planetMaterial = new THREE.MeshPhongMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);

    // Milky Way background
    const bgGeometry = new THREE.SphereGeometry(500, 64, 64);
    const bgTexture = new THREE.TextureLoader().load('milkyway.jpg');
    const bgMaterial = new THREE.MeshBasicMaterial({
        map: bgTexture,
        side: THREE.BackSide
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(background);

    // Camera position
    camera.position.z = 3;

    // Animation: Rotate the planet
    const rotationSpeed = 2 * Math.PI / 60; // One full rotation per minute

    function animate() {
        requestAnimationFrame(animate);

        // Rotate the planet
        planet.rotation.y += rotationSpeed / 60; // Divide by 60 for 60 FPS

        renderer.render(scene, camera);
    }

    animate();

    // Add click event listener to renderer's canvas
    renderer.domElement.addEventListener('click', () => {
        window.location.href = 'https://stirlo.space';
    });

    // Add keydown event listener to document
    document.addEventListener('keydown', () => {
        window.location.href = 'https://stirlo.space';
    });
}

initScene();
