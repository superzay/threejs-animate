import * as THREE from 'https://cdn.skypack.dev/three@v0.129.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.129.0/examples/jsm/controls/OrbitControls.js';
import City from './city.js'

const canvas = document.querySelector('canvas.webgl') // 画布
const scene = new THREE.Scene() // 场景

// 光源
const light = new THREE.AmbientLight(0xadadad); // 环境光，soft white light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // 方向光
directionalLight.position.set(100, 100, 0);
scene.add(light);
scene.add(directionalLight);

// 辅助线
const axisHelper = new THREE.AxisHelper(2500); //坐标轴显示长度
scene.add(axisHelper);

// 画布尺寸
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// 相机
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 1, 10000)
camera.position.set(600, 750, -1221)
scene.add(camera)

// 控制器
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// 渲染器
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(new THREE.Color('#32373E'), 1);

// 实例化
const city = new City({});
scene.add(city.group);

// 渲染
const render = () => {
  city.updateData();
  controls.update() 
  renderer.render(scene, camera) 
  window.requestAnimationFrame(render) 
}

render() // 开始渲染