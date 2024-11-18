// ===== SECTION: IMPORTS AND SETUP =====
import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

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
// ===== END SECTION: IMPORTS AND SETUP =====

// ===== SECTION: SHADER DEFINITIONS =====
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

        // Surface features
        float surfaceDetail = texColor.r;

        // Limb darkening
        float limb = pow(max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 0.6);

        // Solar granulation
        float granulation = snoise(vec3(vUv * 100.0, time * 0.1)) * 0.1;

        // Combine effects
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

    // Noise functions will be added here
    ${noise3D}

    void main() {
        float corona = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);

        // Add dynamic noise for corona movement
        float noise = snoise(vec3(vWorldPosition.xy * 0.01, time * 0.1));
        float flare = snoise(vec3(vWorldPosition.xy * 0.02, time * 0.2 + 1000.0));

        // Combine effects
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
            texture: '2k_moon.jpg', // Moon keeps its texture
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
                color: 0x847e87, // Grayish color for Phobos
                size: 0.005,
                distance: 1.4,
                rotationPeriod: 0.32,
                roughness: 0.9,
                metalness: 0.1
            },
            {
                color: 0x9c9691, // Light grayish-brown for Deimos
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
        useDetailedRings: true, // Flag for new ring system
        hasMoon: true,
        hasAtmosphere: true,
        atmosphereColor: new THREE.Color(0xFFF5E1),
        atmosphereSize: 1.05,
        orbitDistance: 140
    }
};
// ===== END SECTION: CELESTIAL DATA =====
// ===== SECTION: RING SYSTEM IMPLEMENTATION =====
class RingSystem {
    constructor(planet, config) {
        this.planet = planet;
        this.config = config;
        this.ringGroup = new THREE.Group();
        this.particleSystems = [];
    }

    create() {
        const { divisions, particleCount, randomness } = this.config;

        divisions.forEach(division => {
            // Create both instanced rings and particle systems for each division
            this.createInstancedRing(division);
            this.createParticleRing(division);
        });

        return this.ringGroup;
    }

    createInstancedRing(division) {
        const {innerRadius, outerRadius, density, color, particleSize} = division;
        const particlesPerRing = Math.floor(this.config.particleCount * density);

        // Create instanced mesh for larger particles
        const geometry = new THREE.CircleGeometry(particleSize, 6);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            roughness: 0.6,
            metalness: 0.3
        });

        const instancedMesh = new THREE.InstancedMesh(geometry, material, particlesPerRing);

        // Position instances in a ring pattern
        const dummy = new THREE.Object3D();
        const radiusRange = outerRadius - innerRadius;

        for(let i = 0; i < particlesPerRing; i++) {
            const angle = (i / particlesPerRing) * Math.PI * 2;
            const radius = innerRadius + Math.random() * radiusRange;

            // Add some vertical displacement for thickness
            const verticalOffset = (Math.random() - 0.5) * 0.1;

            dummy.position.x = Math.cos(angle) * radius;
            dummy.position.y = verticalOffset;
            dummy.position.z = Math.sin(angle) * radius;

            // Random rotation for variety
            dummy.rotation.x = Math.random() * Math.PI;
            dummy.rotation.z = Math.random() * Math.PI;

            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }

        this.ringGroup.add(instancedMesh);
    }

    createParticleRing(division) {
        const {innerRadius, outerRadius, density, color} = division;
        const particlesPerRing = Math.floor(this.config.particleCount * density * 0.3); // Less particles for dust

        const positions = new Float32Array(particlesPerRing * 3);
        const colors = new Float32Array(particlesPerRing * 3);
        const sizes = new Float32Array(particlesPerRing);

        const radiusRange = outerRadius - innerRadius;
        const colorObj = new THREE.Color(color);

        for(let i = 0; i < particlesPerRing; i++) {
            const angle = (i / particlesPerRing) * Math.PI * 2;
            const radius = innerRadius + Math.random() * radiusRange;

            const i3 = i * 3;
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.05; // Vertical spread
            positions[i3 + 2] = Math.sin(angle) * radius;

            // Vary the color slightly
            const colorVariation = 0.1;
            colors[i3] = colorObj.r + (Math.random() - 0.5) * colorVariation;
            colors[i3 + 1] = colorObj.g + (Math.random() - 0.5) * colorVariation;
            colors[i3 + 2] = colorObj.b + (Math.random() - 0.5) * colorVariation;

            sizes[i] = Math.random() * 0.5 + 0.1;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        this.particleSystems.push(particles);
        this.ringGroup.add(particles);
    }

    update(time) {
        // Animate particles subtly
        this.particleSystems.forEach(system => {
            const positions = system.geometry.attributes.position.array;
            for(let i = 0; i < positions.length; i += 3) {
                const angle = time * 0.0001;
                const radius = Math.sqrt(positions[i] ** 2 + positions[i + 2] ** 2);
                positions[i] = Math.cos(angle + i) * radius;
                positions[i + 2] = Math.sin(angle + i) * radius;
            }
            system.geometry.attributes.position.needsUpdate = true;
        });
    }
}

// Ring creation helper function
function createSaturnRings(planet) {
    const ringSystem = new RingSystem(planet, ringConfigs.saturn);
    return ringSystem.create();
}
// ===== END SECTION: RING SYSTEM IMPLEMENTATION =====
// ===== SECTION: SOLAR SYSTEM (SUN + CORONA + FLARES) =====
class SolarSystem {
    constructor(data) {
        this.data = data;
        this.group = new THREE.Group();
        this.flares = [];
        this.time = 0;
    }

    createSun() {
        // Core sun geometry
        const geometry = new THREE.SphereGeometry(this.data.size, 64, 64);

        // Custom shader material for the sun's surface
        const sunMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                temperature: { value: this.data.starData.temperature },
                intensity: { value: this.data.starData.luminosity },
                texture: { value: null } // Will be set when texture loads
            },
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
            transparent: true
        });

        this.sun = new THREE.Mesh(geometry, sunMaterial);

        // Create corona
        this.createCorona();

        // Create flare system
        this.createFlareSystem();

        // Add everything to the group
        this.group.add(this.sun);

        return this.group;
    }

    createCorona() {
        const coronaGeometry = new THREE.SphereGeometry(
            this.data.size * this.data.starData.coronaData.coronaSize, 
            32, 
            32
        );

        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: this.data.starData.coronaData.intensity }
            },
            vertexShader: coronaVertexShader,
            fragmentShader: coronaFragmentShader,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.group.add(this.corona);
    }

    createFlareSystem() {
        const flareCount = 5;
        const flareGeometry = new THREE.PlaneGeometry(
            this.data.size * 0.5, 
            this.data.size * 2
        );

        const flareMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        for (let i = 0; i < flareCount; i++) {
            const flare = new THREE.Mesh(flareGeometry, flareMaterial.clone());
            flare.rotation.z = (Math.PI * 2 / flareCount) * i;
            flare.userData = {
                baseRotation: flare.rotation.z,
                pulsePhase: Math.random() * Math.PI * 2
            };
            this.flares.push(flare);
            this.group.add(flare);
        }
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Update sun shader
        if (this.sun.material.uniforms) {
            this.sun.material.uniforms.time.value = this.time;
        }

        // Update corona
        if (this.corona.material.uniforms) {
            this.corona.material.uniforms.time.value = this.time;
        }

        // Update flares
        const flareSpeed = this.data.starData.coronaData.pulseSpeed;
        const flareIntensity = this.data.starData.coronaData.flareIntensity;

        this.flares.forEach(flare => {
            // Rotate flares slowly
            flare.rotation.z = flare.userData.baseRotation + this.time * 0.1;

            // Pulse flare intensity
            const pulse = Math.sin(this.time * flareSpeed + flare.userData.pulsePhase);
            flare.material.opacity = 0.3 + (pulse * 0.2 * flareIntensity);

            // Scale flares
            const scale = 1 + (pulse * 0.2);
            flare.scale.set(scale, scale, 1);
        });

        // Random solar flares
        if (Math.random() < this.data.starData.coronaData.flareFrequency * deltaTime) {
            this.createSolarFlare();
        }
    }

    createSolarFlare() {
        const flareGeometry = new THREE.BufferGeometry();
        const curvePoints = this.generateFlarePoints();
        const curve = new THREE.CatmullRomCurve3(curvePoints);
        const points = curve.getPoints(50);
        flareGeometry.setFromPoints(points);

        const flareMaterial = new THREE.LineBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        const flare = new THREE.Line(flareGeometry, flareMaterial);
        flare.userData = {
            lifetime: 2.0,
            age: 0
        };

        this.group.add(flare);

        // Remove flare after animation
        setTimeout(() => {
            this.group.remove(flare);
            flare.geometry.dispose();
            flare.material.dispose();
        }, 2000);
    }

    generateFlarePoints() {
        const points = [];
        const radius = this.data.size;
        const angle = Math.random() * Math.PI * 2;
        const height = radius * (0.5 + Math.random() * 0.5);

        // Start point on sun's surface
        const start = new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );

        // Control points for curve
        const ctrl1 = start.clone().multiplyScalar(1.2);
        const ctrl2 = new THREE.Vector3(
            Math.cos(angle) * (radius + height * 0.7),
            Math.sin(angle) * (radius + height * 0.7),
            (Math.random() - 0.5) * radius * 0.3
        );

        // End point
        const end = new THREE.Vector3(
            Math.cos(angle) * (radius + height),
            Math.sin(angle) * (radius + height),
            0
        );

        return [start, ctrl1, ctrl2, end];
    }
}

// Helper function to create the sun
function createSun(data) {
    const solarSystem = new SolarSystem(data);
    return solarSystem.createSun();
}
// ===== END SECTION: SOLAR SYSTEM (SUN + CORONA + FLARES) =====
// ===== SECTION: PLANET CREATION =====
class PlanetSystem {
    constructor(textureFile, data) {
        this.textureFile = textureFile;
        this.data = data;
        this.group = new THREE.Group();
        this.planetObj = null;
        this.moons = [];
        this.rings = null;
    }

    async create() {
        // Create main planet
        await this.createPlanet();

        // Add atmosphere if needed
        if (this.data.hasAtmosphere) {
            this.createAtmosphere();
        }

        // Add rings if needed
        if (this.data.hasRings) {
            this.createRings();
        }

        // Add moons if needed
        if (this.data.hasMoon && this.data.moons) {
            await this.createMoons();
        }

        return this.group;
    }

    async createPlanet() {
        const geometry = new THREE.SphereGeometry(this.data.size, 64, 32);
        const material = new THREE.MeshStandardMaterial({
            map: await loadTexture(this.textureFile),
            roughness: materialConfigs.planet.roughness,
            metalness: materialConfigs.planet.metalness
        });

        this.planetObj = new THREE.Mesh(geometry, material);
        this.planetObj.rotation.x = THREE.MathUtils.degToRad(this.data.axialTilt);
        this.group.add(this.planetObj);
    }

    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(
            this.data.size * this.data.atmosphereSize,
            32,
            32
        );

        const material = new THREE.MeshPhongMaterial({
            color: this.data.atmosphereColor,
            ...materialConfigs.atmosphere
        });

        const atmosphere = new THREE.Mesh(geometry, material);
        this.group.add(atmosphere);
    }

    createRings() {
        if (this.data.useDetailedRings) {
            // Saturn-like detailed rings
            this.rings = createSaturnRings(this.planetObj);
        } else {
            // Simple ring system for other planets
            const innerRadius = this.data.size * 1.4;
            const outerRadius = this.data.size * 2.0;

            const geometry = new THREE.RingGeometry(
                innerRadius,
                outerRadius,
                64
            );

            const material = new THREE.MeshBasicMaterial({
                color: this.data.ringColor || 0xffffff,
                ...materialConfigs.rings.basic
            });

            this.rings = new THREE.Mesh(geometry, material);
            this.rings.rotation.x = Math.PI / 2;
        }

        this.group.add(this.rings);
    }

    async createMoons() {
        for (const moonData of this.data.moons) {
            const moonGroup = new THREE.Group();

            // Create moon mesh
            const geometry = new THREE.SphereGeometry(
                this.data.size * moonData.size,
                32,
                16
            );

            let material;

            if (moonData.texture) {
                // For textured moons (like Earth's moon)
                material = new THREE.MeshStandardMaterial({
                    map: await loadTexture(moonData.texture),
                    roughness: moonData.roughness || 0.8,
                    metalness: moonData.metalness || 0.1
                });
            } else {
                // For untextured moons (like Mars' moons)
                material = new THREE.MeshStandardMaterial({
                    color: moonData.color,
                    roughness: moonData.roughness || 0.9,
                    metalness: moonData.metalness || 0.1
                });
            }

            const moon = new THREE.Mesh(geometry, material);

            // Position moon
            moonGroup.position.x = this.data.size * moonData.distance;

            // Store rotation data
            moonGroup.userData = {
                rotationSpeed: (2 * Math.PI) / (moonData.rotationPeriod * 24),
                orbitRadius: this.data.size * moonData.distance
            };

            moonGroup.add(moon);
            this.moons.push(moonGroup);
            this.group.add(moonGroup);
        }
    }

    update(deltaTime) {
        // Update planet rotation
        if (this.planetObj) {
            this.planetObj.rotation.y += (deltaTime * 2 * Math.PI) / (this.data.rotationPeriod * 24);
        }

        // Update moons
        this.moons.forEach(moonGroup => {
            const speed = moonGroup.userData.rotationSpeed;
            const radius = moonGroup.userData.orbitRadius;

            // Update moon position in orbit
            moonGroup.position.x = Math.cos(speed * deltaTime) * radius;
            moonGroup.position.z = Math.sin(speed * deltaTime) * radius;

            // Update moon rotation
            const moon = moonGroup.children[0];
            if (moon) {
                moon.rotation.y += deltaTime * speed;
            }
        });

        // Update rings if they exist and are detailed
        if (this.rings && this.data.useDetailedRings) {
            this.rings.update(deltaTime);
        }
    }
}

// Texture loader utility
const textureLoader = new THREE.TextureLoader();
async function loadTexture(path) {
    return new Promise((resolve, reject) => {
        textureLoader.load(
            path,
            texture => {
                texture.encoding = THREE.sRGBEncoding;
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

// Helper function to create planets
async function createPlanet(textureFile, data) {
    const planetSystem = new PlanetSystem(textureFile, data);
    return await planetSystem.create();
}
// ===== END SECTION: PLANET CREATION =====
// ===== SECTION: SCENE MANAGEMENT AND ANIMATION =====
class SolarSystemManager {
    constructor() {
        this.objects = new Map();
        this.clock = new THREE.Clock();
        this.timeScale = 1;
        this.paused = false;

        // Track mouse for interactive features
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.selectedObject = null;

        // Lighting setup
        this.setupLighting();

        // Event listeners
        this.setupEventListeners();
    }

    setupLighting() {
        // Main sun light
        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        // Ambient light for better visibility of distant objects
        const ambientLight = new THREE.AmbientLight(0x333333);
        scene.add(ambientLight);

        // Store lights for later reference
        this.lights = { sunLight, ambientLight };
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        window.addEventListener('click', this.onMouseClick.bind(this), false);

        // Add keyboard controls
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }

    async initializeSolarSystem() {
        // Create sun first
        const sun = await createSun(celestialData['2k_sun.jpg']);
        this.objects.set('sun', sun);
        scene.add(sun);

        // Create planets in order
        for (const [textureFile, data] of Object.entries(celestialData)) {
            if (!data.isStar) {  // Skip sun since we already created it
                const planetSystem = await createPlanet(textureFile, data);

                // Position planet at its orbital distance
                planetSystem.position.x = data.orbitDistance;

                this.objects.set(textureFile, planetSystem);
                scene.add(planetSystem);
            }
        }
    }

    onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update hover effects
        this.updateHover();
    }

    onMouseClick(event) {
        this.raycaster.setFromCamera(this.mouse, camera);

        // Get all meshes in the scene
        const meshes = [];
        scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                meshes.push(object);
            }
        });

        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const clicked = intersects[0].object;
            this.focusOnObject(clicked);
        }
    }

    onKeyDown(event) {
        switch(event.key) {
            case ' ':  // Space bar
                this.paused = !this.paused;
                break;
            case '+':
            case '=':
                this.timeScale = Math.min(this.timeScale * 1.5, 100);
                break;
            case '-':
                this.timeScale = Math.max(this.timeScale * 0.75, 0.1);
                break;
            case 'r':
                this.resetView();
                break;
        }
    }

    updateHover() {
        this.raycaster.setFromCamera(this.mouse, camera);

        const meshes = [];
        scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                meshes.push(object);
            }
        });

        const intersects = this.raycaster.intersectObjects(meshes);

        // Reset all hover effects
        meshes.forEach(mesh => {
            if (mesh.material && mesh.material.emissive) {
                mesh.material.emissive.setHex(0x000000);
            }
        });

        // Apply hover effect to intersected object
        if (intersects.length > 0) {
            const hovered = intersects[0].object;
            if (hovered.material && hovered.material.emissive) {
                hovered.material.emissive.setHex(0x222222);
            }
        }
    }

    focusOnObject(object) {
        // Find the root object (planet system)
        let root = object;
        while (root.parent && root.parent !== scene) {
            root = root.parent;
        }

        if (this.selectedObject === root) {
            // If clicking the same object again, reset view
            this.resetView();
            return;
        }

        this.selectedObject = root;

        // Calculate camera position
        const objectPosition = new THREE.Vector3();
        root.getWorldPosition(objectPosition);

        // Determine appropriate camera distance based on object size
        const objectSize = root instanceof THREE.Mesh ? 
            root.geometry.boundingSphere.radius : 10;
        const distance = objectSize * 4;

        // Animate camera movement
        const currentPosition = camera.position.clone();
        const targetPosition = objectPosition.clone().add(
            new THREE.Vector3(distance, distance * 0.5, distance)
        );

        gsap.to(camera.position, {
            duration: 1.5,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut",
            onUpdate: () => {
                camera.lookAt(objectPosition);
            }
        });

        // Update controls target
        gsap.to(controls.target, {
            duration: 1.5,
            x: objectPosition.x,
            y: objectPosition.y,
            z: objectPosition.z,
            ease: "power2.inOut"
        });
    }

    resetView() {
        this.selectedObject = null;

        gsap.to(camera.position, {
            duration: 1.5,
            x: 0,
            y: 100,
            z: 200,
            ease: "power2.inOut"
        });

        gsap.to(controls.target, {
            duration: 1.5,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.inOut"
        });
    }

    update() {
        if (this.paused) return;

        const deltaTime = this.clock.getDelta() * this.timeScale;

        // Update all objects
        for (const [key, object] of this.objects) {
            if (object.update) {
                object.update(deltaTime);
            }
        }

        // Update controls
        controls.update();

        // Render
        renderer.render(scene, camera);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    solarSystemManager.update();
}

// Initialize everything
const solarSystemManager = new SolarSystemManager();
solarSystemManager.initializeSolarSystem().then(() => {
    animate();
});

// Export for external use if needed
export { solarSystemManager };
// ===== END SECTION: SCENE MANAGEMENT AND ANIMATION =====
// ===== SECTION: SHADERS =====
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

    // Noise functions
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        // Base color from texture
        vec4 texColor = texture2D(texture, vUv);

        // Generate noise pattern for granulation
        float n = noise(vUv * 10.0 + time * 0.1);

        // Temperature-based color adjustment
        vec3 color = texColor.rgb;
        float temp = temperature / 6000.0; // Normalize temperature
        color *= vec3(1.0 + temp * 0.2, 1.0 + temp * 0.1, 1.0);

        // Add granulation effect
        color += vec3(n * 0.1);

        // Add limb darkening
        float limb = dot(vNormal, vec3(0.0, 0.0, 1.0));
        color *= pow(limb, 0.5);

        // Apply intensity
        color *= intensity;

        gl_FragColor = vec4(color, 1.0);
    }
`;

const coronaVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const coronaFragmentShader = `
    uniform float time;
    uniform float intensity;

    varying vec3 vNormal;
    varying vec3 vPosition;

    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p * frequency + time * 0.1);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    void main() {
        float noise = fbm(vPosition * 2.0);
        float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
        rim = pow(rim, 3.0);

        vec3 color = mix(
            vec3(1.0, 0.6, 0.1),  // Inner corona color
            vec3(1.0, 0.4, 0.0),  // Outer corona color
            rim
        );

        float alpha = rim * noise * intensity;
        alpha = smoothstep(0.1, 1.0, alpha);

        gl_FragColor = vec4(color, alpha);
    }
`;
// ===== END SECTION: SHADERS =====
