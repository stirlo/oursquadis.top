// ===== SECTION: IMPORTS =====
import * as THREE from 'https://oursquadis.top/three.module.js';
import { OrbitControls } from 'https://oursquadis.top/OrbitControls.js';
import { gsap } from 'https://oursquadis.top/gsap.min.js';
// ===== END SECTION: IMPORTS =====

// ===== SECTION: CONFIGURATIONS =====
const materialConfigs = {
    planet: {
        roughness: 0.7,
        metalness: 0.3
    },
    atmosphere: {
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    },
    rings: {
        basic: {
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false
        }
    }
};

const ringConfigs = {
    saturn: {
        divisions: [
            {
                innerRadius: 1.5,
                outerRadius: 2.3,
                density: 0.8,
                color: 0xA88B5D,
                particleSize: 0.05
            },
            {
                innerRadius: 1.8,
                outerRadius: 2.1,
                density: 0.6,
                color: 0x907A4F,
                particleSize: 0.03
            }
        ],
        particleCount: 10000,
        randomness: 0.2
    }
};

// ===== SECTION: BASIC SETUP =====
// Renderer setup with HDR
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance",
    logarithmicDepthBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 100, 200);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 1000;
controls.minDistance = 20;
// ===== END SECTION: BASIC SETUP =====
// ===== SECTION: SHADER DEFINITIONS =====
const noise3D = `
    // GLSL noise functions
    vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }

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
`;

const starVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const starFragmentShader = `
    uniform float time;
    uniform float temperature;
    uniform float intensity;
    uniform sampler2D texture;

    varying vec2 vUv;
    varying vec3 vNormal;

    vec3 blackbodyRadiation(float temp) {
        vec3 color;
        temp = clamp(temp, 1000.0, 40000.0);
        temp = temp / 100.0;

        if (temp <= 66.0) {
            color.r = 1.0;
            color.g = log(temp) * 0.2 - 0.5;
        } else {
            color.r = pow(temp - 60.0, -0.1);
            color.g = pow(temp - 60.0, -0.08);
        }

        if (temp >= 66.0) {
            color.b = 1.0;
        } else if (temp <= 19.0) {
            color.b = 0.0;
        } else {
            color.b = log(temp - 10.0) * 0.3 - 0.75;
        }

        return clamp(color, 0.0, 1.0);
    }

    void main() {
        vec4 texColor = texture2D(texture, vUv);
        vec3 bbColor = blackbodyRadiation(temperature);

        float surfaceDetail = texColor.r;
        float limb = pow(max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 0.6);
        float granulation = snoise(vec3(vUv * 100.0, time * 0.1)) * 0.1;

        vec3 finalColor = bbColor * (surfaceDetail + granulation) * limb * intensity;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

const coronaVertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const coronaFragmentShader = `
    uniform float time;
    uniform float intensity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    ${noise3D}

    void main() {
        float corona = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        float noise = snoise(vec3(vWorldPosition.xy * 0.01, time * 0.1));
        float flare = snoise(vec3(vWorldPosition.xy * 0.02, time * 0.2 + 1000.0));

        corona *= 1.0 + noise * 0.5 + flare * 0.3;
        corona *= intensity;

        vec3 color = mix(vec3(1.0, 0.4, 0.0), vec3(1.0, 0.8, 0.4), corona);

        gl_FragColor = vec4(color, corona * 0.5);
    }
`;
// ===== END SECTION: SHADER DEFINITIONS =====
// ===== SECTION: CELESTIAL DATA =====
const celestialData = {
    '2k_sun.jpg': {
        rotationPeriod: 27,
        axialTilt: 7.25,
        size: 109,
        isStar: true,
        hasRings: false,
        hasMoon: false,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFF4500),
        atmosphereSize: 1.15,
        starData: {
            temperature: 5778,
            luminosity: 5.0,
            coronaData: {
                intensity: 8.0,
                pulseSpeed: 0.5,
                flareFrequency: 0.2,
                flareIntensity: 2.0,
                coronaSize: 1.5
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
            rotationPeriod: 27.3,
            roughness: 0.8,
            metalness: 0.1
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
                color: 0x847e87,
                size: 0.005,
                distance: 1.4,
                rotationPeriod: 0.32,
                roughness: 0.9,
                metalness: 0.1
            },
            {
                color: 0x9c9691,
                size: 0.003,
                distance: 1.8,
                rotationPeriod: 1.26,
                roughness: 0.9,
                metalness: 0.1
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
    },
    '2k_saturn.jpg': {
        rotationPeriod: 0.445,
        axialTilt: 26.73,
        size: 9.449,
        isStar: false,
        hasRings: true,
        useDetailedRings: true,
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFF5E1),
        atmosphereSize: 1.05,
        orbitDistance: 140
    }
};
// ===== END SECTION: CELESTIAL DATA =====
// ===== SECTION: IMPLEMENTATION CLASSES =====
class RingSystem {
    constructor(planet, config) {
        this.planet = planet;
        this.config = config;
        this.rings = new THREE.Group();
        this.createRings();
    }

    createRings() {
        if (this.config.useDetailedRings) {
            this.createDetailedRings();
        } else {
            this.createBasicRings();
        }
    }

    createDetailedRings() {
        const { divisions, particleCount, randomness } = ringConfigs.saturn;

        divisions.forEach(division => {
            const ringGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const color = new THREE.Color(division.color);

            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.random() * Math.PI * 2);
                const radius = division.innerRadius + 
                    (Math.random() * (division.outerRadius - division.innerRadius));
                const randomOffset = (Math.random() - 0.5) * randomness;

                positions[i * 3] = Math.cos(angle) * radius;
                positions[i * 3 + 1] = randomOffset;
                positions[i * 3 + 2] = Math.sin(angle) * radius;

                colors[i * 3] = color.r * division.density;
                colors[i * 3 + 1] = color.g * division.density;
                colors[i * 3 + 2] = color.b * division.density;
            }

            ringGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            ringGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const ringMaterial = new THREE.PointsMaterial({
                size: division.particleSize,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                depthWrite: false
            });

            const ring = new THREE.Points(ringGeometry, ringMaterial);
            this.rings.add(ring);
        });
    }

    createBasicRings() {
        const innerRadius = this.planet.geometry.parameters.radius * 1.4;
        const outerRadius = this.planet.geometry.parameters.radius * 2.0;
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            ...materialConfigs.rings.basic,
            color: this.config.ringColor || 0xA88B5D
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        this.rings.add(ring);
    }

    update(time) {
        if (this.config.useDetailedRings) {
            this.rings.children.forEach(ring => {
                ring.rotation.y = time * 0.1;
            });
        }
    }
}

class SolarSystem {
    constructor(scene, celestialData) {
        this.scene = scene;
        this.celestialData = celestialData;
        this.objects = new Map();
        this.init();
    }

    init() {
        // Create sun first
        this.createSun();

        // Create planets
        Object.entries(this.celestialData)
            .filter(([_, data]) => !data.isStar)
            .forEach(([texture, data]) => {
                this.createPlanet(texture, data);
            });
    }

    createSun() {
        const sunData = this.celestialData['2k_sun.jpg'];
        const textureLoader = new THREE.TextureLoader();

        // Sun mesh
        const sunGeometry = new THREE.SphereGeometry(sunData.size, 64, 64);
        const sunMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                temperature: { value: sunData.starData.temperature },
                intensity: { value: sunData.starData.luminosity },
                texture: { value: textureLoader.load('2k_sun.jpg') }
            },
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader
        });

        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(sun);
        this.objects.set('sun', sun);

        // Corona
        const coronaGeometry = new THREE.SphereGeometry(
            sunData.size * sunData.starData.coronaData.coronaSize, 
            32, 
            32
        );
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: sunData.starData.coronaData.intensity }
            },
            vertexShader: coronaVertexShader,
            fragmentShader: coronaFragmentShader,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.scene.add(corona);
        this.objects.set('corona', corona);
    }

    createPlanet(textureName, data) {
        const textureLoader = new THREE.TextureLoader();
        const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            map: textureLoader.load(textureName),
            ...materialConfigs.planet
        });

        const planet = new THREE.Mesh(planetGeometry, planetMaterial);

        // Create orbit
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        const segments = 128;

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            orbitPoints.push(
                Math.cos(theta) * data.orbitDistance,
                0,
                Math.sin(theta) * data.orbitDistance
            );
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.2 });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

        this.scene.add(orbit);
        this.scene.add(planet);
        this.objects.set(textureName, { planet, orbit, data });

        // Add atmosphere if needed
        if (data.hasAtmosphere) {
            this.createAtmosphere(planet, data);
        }

        // Add rings if needed
        if (data.hasRings) {
            const ringSystem = new RingSystem(planet, data);
            planet.add(ringSystem.rings);
            this.objects.get(textureName).ringSystem = ringSystem;
        }
    }

    createAtmosphere(planet, data) {
        const atmosphereGeometry = new THREE.SphereGeometry(
            planet.geometry.parameters.radius * data.atmosphereSize,
            32,
            32
        );
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: data.atmosphereColor,
            ...materialConfigs.atmosphere
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
    }

    update(time) {
        // Update sun shaders
        const sunMaterial = this.objects.get('sun').material;
        const coronaMaterial = this.objects.get('corona').material;
        sunMaterial.uniforms.time.value = time;
        coronaMaterial.uniforms.time.value = time;

        // Update planets
        this.objects.forEach((obj, key) => {
            if (key !== 'sun' && key !== 'corona') {
                const { planet, data } = obj;
                const orbitSpeed = 1 / Math.sqrt(data.orbitDistance) * 0.5;
                const angle = time * orbitSpeed;

                planet.position.x = Math.cos(angle) * data.orbitDistance;
                planet.position.z = Math.sin(angle) * data.orbitDistance;
                planet.rotation.y += 0.01 / data.rotationPeriod;

                if (obj.ringSystem) {
                    obj.ringSystem.update(time);
                }
            }
        });
    }
}

// ===== END SECTION: IMPLEMENTATION CLASSES =====
// ===== SECTION: MAIN INITIALIZATION AND ANIMATION =====
const solarSystem = new SolarSystem(scene, celestialData);

// Lighting
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xFFFFFF, 2, 1000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);

    time += 0.001;
    solarSystem.update(time);
    controls.update();

    renderer.render(scene, camera);
}

// Event handlers
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize animation
animate();

// Optional: Export for external access
export { scene, camera, renderer, solarSystem };
