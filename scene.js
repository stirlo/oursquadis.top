// Imports and Initial Setup
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene, Camera, and Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 100, 200);
controls.update();

// Shaders
const sunVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const sunFragmentShader = `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec3 sunColor = vec3(1.0, 0.6, 0.1);
        vec3 atmosphereColor = vec3(1.0, 0.6, 0.1);
        float noise = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time) * 0.1;
        vec3 finalColor = mix(sunColor, atmosphereColor, intensity + noise);
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
// =============== START PART 2 OF 4 ===============
// Planet Data with correct texture names and properties
const planetData = {
    '2k_mercury.jpg': {
        rotationPeriod: 58.6,
        axialTilt: 0.034,
        size: 0.383,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: false
    },
    '2k_venus_surface.jpg': {
        rotationPeriod: -243,
        axialTilt: 177.4,
        size: 0.949,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFA500),
        atmosphereSize: 1.05
    },
    '2k_earth_daymap.jpg': {
        rotationPeriod: 1,
        axialTilt: 23.5,
        size: 1,
        hasRings: false,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x6B8CFF),
        atmosphereSize: 1.02,
        moonData: {
            moons: [{
                name: 'Moon',
                size: 0.2724,
                distance: 2,
                rotationPeriod: 27.3,
                inclination: 5.145,
                color: 0xDDDDDD,
                startAngle: Math.random() * Math.PI * 2
            }]
        }
    },
    '2k_mars.jpg': {
        rotationPeriod: 1.03,
        axialTilt: 25.2,
        size: 0.532,
        hasRings: false,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFF6B4C),
        atmosphereSize: 1.01,
        moonData: {
            moons: [
                {
                    name: 'Phobos',
                    size: 0.05,
                    distance: 1.4,
                    rotationPeriod: 0.32,
                    inclination: 1.08,
                    color: 0xBBAA99,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Deimos',
                    size: 0.03,
                    distance: 1.8,
                    rotationPeriod: 1.26,
                    inclination: 1.79,
                    color: 0xAA9988,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    },
    '2k_jupiter.jpg': {
        rotationPeriod: 0.41,
        axialTilt: 3.13,
        size: 11.209,
        hasRings: true,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFE4B5),
        atmosphereSize: 1.02,
        ringData: {
            innerRadius: 11.5,
            outerRadius: 13,
            color: 0xA89480,
            opacity: 0.6
        },
        moonData: {
            moons: [
                {
                    name: 'Io',
                    size: 0.286,
                    distance: 13.5,
                    rotationPeriod: 1.77,
                    inclination: 0.04,
                    color: 0xFFFF00,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Europa',
                    size: 0.245,
                    distance: 14.5,
                    rotationPeriod: 3.55,
                    inclination: 0.47,
                    color: 0xA5A5A5,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Ganymede',
                    size: 0.413,
                    distance: 15.5,
                    rotationPeriod: 7.15,
                    inclination: 0.18,
                    color: 0x8B7355,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Callisto',
                    size: 0.378,
                    distance: 16.5,
                    rotationPeriod: 16.69,
                    inclination: 0.19,
                    color: 0x4A4A4A,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    },
    '2k_saturn.jpg': {
        rotationPeriod: 0.45,
        axialTilt: 26.73,
        size: 9.449,
        hasRings: true,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFF8DC),
        atmosphereSize: 1.02,
        ringData: {
            innerRadius: 10.0,
            outerRadius: 15.0,
            cassiniDivision: {
                radius: 12.5,
                width: 0.5
            },
            color: 0xCDBA96,
            opacity: 0.8
        },
        moonData: {
            moons: [
                {
                    name: 'Titan',
                    size: 0.404,
                    distance: 16,
                    rotationPeriod: 15.95,
                    inclination: 0.33,
                    color: 0xFFD700,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    },
    '2k_uranus.jpg': {
        rotationPeriod: 0.72,
        axialTilt: 97.77,
        size: 4.007,
        hasRings: true,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xE0FFFF),
        atmosphereSize: 1.02,
        ringData: {
            innerRadius: 4.5,
            outerRadius: 5.5,
            color: 0x4682B4,
            opacity: 0.4
        }
    },
    '2k_neptune.jpg': {
        rotationPeriod: 0.67,
        axialTilt: 28.32,
        size: 3.883,
        hasRings: true,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x4169E1),
        atmosphereSize: 1.02,
        ringData: {
            innerRadius: 4.2,
            outerRadius: 5.0,
            color: 0x4682B4,
            opacity: 0.4
        }
    }
};
// =============== START PART 3 OF 4 ===============
// Helper Functions
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(20, 64, 64);
    const sunMaterial = new THREE.ShaderMaterial({
        vertexShader: sunVertexShader,
        fragmentShader: sunFragmentShader,
        uniforms: {
            time: { value: 0 }
        }
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);

    // Add sun glow
    const sunGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load('sunflare.png'),
            color: 0xffff00,
            transparent: true,
            blending: THREE.AdditiveBlending
        })
    );
    sunGlow.scale.set(40, 40, 1);
    sun.add(sunGlow);

    return sun;
}

function createPlanet(texture, data, orbitRadius) {
    const group = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    // Planet mesh
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load(texture),
        bumpScale: 0.05
    });
    const planet = new THREE.Mesh(geometry, material);

    // Apply axial tilt
    planet.rotation.x = THREE.MathUtils.degToRad(data.axialTilt);

    // Add atmosphere if applicable
    if (data.hasAtmosphere) {
        const atmosphereGeometry = new THREE.SphereGeometry(data.size * data.atmosphereSize, 32, 32);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: data.atmosphereColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
    }

    // Add rings if applicable
    if (data.hasRings && data.ringData) {
        const ringGeometry = new THREE.RingGeometry(
            data.ringData.innerRadius,
            data.ringData.outerRadius,
            64
        );
        const ringMaterial = new THREE.MeshPhongMaterial({
            color: data.ringData.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: data.ringData.opacity
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;

        // Add Cassini Division for Saturn
        if (data.ringData.cassiniDivision) {
            const divisionGeometry = new THREE.RingGeometry(
                data.ringData.cassiniDivision.radius - data.ringData.cassiniDivision.width / 2,
                data.ringData.cassiniDivision.radius + data.ringData.cassiniDivision.width / 2,
                64
            );
            const divisionMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const division = new THREE.Mesh(divisionGeometry, divisionMaterial);
            division.rotation.x = Math.PI / 2;
            rings.add(division);
        }

        planet.add(rings);
    }

    // Add moons if applicable
    if (data.hasMoon && data.moonData) {
        data.moonData.moons.forEach(moonData => {
            const moonGeometry = new THREE.SphereGeometry(moonData.size, 16, 16);
            const moonMaterial = new THREE.MeshPhongMaterial({ color: moonData.color });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);

            const moonOrbit = new THREE.Group();
            moonOrbit.rotation.x = THREE.MathUtils.degToRad(moonData.inclination);
            moonOrbit.add(moon);

            moon.position.x = moonData.distance;
            moon.userData.rotationSpeed = 2 * Math.PI / (moonData.rotationPeriod * 24);
            moon.userData.startAngle = moonData.startAngle;

            planet.add(moonOrbit);
        });
    }

    // Create orbit line
    const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.1, orbitRadius + 0.1, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });
    const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = Math.PI / 2;
    group.add(orbitLine);

    group.add(planet);
    planet.userData.rotationSpeed = 2 * Math.PI / (data.rotationPeriod * 24);

    return { group, planet };
}

// =============== START PART 4 OF 4 ===============
// Create Milky Way background
function createGalaxyBackground() {
    const textureLoader = new THREE.TextureLoader();
    const galaxyTexture = textureLoader.load('milkyway.jpg');
    const skyGeometry = new THREE.SphereGeometry(3000, 60, 40);
    skyGeometry.scale(-1, 1, 1);

    const skyMaterial = new THREE.MeshBasicMaterial({
        map: galaxyTexture,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.3
    });

    return new THREE.Mesh(skyGeometry, skyMaterial);
}

// Scene initialization
const sun = createSun();
scene.add(sun);

// Add ambient and point lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xFFFFFF, 2, 1000);
scene.add(sunLight);

// Add Milky Way background
scene.add(createGalaxyBackground());

// Create planets
let orbitRadius = 30; // Starting orbit radius
const planetObjects = {};
Object.entries(planetData).forEach(([texture, data]) => {
    orbitRadius += data.size * 3 + 10; // Adjust orbit spacing based on planet size
    const { group, planet } = createPlanet(texture, data, orbitRadius);
    planetObjects[texture] = { group, planet, orbitRadius };
    scene.add(group);
});

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);

    // Update sun shader
    sun.material.uniforms.time.value = time * 0.001;

    // Update planets
    Object.values(planetObjects).forEach(({ group, planet, orbitRadius }) => {
        // Orbit around sun
        const angle = time * 0.0001 / Math.sqrt(orbitRadius);
        group.position.x = Math.cos(angle) * orbitRadius;
        group.position.z = Math.sin(angle) * orbitRadius;

        // Planet rotation
        planet.rotation.y += planet.userData.rotationSpeed;

        // Update moons
        planet.children.forEach(child => {
            if (child instanceof THREE.Group) { // Moon orbit
                child.rotation.y += child.children[0].userData.rotationSpeed;
            }
        });
    });

    controls.update();
    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate(0);