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
        'https://solarsystem.nasa.gov/system/resources/detail_files/531_PIA17386.jpg', // Mercury
        'https://upload.wikimedia.org/wikipedia/commons/1/1c/Solarsystemscope_texture_8k_venus_surface.jpg', // Venus
        'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', // Earth
        'https://www.solarsystemscope.com/textures/download/2k_mars.jpg', // Mars
        'https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg', // Jupiter
        'https://www.solarsystemscope.com/textures/download/2k_saturn.jpg', // Saturn
        'https://www.solarsystemscope.com/textures/download/2k_uranus.jpg', // Uranus
        'https://www.solarsystemscope.com/textures/download/2k_neptune.jpg', // Neptune
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
    const bgTexture = new THREE.TextureLoader().load('https://www.eso.org/public/archives/images/large/eso0932a.jpg');
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
