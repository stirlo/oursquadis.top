import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';

// First, let's add atmospheric shader definitions
const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const atmosphereFragmentShader = `
varying vec3 vNormal;
void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, intensity);
}`;

// Planet data with atmospheric properties
const planetData = {
    '2k_mercury.jpg': {
        rotationPeriod: 58.6,
        axialTilt: 0.034,
        size: 0.383,
        hasMoon: false,
        hasAtmosphere: false
    },
    '2k_venus_surface.jpg': {
        rotationPeriod: -243,
        axialTilt: 177.4,
        size: 0.949,
        hasMoon: false,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xf4c141)
    },
    '2k_earth_daymap.jpg': {
        rotationPeriod: 1,
        axialTilt: 23.4,
        size: 1,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x6b93d6),
        moonData: {
            size: 0.27,
            distance: 2,
            rotationPeriod: 27.3,
            color: 0xDDDDDD
        }
    },
    // ... [Previous planet data remains the same]
};

function createAtmosphere(radius, color) {
    const geometry = new THREE.SphereGeometry(radius * 1.025, 32, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    return new THREE.Mesh(geometry, material);
}

function createLighting(scene) {
    const lightGroup = new THREE.Group();

    // Main sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 0, 10);

    // Rim light for atmosphere highlight
    const rimLight = new THREE.DirectionalLight(0x335577, 0.25);
    rimLight.position.set(-10, 0, -10);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x111111, 0.1);

    lightGroup.add(sunLight);
    lightGroup.add(rimLight);
    lightGroup.add(ambientLight);

    scene.add(lightGroup);

    return { sunLight, rimLight, lightGroup };
}

function initScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const planetTextures = Object.keys(planetData);
    const randomTextureUrl = planetTextures[Math.floor(Math.random() * planetTextures.length)];
    const planetInfo = planetData[randomTextureUrl];

    const celestialGroup = new THREE.Group();

    // Create planet
    const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
    const planetTexture = new THREE.TextureLoader().load(randomTextureUrl);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
        map: planetTexture,
        shininess: 25,
        specular: new THREE.Color(0x333333),
        bumpScale: 0.05
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.rotation.x = THREE.MathUtils.degToRad(planetInfo.axialTilt);
    celestialGroup.add(planet);

    // Add atmosphere if the planet has one
    if (planetInfo.hasAtmosphere) {
        const atmosphere = createAtmosphere(1, planetInfo.atmosphereColor);
        celestialGroup.add(atmosphere);
    }

    // Add rings for Saturn
    if (planetInfo.hasRings) {
        const rings = createSaturnRings(planet);
        rings.rotation.x = Math.PI / 2;
        celestialGroup.add(rings);
    }

    // Add moons
    if (planetInfo.hasMoon) {
        const moonGroup = new THREE.Group();

        if (randomTextureUrl === '2k_earth_daymap.jpg') {
            const moonGeometry = new THREE.SphereGeometry(
                planetInfo.moonData.size * 0.27,
                32,
                32
            );
            const moonTexture = new THREE.TextureLoader().load('2k_moon.jpg');
            const moonMaterial = new THREE.MeshPhongMaterial({ 
                map: moonTexture,
                shininess: 5
            });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.x = planetInfo.moonData.distance;
            moonGroup.add(moon);
        } else if (planetInfo.moonData.moons) {
            planetInfo.moonData.moons.forEach((moonInfo, index) => {
                const moon = createBasicMoon({
                    size: planetInfo.moonData.size,
                    color: moonInfo.color
                });
                moon.position.x = planetInfo.moonData.distance + (index * 0.5);
                moonGroup.add(moon);
            });
        }

        celestialGroup.add(moonGroup);
        celestialGroup.moonGroup = moonGroup;
    }

    scene.add(celestialGroup);

    // Setup lighting
    const lighting = createLighting(scene);

    // Background
    const bgGeometry = new THREE.SphereGeometry(500, 64, 64);
    const bgTexture = new THREE.TextureLoader().load('milkyway.jpg');
    const bgMaterial = new THREE.MeshBasicMaterial({
        map: bgTexture,
        side: THREE.BackSide
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(background);

    camera.position.z = 3;

    function animate() {
        requestAnimationFrame(animate);

        // Planet rotation
        const rotationSpeed = (2 * Math.PI) / (planetInfo.rotationPeriod * 60);
        planet.rotation.y += rotationSpeed;

        // Moon rotation
        if (planetInfo.hasMoon && celestialGroup.moonGroup) {
            const moonRotationSpeed = (2 * Math.PI) / (planetInfo.moonData.rotationPeriod * 60);
            celestialGroup.moonGroup.rotation.y += moonRotationSpeed;
        }

        // Update lighting
        const time = Date.now() * 0.0001;
        lighting.sunLight.position.x = Math.cos(time) * 10;
        lighting.sunLight.position.z = Math.sin(time) * 10;
        lighting.sunLight.position.y = Math.sin(time * 0.5) * 3; // Seasonal effect

        renderer.render(scene, camera);
    }

    animate();

    // Event listeners
    renderer.domElement.addEventListener('click', () => {
        window.location.href = 'https://stirlo.space';
    });

    document.addEventListener('keydown', () => {
        window.location.href = 'https://stirlo.space';
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

initScene();
