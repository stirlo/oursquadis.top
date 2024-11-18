// Imports and Initial Setup
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Camera and controls setup
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 100, 200);
controls.update();

// Base shaders
const standardVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const starVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const starFragmentShader = `
    uniform float time;
    uniform float temperature;
    uniform float intensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    // Improved noise function for better turbulence
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
        // Enhanced surface turbulence
        float turbulence = snoise(vPosition * 0.05 + time * 0.1) * 0.5 + 0.5;

        // Dynamic solar flares
        float flare = pow(snoise(vPosition + time * 0.2), 3.0) * 2.0;

        // Enhanced corona effect
        float corona = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

        // Temperature-based color
        vec3 hotColor = vec3(1.0, 0.6, 0.1);
        vec3 coolColor = vec3(1.0, 0.4, 0.0);
        vec3 baseColor = mix(coolColor, hotColor, temperature / 6000.0);

        // Nuclear fusion glow effect
        float fusionGlow = snoise(vPosition * 0.1 + time * 0.05) * 0.5 + 0.5;

        // Combine all effects
        vec3 finalColor = mix(baseColor, vec3(1.0, 0.8, 0.3), 
                            corona * 0.5 + turbulence * 0.3 + flare + fusionGlow * 0.2);

        // Add intensity variation
        finalColor *= (1.0 + sin(time * 0.5) * 0.1);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;
// Celestial Body Data
const celestialData = {
    '2k_sun.jpg': {
        rotationPeriod: 27,
        axialTilt: 7.25,
        size: 109,  // Relative to Earth
        isStar: true,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFF4500),
        atmosphereSize: 1.15,
        starData: {
            temperature: 5778, // Kelvin
            luminosity: 1.0,   // Solar luminosity
            coronaData: {
                intensity: 2.0,
                pulseSpeed: 0.5,
                flareFrequency: 0.2
            }
        }
    },
    '2k_mercury.jpg': {
        rotationPeriod: 58.6,
        axialTilt: 0.034,
        size: 0.383,
        isStar: false,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: false,
        orbitDistance: 35
    },
    '2k_venus.jpg': {
        rotationPeriod: -243,
        axialTilt: 177.4,
        size: 0.949,
        isStar: false,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFA500),
        atmosphereSize: 1.05,
        orbitDistance: 50
    },
    '2k_earth.jpg': {
        rotationPeriod: 1,
        axialTilt: 23.44,
        size: 1,
        isStar: false,
        hasRings: false,
        hasMoon: true,
        moons: [{
            texture: '2k_moon.jpg',
            size: 0.273,
            distance: 2,
            rotationPeriod: 27.3
        }],
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0x4B87FF),
        atmosphereSize: 1.02,
        orbitDistance: 65
    },
    '2k_mars.jpg': {
        rotationPeriod: 1.03,
        axialTilt: 25.19,
        size: 0.532,
        isStar: false,
        hasRings: false,
        hasMoon: true,
        moons: [
            {
                texture: '2k_phobos.jpg',
                size: 0.005,
                distance: 1.4,
                rotationPeriod: 0.32
            },
            {
                texture: '2k_deimos.jpg',
                size: 0.003,
                distance: 1.8,
                rotationPeriod: 1.26
            }
        ],
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFF6B4B),
        atmosphereSize: 1.01,
        orbitDistance: 80
    },
    '2k_jupiter.jpg': {
        rotationPeriod: 0.41,
        axialTilt: 3.13,
        size: 11.209,
        isStar: false,
        hasRings: true,
        ringColor: new THREE.Color(0xA88B5D),
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFAB5B),
        atmosphereSize: 1.05,
        orbitDistance: 110
    }
    // Additional planets can be added following the same pattern
};

// Material configurations
const materialConfigs = {
    star: {
        emissive: new THREE.Color(0xFFFF00),
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 1.0
    },
    planet: {
        metalness: 0.3,
        roughness: 0.7
    },
    atmosphere: {
        transparent: true,
        opacity: 0.3
    }
};
// Helper Functions and Object Creation

function createStar(textureFile, data) {
    const group = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    // Create the star material with enhanced shaders
    const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            temperature: { value: data.starData.temperature },
            intensity: { value: data.starData.coronaData.intensity },
            texture: { value: textureLoader.load(textureFile) }
        },
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true
    });

    // Create the star mesh
    const starGeometry = new THREE.SphereGeometry(data.size, 64, 64);
    const star = new THREE.Mesh(starGeometry, starMaterial);

    // Add point light for star illumination
    const starLight = new THREE.PointLight(0xFFFFFF, 2, 1000);
    star.add(starLight);

    // Create corona effect
    const coronaGeometry = new THREE.SphereGeometry(
        data.size * data.atmosphereSize,
        32,
        32
    );
    const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            intensity: { value: data.starData.coronaData.intensity }
        },
        vertexShader: standardVertexShader,
        fragmentShader: `
            uniform float time;
            uniform float intensity;
            varying vec3 vNormal;

            void main() {
                float corona = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                vec3 color = vec3(1.0, 0.6, 0.1) * corona * intensity;
                gl_FragColor = vec4(color, corona * 0.5);
            }
        `,
        transparent: true,
        side: THREE.BackSide
    });

    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    star.add(corona);

    // Add rotation
    star.userData.rotationSpeed = (2 * Math.PI) / (data.rotationPeriod * 24);

    group.add(star);
    return { group, object: star };
}

function createPlanet(textureFile, data, orbitRadius) {
    const group = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    // Create planet material
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(textureFile),
        ...materialConfigs.planet
    });

    // Create planet mesh
    const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    // Apply axial tilt
    planet.rotation.x = data.axialTilt * Math.PI / 180;

    // Add rotation speed to userData
    planet.userData.rotationSpeed = (2 * Math.PI) / (data.rotationPeriod * 24);

    // Create atmosphere if planet has one
    if (data.hasAtmosphere) {
        const atmosphereGeometry = new THREE.SphereGeometry(
            data.size * data.atmosphereSize,
            32,
            32
        );
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: data.atmosphereColor,
            ...materialConfigs.atmosphere
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
    }

    // Create rings if planet has them
    if (data.hasRings) {
        const ringGeometry = new THREE.RingGeometry(
            data.size * 1.4,
            data.size * 2.0,
            64
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: data.ringColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }

    // Create moons if planet has them
    if (data.hasMoon && data.moons) {
        data.moons.forEach(moonData => {
            const moonGroup = createMoon(moonData, data.size);
            planet.add(moonGroup.group);
        });
    }

    group.add(planet);

    // Position in orbit
    group.position.x = orbitRadius;

    return { group, object: planet };
}

function createMoon(moonData, planetSize) {
    const group = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    const moonMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load(moonData.texture),
        ...materialConfigs.planet
    });

    const moonGeometry = new THREE.SphereGeometry(moonData.size, 32, 32);
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    // Position moon relative to planet
    moon.position.x = planetSize * moonData.distance;

    // Add rotation speed to userData
    moon.userData.rotationSpeed = (2 * Math.PI) / (moonData.rotationPeriod * 24);

    group.add(moon);
    return { group, object: moon };
}
// Scene Initialization and Animation

// Create orbit lines
function createOrbitLine(radius) {
    const segments = 128;
    const orbitGeometry = new THREE.BufferGeometry();
    const points = [];

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
            Math.cos(theta) * radius,
            0,
            Math.sin(theta) * radius
        );
    }

    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
    });

    return new THREE.Line(orbitGeometry, orbitMaterial);
}

// Initialize celestial bodies
const celestialBodies = {};
let time = 0;

// Create all celestial bodies
function initializeSolarSystem() {
    // Create the sun first
    const sunData = createStar('2k_sun.jpg', celestialData['2k_sun.jpg']);
    celestialBodies.sun = sunData;
    scene.add(sunData.group);

    // Create planets
    Object.entries(celestialData).forEach(([texture, data]) => {
        if (!data.isStar) {
            // Create orbit line
            const orbitLine = createOrbitLine(data.orbitDistance);
            scene.add(orbitLine);

            // Create planet
            const planetData = createPlanet(texture, data, data.orbitDistance);
            celestialBodies[texture] = planetData;
            scene.add(planetData.group);
        }
    });

    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

    // Update all celestial bodies
    Object.entries(celestialBodies).forEach(([key, data]) => {
        const bodyData = celestialData[key];

        // Rotate body
        if (data.object) {
            data.object.rotation.y += data.object.userData.rotationSpeed;
        }

        // Orbit planets around sun
        if (!bodyData.isStar) {
            data.group.position.x = Math.cos(time * 0.5) * bodyData.orbitDistance;
            data.group.position.z = Math.sin(time * 0.5) * bodyData.orbitDistance;
        }

        // Update star shader uniforms
        if (bodyData.isStar) {
            const material = data.object.material;
            if (material.uniforms) {
                material.uniforms.time.value = time;
            }

            // Update corona if it exists
            const corona = data.object.children.find(child => child.material.uniforms);
            if (corona) {
                corona.material.uniforms.time.value = time;
            }
        }
    });

    // Update controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Event listeners
window.addEventListener('resize', onWindowResize, false);

// Initialize and start animation
initializeSolarSystem();
animate();
