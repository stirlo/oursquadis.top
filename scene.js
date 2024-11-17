import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';

// Atmospheric shader definitions
const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const atmosphereFragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 atmosphereColor;
void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(atmosphereColor, intensity);
}`;

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
        atmosphereColor: new THREE.Color(0xf4c141),
        atmosphereSize: 1.05
    },
    '2k_earth_daymap.jpg': {
        rotationPeriod: 1,
        axialTilt: 23.4,
        size: 1,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x6b93d6),
        atmosphereSize: 1.025,
        moonData: {
            size: 0.27,
            distance: 2,
            rotationPeriod: 27.3,
            color: 0xDDDDDD
        }
    },
    '2k_mars.jpg': {
        rotationPeriod: 1.03,
        axialTilt: 25.2,
        size: 0.532,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xE67E22),
        atmosphereSize: 1.015,
        moonData: {
            size: 0.1,
            distance: 1.5,
            rotationPeriod: 30.3,
            moons: [
                { color: 0xC0A080 },  // Phobos
                { color: 0xB0A090 }   // Deimos
            ]
        }
    },
    '2k_jupiter.jpg': {
        rotationPeriod: 0.41,
        axialTilt: 3.1,
        size: 11.21,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xE8B27D),
        atmosphereSize: 1.05,
        moonData: {
            size: 0.286,
            distance: 3,
            rotationPeriod: 1.77,
            moons: [
                { color: 0xC2B5A3 },  // Io
                { color: 0x8B8B8B },  // Europa
                { color: 0x8B4513 },  // Ganymede
                { color: 0x4A4A4A }   // Callisto
            ]
        }
    },
    '2k_saturn.jpg': {
        rotationPeriod: 0.44,
        axialTilt: 26.7,
        size: 9.45,
        hasRings: true,
        ringInner: 1.2,
        ringOuter: 2.3,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xF7E5B2),
        atmosphereSize: 1.04,
        moonData: {
            size: 0.404,
            distance: 3.5,
            rotationPeriod: 15.95,
            moons: [
                { color: 0xE5E5E5 }  // Titan
            ]
        }
    },
    '2k_uranus.jpg': {
        rotationPeriod: -0.72,
        axialTilt: 97.8,
        size: 4.01,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x89CFF0),
        atmosphereSize: 1.03,
        moonData: {
            size: 0.15,
            distance: 2.5,
            rotationPeriod: 8.7,
            moons: [
                { color: 0xCCCCCC }
            ]
        }
    },
    '2k_neptune.jpg': {
        rotationPeriod: 0.67,
        axialTilt: 28.3,
        size: 3.88,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x4B70DD),
        atmosphereSize: 1.03,
        moonData: {
            size: 0.18,
            distance: 2.7,
            rotationPeriod: 5.877,
            moons: [
                { color: 0xD3D3D3 }  // Triton
            ]
        }
    }
};

function createBasicMoon(moonData) {
    const moonGeometry = new THREE.SphereGeometry(
        moonData.size * 0.27,
        24,
        24
    );
    const moonMaterial = new THREE.MeshPhongMaterial({ 
        color: moonData.color || 0xCCCCCC,
        shininess: 0.5
    });
    return new THREE.Mesh(moonGeometry, moonMaterial);
}

function createSaturnRings(planet) {
    const ringGroup = new THREE.Group();
    const particleCount = 10000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const radius = 1.2 + Math.random() * 1.1;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        colors[i * 3] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    ringGroup.add(particleSystem);

    return ringGroup;
}

function createAtmosphere(radius, atmosphereColor) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        uniforms: {
            atmosphereColor: { value: atmosphereColor }
        }
    });
    return new THREE.Mesh(geometry, material);
}

function createLighting(scene) {
    const lightGroup = new THREE.Group();

    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 0, 10);

    const rimLight = new THREE.DirectionalLight(0x335577, 0.25);
    rimLight.position.set(-10, 0, -10);

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
        specular: new THREE.Color(0x333333)
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.rotation.x = THREE.MathUtils.degToRad(planetInfo.axialTilt);
    celestialGroup.add(planet);

    // Add atmosphere if the planet has one
    if (planetInfo.hasAtmosphere) {
        const atmosphere = createAtmosphere(
            planetInfo.atmosphereSize || 1.025,
            planetInfo.atmosphereColor
        );
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

        // Planet rotation (halved speed)
        const rotationSpeed = (2 * Math.PI) / (planetInfo.rotationPeriod * 120);
        planet.rotation.y += rotationSpeed;

        // Moon rotation
        if (planetInfo.hasMoon && celestialGroup.moonGroup) {
            const moonRotationSpeed = (2 * Math.PI) / (planetInfo.moonData.rotationPeriod * 120);
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
