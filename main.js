import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

let scene, camera, renderer, controls, composer;
let sun, comet;
const planets = {};

// Constants
const SOLAR_SYSTEM_SCALE = 1000;
const SUN_SIZE = 50;
const ORBIT_DURATION = 80; // seconds for Halley's orbit

// Enhanced Cel shader for cartoon effect
const CelShader = {
    uniforms: {
        tDiffuse: { value: null },
        levels: { value: 3.0 }, // Reduced levels for more distinct bands
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float levels;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);

            // Enhanced cel shading
            float diffuse = dot(normal, vec3(0.0, 0.0, 1.0));
            diffuse = max(0.0, diffuse);

            // Create sharper bands
            float cel = floor(diffuse * levels) / levels;

            // Add edge detection
            float edge = (1.0 - dot(normal, viewDir)) * 0.5;
            edge = edge > 0.7 ? 0.0 : 1.0;

            // Enhance color contrast
            vec3 celColor = texel.rgb * (cel + 0.2) * edge;
            celColor = floor(celColor * levels) / levels;

            gl_FragColor = vec4(celColor, texel.a);
        }
    `
};

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, SOLAR_SYSTEM_SCALE * 100);
    camera.position.set(0, SOLAR_SYSTEM_SCALE * 2, SOLAR_SYSTEM_SCALE * 2);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Background
    const textureLoader = new THREE.TextureLoader();
    scene.background = textureLoader.load('milkyway.jpg');

    // Post-processing
    setupPostProcessing();

    // Create celestial bodies
    createSun();
    createPlanets();
    createHalleysComet();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = SOLAR_SYSTEM_SCALE * 50;

    // Mobile optimization
    setupMobileOptimization();
}

function createToonGradient() {
    const gradientTexture = new THREE.DataTexture(
        new Uint8Array([0, 128, 196, 255]), // Four steps for stronger cartoon effect
        4,
        1,
        THREE.LuminanceFormat
    );
    gradientTexture.needsUpdate = true;
    return gradientTexture;
}

function setupPostProcessing() {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const celPass = new ShaderPass(CelShader);
    celPass.uniforms.levels.value = 3.0;
    composer.addPass(celPass);
}

function createSun() {
    const geometry = new THREE.SphereGeometry(SUN_SIZE, 32, 32);
    const material = new THREE.MeshToonMaterial({
        map: new THREE.TextureLoader().load('2k_sun.jpg'),
        emissive: 0xffff00,
        emissiveIntensity: 1.0,
        gradientMap: createToonGradient()
    });
    sun = new THREE.Mesh(geometry, material);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // Enhanced sun lighting
    const sunLight = new THREE.PointLight(0xffffff, 3, SOLAR_SYSTEM_SCALE * 3);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
}

function createPlanets() {
    const planetData = [
        { name: 'mercury', size: SUN_SIZE * 0.038, texture: '2k_mercury.jpg', orbit: SOLAR_SYSTEM_SCALE * 0.387 },
        { name: 'venus', size: SUN_SIZE * 0.095, texture: '2k_venus_surface.jpg', orbit: SOLAR_SYSTEM_SCALE * 0.723 },
        { name: 'earth', size: SUN_SIZE * 0.1, texture: '2k_earth_daymap.jpg', orbit: SOLAR_SYSTEM_SCALE * 1.0 },
        { name: 'mars', size: SUN_SIZE * 0.053, texture: '2k_mars.jpg', orbit: SOLAR_SYSTEM_SCALE * 1.524 },
        { name: 'jupiter', size: SUN_SIZE * 1.12, texture: '2k_jupiter.jpg', orbit: SOLAR_SYSTEM_SCALE * 5.203 },
        { name: 'saturn', size: SUN_SIZE * 0.945, texture: '2k_saturn.jpg', orbit: SOLAR_SYSTEM_SCALE * 9.537 },
        { name: 'uranus', size: SUN_SIZE * 0.4, texture: '2k_uranus.jpg', orbit: SOLAR_SYSTEM_SCALE * 19.191 },
        { name: 'neptune', size: SUN_SIZE * 0.388, texture: '2k_neptune.jpg', orbit: SOLAR_SYSTEM_SCALE * 30.069 }
    ];

    planetData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshToonMaterial({
            map: new THREE.TextureLoader().load(data.texture),
            gradientMap: createToonGradient()
        });
        const planet = new THREE.Mesh(geometry, material);
        planets[data.name] = {
            mesh: planet,
            orbit: data.orbit
        };
        scene.add(planet);
    });
}

function createHalleysComet() {
    const geometry = new THREE.SphereGeometry(SUN_SIZE * 0.01, 16, 16);
    const material = new THREE.MeshToonMaterial({ 
        color: 0xcccccc,
        emissive: 0x444444,
        gradientMap: createToonGradient()
    });
    comet = new THREE.Mesh(geometry, material);
    scene.add(comet);

    // Enhanced comet tail
    const tailGeometry = new THREE.ConeGeometry(SUN_SIZE * 0.005, SUN_SIZE * 0.4, 8);
    const tailMaterial = new THREE.MeshToonMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.6,
        gradientMap: createToonGradient()
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -SUN_SIZE * 0.2;
    tail.rotation.x = Math.PI / 2;
    comet.add(tail);
}

function updateCometPosition(time) {
    const orbitProgress = (time % ORBIT_DURATION) / ORBIT_DURATION;
    const angle = orbitProgress * Math.PI * 2;

    // Halley's orbit parameters
    const a = SOLAR_SYSTEM_SCALE * 17.834;
    const e = 0.967;
    const r = a * (1 - e * e) / (1 + e * Math.cos(angle));

    // Update comet position
    comet.position.x = r * Math.cos(angle);
    comet.position.z = r * Math.sin(angle);
    comet.position.y = r * Math.sin(angle) * Math.tan(162 * Math.PI / 180);

    // Calculate comet's direction of travel
    const tangent = new THREE.Vector3(
        -Math.sin(angle),
        Math.sin(angle) * Math.tan(162 * Math.PI / 180),
        Math.cos(angle)
    ).normalize();

    // Position camera relative to comet
    const cameraOffset = new THREE.Vector3(0, SUN_SIZE * 0.1, -SUN_SIZE * 0.2); // Slightly above and behind
    camera.position.copy(comet.position).add(cameraOffset);

    // Look ahead of comet's trajectory
    const lookAhead = comet.position.clone().add(tangent.multiplyScalar(SUN_SIZE * 2));
    camera.lookAt(lookAhead);

    // Update comet's rotation to face direction of travel
    comet.lookAt(lookAhead);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Update planet positions with Kepler's laws
    Object.values(planets).forEach((planet, index) => {
        const orbit = planet.orbit;
        const speed = 1 / Math.pow(orbit / SOLAR_SYSTEM_SCALE, 1.5) * 0.1;

        const angle = time * speed;
        planet.mesh.position.x = orbit * Math.cos(angle);
        planet.mesh.position.z = orbit * Math.sin(angle);

        // Planet rotation
        planet.mesh.rotation.y += 0.002 / (index + 1);
    });

    updateCometPosition(time);

    // Ensure sun stays centered and rotating
    sun.position.set(0, 0, 0);
    sun.rotation.y += 0.001;

    composer.render();
}

function setupMobileOptimization() {
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

// Initialize and start animation
init();
animate();
