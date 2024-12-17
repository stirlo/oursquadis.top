// Constants
const ORBIT_DURATION = 80; // seconds per orbit instead of years
const SOLAR_SYSTEM_SCALE = 1000;
const SUN_SIZE = 50;
const HALLEY_ORBIT_TILT = 162.3; // degrees

// Texture loader
const textureLoader = new THREE.TextureLoader();
const loadTexture = (path) => textureLoader.load(path, () => {
    loadedTextures++;
    if (loadedTextures === totalTextures) {
        document.getElementById('loading').style.display = 'none';
    }
});

// Load all textures
const textures = {
    sun: loadTexture('2k_sun.jpg'),
    mercury: loadTexture('2k_mercury.jpg'),
    venus: loadTexture('2k_venus_surface.jpg'),
    earth: loadTexture('2k_earth_daymap.jpg'),
    mars: loadTexture('2k_mars.jpg'),
    jupiter: loadTexture('2k_jupiter.jpg'),
    saturn: loadTexture('2k_saturn.jpg'),
    uranus: loadTexture('2k_uranus.jpg'),
    neptune: loadTexture('2k_neptune.jpg'),
    milkyway: loadTexture('milkyway.jpg')
};

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, SOLAR_SYSTEM_SCALE * 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Post-processing for cel-shading effect
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

// Add outline pass for cel-shading effect
const outlinePass = new THREE.OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 0;
outlinePass.edgeThickness = 1;
outlinePass.pulsePeriod = 0;
outlinePass.visibleEdgeColor.set('#ffffff');
outlinePass.hiddenEdgeColor.set('#190a05');
composer.addPass(outlinePass);
// Create skybox using milkyway texture
const skyboxGeometry = new THREE.SphereGeometry(SOLAR_SYSTEM_SCALE * 50, 64, 64);
const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: textures.milkyway,
    side: THREE.BackSide
});
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

// Create Sun with glow effect
const sunGeometry = new THREE.SphereGeometry(SUN_SIZE, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: textures.sun,
    emissive: 0xffff00,
    emissiveIntensity: 1
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add sun light
const sunLight = new THREE.PointLight(0xffffff, 2, SOLAR_SYSTEM_SCALE * 2);
sunLight.castShadow = true;
sun.add(sunLight);

// Planet creation helper function
function createPlanet(size, texture, distance) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0,
        roughness: 0.8
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planet.position.x = distance;
    return planet;
}

// Create planets
const planets = {
    mercury: createPlanet(SUN_SIZE * 0.038, textures.mercury, SOLAR_SYSTEM_SCALE * 0.4),
    venus: createPlanet(SUN_SIZE * 0.095, textures.venus, SOLAR_SYSTEM_SCALE * 0.7),
    earth: createPlanet(SUN_SIZE * 0.1, textures.earth, SOLAR_SYSTEM_SCALE * 1),
    mars: createPlanet(SUN_SIZE * 0.053, textures.mars, SOLAR_SYSTEM_SCALE * 1.5),
    jupiter: createPlanet(SUN_SIZE * 1.12, textures.jupiter, SOLAR_SYSTEM_SCALE * 5.2),
    saturn: createPlanet(SUN_SIZE * 0.945, textures.saturn, SOLAR_SYSTEM_SCALE * 9.5),
    uranus: createPlanet(SUN_SIZE * 0.4, textures.uranus, SOLAR_SYSTEM_SCALE * 19.2),
    neptune: createPlanet(SUN_SIZE * 0.388, textures.neptune, SOLAR_SYSTEM_SCALE * 30.1)
};

// Add planets to scene
Object.values(planets).forEach(planet => scene.add(planet));

// Create Halley's Comet
const cometGeometry = new THREE.SphereGeometry(SUN_SIZE * 0.01, 32, 32);
const cometMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    emissive: 0x444444
});
const comet = new THREE.Mesh(cometGeometry, cometMaterial);

// Create comet tail
const cometTailGeometry = new THREE.ConeGeometry(SUN_SIZE * 0.008, SUN_SIZE * 0.1, 32);
const cometTailMaterial = new THREE.MeshBasicMaterial({
    color: 0x88aaff,
    transparent: true,
    opacity: 0.6
});
const cometTail = new THREE.Mesh(cometTailGeometry, cometTailMaterial);
cometTail.position.y = -SUN_SIZE * 0.05;
comet.add(cometTail);
scene.add(comet);

// Camera setup for Halley's perspective
const cometCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, SOLAR_SYSTEM_SCALE * 100);
comet.add(cometCamera);
cometCamera.position.z = SUN_SIZE * 0.1;
cometCamera.lookAt(sun.position);

// Animation
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const orbitProgress = (elapsedTime % ORBIT_DURATION) / ORBIT_DURATION;

    // Halley's orbit calculation
    const orbitAngle = orbitProgress * Math.PI * 2;
    const orbitDistance = SOLAR_SYSTEM_SCALE * 35; // Max distance from sun

    // Calculate position with elliptical orbit
    comet.position.x = Math.cos(orbitAngle) * orbitDistance;
    comet.position.z = Math.sin(orbitAngle) * orbitDistance * 0.5; // Elliptical shape
    comet.position.y = Math.sin(orbitAngle) * orbitDistance * Math.sin(HALLEY_ORBIT_TILT * Math.PI / 180);

    // Rotate planets
    Object.values(planets).forEach(planet => {
        planet.rotation.y += 0.005;
    });

    // Update comet tail direction (always pointing away from sun)
    cometTail.lookAt(sun.position);

    // Render scene with post-processing
    composer.render();
}

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});

// Start animation
animate();
