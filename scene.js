import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';

// Shader Definitions
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
uniform float atmosphereIntensity;
void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(atmosphereColor * atmosphereIntensity, intensity);
}`;

const ringVertexShader = `
varying vec2 vUv;
varying float vDistance;
void main() {
    vUv = uv;
    vDistance = length(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ringFragmentShader = `
varying vec2 vUv;
varying float vDistance;
uniform float innerRadius;
uniform float outerRadius;
uniform vec3 ringColor;
void main() {
    float alpha = smoothstep(innerRadius, innerRadius + 0.1, vDistance);
    alpha *= 1.0 - smoothstep(outerRadius - 0.1, outerRadius, vDistance);
    float density = (1.0 - (vDistance - innerRadius) / (outerRadius - innerRadius));
    gl_FragColor = vec4(ringColor, alpha * density);
}`;

// Planet Data
const planetData = {
    '2k_mercury.jpg': {
        rotationPeriod: 58.6,  // Earth days
        axialTilt: 0.034,
        size: 0.383,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: false
    },
    '2k_venus.jpg': {
        rotationPeriod: -243,  // Negative for retrograde rotation
        axialTilt: 177.4,
        size: 0.949,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFA500),
        atmosphereSize: 1.05
    },
    '2k_earth.jpg': {
        rotationPeriod: 1,     // Base unit - 1 Earth day
        axialTilt: 23.5,
        size: 1,               // Base unit for planet sizes
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
        ringData: {
            innerRadius: 1.1,
            outerRadius: 1.8,
            segments: 96,
            ringColor: new THREE.Color(0x8B7355),
            rotationPeriod: 0.4,
            particleDensity: 4000,
            divisions: 4
        },
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFA07A),
        atmosphereSize: 1.03,
        moonData: {
            moons: [
                {
                    name: 'Io',
                    size: 0.286,
                    distance: 3.2,
                    rotationPeriod: 1.77,
                    inclination: 0.04,
                    color: 0xFFD700,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Europa',
                    size: 0.245,
                    distance: 3.8,
                    rotationPeriod: 3.55,
                    inclination: 0.47,
                    color: 0xF5F5DC,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Ganymede',
                    size: 0.413,
                    distance: 4.4,
                    rotationPeriod: 7.15,
                    inclination: 0.18,
                    color: 0xDEB887,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Callisto',
                    size: 0.378,
                    distance: 5.0,
                    rotationPeriod: 16.69,
                    inclination: 0.28,
                    color: 0x696969,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    },
    '2k_saturn.jpg': {
        rotationPeriod: 0.44,
        axialTilt: 26.7,
        size: 9.45,
        hasRings: true,
        ringData: {
            innerRadius: 1.2,
            outerRadius: 2.3,
            segments: 128,
            ringColor: new THREE.Color(0xE6D9B8),
            rotationPeriod: 0.42,
            particleDensity: 8000,
            divisions: 5
        },
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xF7E5B2),
        atmosphereSize: 1.04,
        moonData: {
            moons: [
                {
                    name: 'Titan',
                    size: 0.404,
                    distance: 3.5,
                    rotationPeriod: 15.95,
                    inclination: 0.33,
                    color: 0xE5E5E5,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Rhea',
                    size: 0.12,
                    distance: 4.1,
                    rotationPeriod: 4.518,
                    inclination: 0.35,
                    color: 0xDBDBDB,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Iapetus',
                    size: 0.115,
                    distance: 4.7,
                    rotationPeriod: 79.32,
                    inclination: 15.47,
                    color: 0xC2C2C2,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    },
    '2k_uranus.jpg': {
        rotationPeriod: -0.72,  // Negative for retrograde rotation
        axialTilt: 97.77,
        size: 4.007,
        hasRings: true,
        ringData: {
            innerRadius: 1.1,
            outerRadius: 1.6,
            segments: 96,
            ringColor: new THREE.Color(0x8B8B8B),
            rotationPeriod: 0.7,
            particleDensity: 3000,
            divisions: 3
        },
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xB4CFEC),
        atmosphereSize: 1.02,
        moonData: {
            moons: [
                {
                    name: 'Titania',
                    size: 0.124,
                    distance: 3.2,
                    rotationPeriod: 8.71,
                    inclination: 0.14,
                    color: 0xDCDCDC,
                    startAngle: Math.random() * Math.PI * 2
                },
                {
                    name: 'Oberon',
                    size: 0.119,
                    distance: 3.8,
                    rotationPeriod: 13.46,
                    inclination: 0.10,
                    color: 0xD3D3D3,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    },
    '2k_neptune.jpg': {
        rotationPeriod: 0.67,
        axialTilt: 28.32,
        size: 3.883,
        hasRings: true,
        ringData: {
            innerRadius: 1.1,
            outerRadius: 1.5,
            segments: 96,
            ringColor: new THREE.Color(0x4682B4),
            rotationPeriod: 0.65,
            particleDensity: 2000,
            divisions: 3
        },
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x4169E1),
        atmosphereSize: 1.02,
        moonData: {
            moons: [
                {
                    name: 'Triton',
                    size: 0.212,
                    distance: 3.5,
                    rotationPeriod: -5.877,
                    inclination: 156.885,
                    color: 0xE8E8E8,
                    startAngle: Math.random() * Math.PI * 2
                }
            ]
        }
    }
};

// Helper Functions
function createPlanet(texture, size) {
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.05,
    });
    return new THREE.Mesh(geometry, material);
}

function createAtmosphere(size, atmosphereColor) {
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        uniforms: {
            atmosphereColor: { value: atmosphereColor },
            atmosphereIntensity: { value: 1.0 }
        }
    });
    return new THREE.Mesh(geometry, material);
}

function createSaturnRings(ringData) {
    const ringGroup = new THREE.Group();

    // Create main ring structure using custom shader
    const ringGeometry = new THREE.RingGeometry(
        ringData.innerRadius,
        ringData.outerRadius,
        ringData.segments,
        ringData.divisions
    );

    const ringMaterial = new THREE.ShaderMaterial({
        vertexShader: ringVertexShader,
        fragmentShader: ringFragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        uniforms: {
            innerRadius: { value: ringData.innerRadius },
            outerRadius: { value: ringData.outerRadius },
            ringColor: { value: ringData.ringColor }
        }
    });

    const mainRing = new THREE.Mesh(ringGeometry, ringMaterial);
    ringGroup.add(mainRing);

    // Add particle detail
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ringData.particleDensity * 3);
    const colors = new Float32Array(ringData.particleDensity * 3);

    for (let i = 0; i < ringData.particleDensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = ringData.innerRadius + 
            (Math.random() * (ringData.outerRadius - ringData.innerRadius));

        // Gaussian distribution for vertical displacement
        const verticalDisp = (Math.random() + Math.random() + Math.random() - 1.5) * 0.02;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = verticalDisp;
        positions[i * 3 + 2] = Math.sin(angle) * radius;

        // Color variation based on radius
        const colorIntensity = 0.7 + 
            (radius - ringData.innerRadius) / (ringData.outerRadius - ringData.innerRadius) * 0.3;
        colors[i * 3] = colorIntensity;
        colors[i * 3 + 1] = colorIntensity * 0.95;
        colors[i * 3 + 2] = colorIntensity * 0.8;
    }

    particleGeometry.setAttribute('position', 
        new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', 
        new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    ringGroup.add(particles);

    // Add ring shadows
    const shadowGeometry = new THREE.RingGeometry(
        ringData.innerRadius * 0.98,
        ringData.outerRadius * 1.02,
        ringData.segments
    );
    const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = Math.PI / 2;
    ringGroup.add(shadow);

    return ringGroup;
}

function createMoonSystem(moonData) {
    const moonGroup = new THREE.Group();

    moonData.moons.forEach(moon => {
        const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            color: moon.color,
            shininess: 5
        });
        const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

        // Create individual orbit group for each moon
        const orbitGroup = new THREE.Group();
        orbitGroup.rotation.x = moon.inclination * Math.PI / 180;
        orbitGroup.add(moonMesh);

        // Set initial position
        moonMesh.position.x = moon.distance;

        moonMesh.userData = {
            orbitDistance: moon.distance,
            rotationPeriod: moon.rotationPeriod,
            startAngle: moon.startAngle
        };

        moonGroup.add(orbitGroup);
    });

    return moonGroup;
}

function createLighting(scene) {
    const lightGroup = new THREE.Group();

    // HDR-compatible sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(10, 0, 10);

    // Add bloom effect for HDR
    const bloomParams = {
        exposure: 1,
        bloomStrength: 1.5,
        bloomThreshold: 0.85,
        bloomRadius: 0.33
    };

    const rimLight = new THREE.DirectionalLight(0x335577, 0.4);
    rimLight.position.set(-10, 0, -10);

    const ambientLight = new THREE.AmbientLight(0x111111, 0.15);

    lightGroup.add(sunLight);
    lightGroup.add(rimLight);
    lightGroup.add(ambientLight);

    scene.add(lightGroup);

    return { sunLight, rimLight, lightGroup, bloomParams };
}

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize lighting
const lighting = createLighting(scene);

// Create celestial group to hold planet and its satellites
const celestialGroup = new THREE.Group();
scene.add(celestialGroup);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Base rotation speed (Earth = 1 rotation per minute)
    const baseRotationSpeed = (2 * Math.PI) / (60 * 60); // One rotation per minute for Earth
    const planetRotationSpeed = baseRotationSpeed / planetInfo.rotationPeriod;
    planet.rotation.y += planetRotationSpeed;

    // Moon animations with proper orbital mechanics
    if (planetInfo.hasMoon && celestialGroup.moonGroup) {
        planetInfo.moonData.moons.forEach((moon, index) => {
            const moonOrbit = celestialGroup.moonGroup.children[index];
            const moonMesh = moonOrbit.children[0];
            if (moonMesh) {
                const time = Date.now() * 0.001;
                const orbitSpeed = (2 * Math.PI) / (moon.rotationPeriod * 60);
                const angle = (time * orbitSpeed) + moon.startAngle;

                moonMesh.position.x = Math.cos(angle) * moon.distance;
                moonMesh.position.z = Math.sin(angle) * moon.distance;
            }
        });
    }

    // Saturn ring rotation
    if (planetInfo.hasRings && celestialGroup.rings) {
        celestialGroup.rings.rotation.y += baseRotationSpeed / planetInfo.ringData.rotationPeriod;
    }

    // Dynamic lighting
    const time = Date.now() * 0.0001;
    lighting.sunLight.position.x = Math.cos(time) * 10;
    lighting.sunLight.position.z = Math.sin(time) * 10;
    lighting.sunLight.position.y = Math.sin(time * 0.5) * 3;

    renderer.render(scene, camera);
}

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize camera position
camera.position.z = 5;

// Start animation
animate();

export { scene, camera, renderer, celestialGroup, lighting };
