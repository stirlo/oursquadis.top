import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

let scene, camera, renderer, composer;
let sun, comet;
const planets = {};

// Constants
const SOLAR_SYSTEM_SCALE = 1000;
const SUN_SIZE = 50;
const ORBIT_DURATION = 80; // seconds for Halley's orbit

// Simplified cel shader for better compatibility
const CelShader = {
    uniforms: {
        tDiffuse: { value: null }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 color = texel.rgb;
            float brightness = (color.r + color.g + color.b) / 3.0;
            float steps = 4.0;
            brightness = floor(brightness * steps) / steps;
            gl_FragColor = vec4(color * brightness, texel.a);
        }
    `
};

function init() {
    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, SOLAR_SYSTEM_SCALE * 100);
    camera.position.set(0, SOLAR_SYSTEM_SCALE * 0.5, SOLAR_SYSTEM_SCALE * 0.5);

    // Renderer setup
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
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(CelShader));

    createSun();
    createPlanets();
    createHalleysComet();
}

function createSun() {
    const geometry = new THREE.SphereGeometry(SUN_SIZE, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('2k_sun.jpg'),
        emissive: 0xffff00,
        emissiveIntensity: 1.0
    });
    sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    // Lighting
    const sunLight = new THREE.PointLight(0xffffff, 2, SOLAR_SYSTEM_SCALE * 3);
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
        const material = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load(data.texture),
            shininess: 0.5
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
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc,
        emissive: 0x444444,
        shininess: 10
    });
    comet = new THREE.Mesh(geometry, material);
    scene.add(comet);

    // Comet tail
    const tailGeometry = new THREE.ConeGeometry(SUN_SIZE * 0.005, SUN_SIZE * 0.4, 8);
    const tailMaterial = new THREE.MeshPhongMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.6
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

    comet.position.x = r * Math.cos(angle);
    comet.position.z = r * Math.sin(angle);
    comet.position.y = r * Math.sin(angle) * Math.tan(162 * Math.PI / 180);

    // Camera follows comet
    const cameraOffset = new THREE.Vector3(0, SUN_SIZE * 0.2, -SUN_SIZE * 0.4);
    camera.position.copy(comet.position).add(cameraOffset);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    // Update planets
    Object.values(planets).forEach((planet, index) => {
        const orbit = planet.orbit;
        const speed = 1 / Math.pow(orbit / SOLAR_SYSTEM_SCALE, 1.5) * 0.1;

        const angle = time * speed;
        planet.mesh.position.x = orbit * Math.cos(angle);
        planet.mesh.position.z = orbit * Math.sin(angle);
        planet.mesh.rotation.y += 0.002 / (index + 1);
    });

    updateCometPosition(time);
    sun.rotation.y += 0.001;

    composer.render();
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
