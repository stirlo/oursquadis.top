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
        'https://planetpixelemporium.com/download/download.php?mercurymap.jpg', // Mercury
        'https://threejs.org/examples/textures/planets/venus.jpg', // Venus
        'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg', // Earth
        'https://threejs.org/examples/textures/planets/mars.jpg', // Mars
        'https://threejs.org/examples/textures/planets/jupiter.jpg', // Jupiter
        'https://threejs.org/examples/textures/planets/saturn.jpg', // Saturn
        'https://threejs.org/examples/textures/planets/uranus.jpg', // Uranus
        'https://threejs.org/examples/textures/planets/neptune.jpg', // Neptune
        'https://threejs.org/examples/textures/planets/pluto.jpg' // Pluto
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
