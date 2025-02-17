import * as THREE from "./build/three.module.js";
import { OrbitControls } from "./controls/OrbitControls.js";

// シーンの作成
const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// カメラ
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 8);
scene.add(camera);

// 光源
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xdcdcdc, 0.6);
scene.add(ambientLight);

// レンダラー
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xc0c0c0, 1);
document.body.appendChild(renderer.domElement);

// コントロール（マウス操作）
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ** テクスチャのロード **
const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load("./textures/textures.jpg");
const displacementTexture = textureLoader.load("./textures/textures.jpg");

// ** 岩の形状（Sphere + DisplacementMap）**
const geometry = new THREE.SphereGeometry(1.5, 15, 10); // より細かい形状
const positionAttribute = geometry.attributes.position;
for (let i = 0; i < positionAttribute.count; i++) {
  let x = positionAttribute.getX(i);
  let y = positionAttribute.getY(i);
  let z = positionAttribute.getZ(i);

  if (x > 0) {
    // 右側を少し膨らませる
    x += Math.random() * 0.1;
    y += Math.random() * 0.2;
  } else {
    // 左側を少しへこませる
    x -= Math.random() * 0.2;
    z += Math.random() * 0.1;
  }

  positionAttribute.setXYZ(i, x, y, z);
}
positionAttribute.needsUpdate = true;
const material = new THREE.MeshStandardMaterial({
  map: colorTexture,
  displacementMap: displacementTexture,
  displacementScale: 0.3, // 変形の強さを調整（0.1 ~ 0.5 推奨）
  roughness: 100, // ざらざらした質感
  metalness: 0, // 金属感なし（自然な岩の見た目）
});

const rock = new THREE.Mesh(geometry, material);
scene.add(rock);

// ** 楕円形にスケール調整 **
rock.scale.set(0.8, 1.8, 0.8); // Y軸方向に少し伸ばす

// ** 状態管理変数 **
let floatTime = 0;

// ** アニメーションループ **
function animate() {
  requestAnimationFrame(animate);

  // ** 浮遊アニメーション **
  floatTime += 0.02;
  rock.position.y = Math.sin(floatTime) * 0.3; // 浮遊感を出す

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ウィンドウリサイズ対応
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
