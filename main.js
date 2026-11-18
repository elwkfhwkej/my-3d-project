import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// 1. Сцена и Камера
const scene = new THREE.Scene();
// УДАЛЕНО: scene.background = new THREE.Color(0x111111); (чтобы не перекрывать градиент)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// 2. Рендерер
// ИЗМЕНЕНО: добавлено alpha: true
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 1.2; 
renderer.shadowMap.enabled = true; 
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.body.appendChild(renderer.domElement);

// 3. Окружение (HDRI)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// ИСПРАВЛЕНО: Добавлен new URL для правильного пути на GitHub
const hdrPath = new URL('/modern_evening_street_1k.hdr', import.meta.url).href;

new RGBELoader().load(hdrPath, (texture) => {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap; 
    texture.dispose();
    pmremGenerator.dispose();
}, undefined, (err) => console.error("Ошибка загрузки HDR:", err));

// 4. Дополнительный свет
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// 5. Управление мышкой
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2; 

// 6. Загрузка модели
const loader = new GLTFLoader();

// ИСПРАВЛЕНО: Добавлен new URL и убрано %20 (пробел пишется как есть)
const modelPath = new URL('/MK4 5.2.1.glb', import.meta.url).href;

loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Центрирование модели
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;

    controls.target.set(0, 0, 0);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(maxDim * 1.5, maxDim * 0.8, maxDim * 1.5);
    controls.update();
}, undefined, (error) => {
    console.error('ОШИБКА ЗАГРУЗКИ МОДЕЛИ:', error);
});

// 7. Анимация
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// 8. Адаптация под размер окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});