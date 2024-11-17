import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';

const planetData = {
    '2k_mercury.jpg': {
        rotationPeriod: 58.6,
        axialTilt: 0.034,
        size: 0.383,
        hasMoon: false
    },
    '2k_venus_surface.jpg': {
        rotationPeriod: -243,
        axialTilt: 177.4,
        size: 0.949,
        hasMoon: false
    },
    '2k_earth_daymap.jpg': {
        rotationPeriod: 1,
        axialTilt: 23.4,
        size: 1,
        hasMoon: true,
        moonData: {
            size: 0.27,
            distance: 2,
            rotationPeriod: 27.3,
            color: 0xDDDDDD  // Earth's moon - light grey
        }
    },
    '2k_mars.jpg': {
        rotationPeriod: 1.03,
        axialTilt: 25.2,
        size: 0.532,
        hasMoon: true,
        moonData: {
            size: 0.1,
            distance: 1.5,
            rotationPeriod: 30.3,
            moons: [
                { color: 0xC0A080 },  // Phobos - brownish
                { color: 0xB0A090 }   // Deimos - slightly lighter brown
            ]
        }
    },
    '2k_jupiter.jpg': {
        rotationPeriod: 0.41,
        axialTilt: 3.1,
        size: 11.21,
        hasMoon: true,
        moonData: {
            size: 0.286,
            distance: 3,
            rotationPeriod: 1.77,
            moons: [
                { color: 0xC2B5A3 },  // Io - yellowish
                { color: 0x8B8B8B },  // Europa - icy white
                { color: 0x8B4513 },  // Ganymede - brown
                { color: 0x4A4A4A }   // Callisto - dark grey
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
        moonData: {
            size: 0.404,
            distance: 3.5,
            rotationPeriod: 15.95,
            moons: [
                { color: 0xE5E5E5 }  // Titan - bright white-yellow
            ]
        }
    },
    '2k_uranus.jpg': {
        rotationPeriod: -0.72,
        axialTilt: 97.8,
        size: 4.01,
        hasMoon: true,
        moonData: {
            size: 0.15,
            distance: 2.5,
            rotationPeriod: 8.7,
            moons: [
                { color: 0xCCCCCC }  // Generic icy moon color
            ]
        }
    },
    '2k_neptune.jpg': {
        rotationPeriod: 0.67,
        axialTilt: 28.3,
        size: 3.88,
        hasMoon: true,
        moonData: {
            size: 0.18,
            distance: 2.7,
            rotationPeriod: 5.877,
            moons: [
                { color: 0xD3D3D3 }  // Triton - light grey
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

function initScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const planetTextures = Object.keys(planetData);
    const randomTextureUrl = planetTextures[Math.floor(Math.random() * planetTextures.length)];
    const planetInfo = planetData[randomTextureUrl];

    const celestialGroup = new THREE.Group();

    const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
    const planetTexture = new THREE.TextureLoader().load(randomTextureUrl);
    const planetMaterial = new THREE.MeshPhongMaterial({ 
        map: planetTexture,
        shininess: 5
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.rotation.x = THREE.MathUtils.degToRad(planetInfo.axialTilt);
    celestialGroup.add(planet);

    if (planetInfo.hasRings) {
        const rings = createSaturnRings(planet);
        rings.rotation.x = Math.PI / 2;
        celestialGroup.add(rings);
    }

    if (planetInfo.hasMoon) {
        const moonGroup = new THREE.Group();

        if (randomTextureUrl === '2k_earth_daymap.jpg') {
            const moonGeometry = new THREE.SphereGeometry(
                planetInfo.moonData.size * 0.27,
                32,
                32
            );
            const moonTexture = new THREE.TextureLoader().load('2k_moon.jpg');
            const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture });
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

    const sunLight = new THREE.PointLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

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

        const rotationSpeed = (2 * Math.PI) / (planetInfo.rotationPeriod * 60);
        planet.rotation.y += rotationSpeed;

        if (planetInfo.hasMoon && celestialGroup.moonGroup) {
            const moonRotationSpeed = (2 * Math.PI) / (planetInfo.moonData.rotationPeriod * 60);
            celestialGroup.moonGroup.rotation.y += moonRotationSpeed;
        }

        renderer.render(scene, camera);
    }

    animate();

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
