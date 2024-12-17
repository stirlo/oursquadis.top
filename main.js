import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

let scene, camera, renderer, controls, composer;
let sun, comet;
const planets = {};
const ORBIT_DURATION = 80; // seconds

// Cel shader
const CelShader = {
    uniforms: {
        tDiffuse: { value: null },
        levels: { value: 4.0 },
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

            float diffuse = dot(normal, vec3(0.0, 0.0, 1.0));
            diffuse = max(0.0, diffuse);

            float cel = floor(diffuse * levels) / levels;

            vec3 celColor = texel.rgb * (cel + 0.3);

            gl_FragColor = vec4(celColor, texel.a);
        }
    `
};

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 200, 200);

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

    // Lighting
    const sunLight = new THREE.PointLight(0xffffff, 2, 0);
    scene.add(sunLight);
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

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

    // Mobile optimization
    setupMobileOptimization();
}

function setupPostProcessing() {
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const celPass = new ShaderPass(CelShader);
    celPass.uniforms.levels.value = 5.0;
    composer.addPass(celPass);
}

function createSun() {
    const geometry = new THREE.SphereGeometry(50, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('2k_sun.jpg'),
        emissive: 0xffff00,
        emissiveIntensity: 0.5
    });
    sun = new THREE.Mesh(geometry, material);
    scene.add(sun);
}

function createPlanets() {
    const planetData = [
        { name: 'mercury', size: 3.8, texture: '2k_mercury.jpg', orbit: 80 },
        { name: 'venus', size: 9.5, texture: '2k_venus_surface.jpg', orbit: 150 },
        { name: 'earth', size: 10, texture: '2k_earth_daymap.jpg', orbit: 200 },
        { name: 'mars', size: 5.3, texture: '2k_mars.jpg', orbit: 300 },
        { name: 'jupiter', size: 112, texture: '2k_jupiter.jpg', orbit: 500 },
        { name: 'saturn', size: 94.5, texture: '2k_saturn.jpg', orbit: 900 },
        { name: 'uranus', size: 40, texture: '2k_uranus.jpg', orbit: 1800 },
        { name: 'neptune', size: 38.8, texture: '2k_neptune.jpg', orbit: 2800 }
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
    const geometry = new THREE.SphereGeometry(2, 16, 16);
    const material = new THREE.MeshToonMaterial({ 
        color: 0xcccccc,
        emissive: 0x444444,
        gradientMap: createToonGradient()
    });
    comet = new THREE.Mesh(geometry, material);
    scene.add(comet);

    // Add comet tail
    const tailGeometry = new THREE.ConeGeometry(1, 20, 8);
    const tailMaterial = new THREE.MeshToonMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.6
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -10;
    tail.rotation.x = Math.PI / 2;
    comet.add(tail);
}

function createToonGradient() {
    const gradientMap = new THREE.DataTexture(
        new Uint8Array([0, 128, 256]),
        3,
        1,
        THREE.LuminanceFormat
    );
    gradientMap.needsUpdate = true;
    return gradientMap;
}

function updateCometPosition(time) {
    const orbitProgress = (time % ORBIT_DURATION) / ORBIT_DURATION;
    const angle = orbitProgress * Math.PI * 2;

    const a = 3500; // semi-major axis
    const e = 0.967; // eccentricity
    const r = a * (1 - e * e) / (1 + e * Math.cos(angle));

    comet.position.x = r * Math.cos(angle);
    comet.position.z = r * Math.sin(angle);
    comet.position.y = r * Math.sin(angle) * Math.tan(162 * Math.PI / 180);

    // Update camera to follow comet
    camera.position.copy(comet.position);
    camera.position.add(new THREE.Vector3(50, 30, 50));
    camera.lookAt(comet.position);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Update planet positions
    Object.values(planets).forEach((planet, index) => {
        const orbit = planet.orbit;
        const speed = 1 / (orbit * 0.1);
        planet.mesh.position.x = orbit * Math.cos(time * speed);
        planet.mesh.position.z = orbit * Math.sin(time * speed);
        planet.mesh.rotation.y += 0.01 / (index + 1);
    });

    updateCometPosition(time);

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
