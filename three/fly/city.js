import * as THREE from 'https://cdn.skypack.dev/three@v0.129.0';
import { FBXLoader } from 'https://cdn.skypack.dev/three@v0.129.0/examples/jsm/loaders/FBXLoader.js';

// 定义城市类City，并输出
class City {
  // 构造函数
  constructor() {
    this.fbxLoader = new FBXLoader();
    this.group = new THREE.Group();
    this.clock = new THREE.Clock() 

    this.time = { value: 0 };

    this.startTime = { value: 0 };

    this.startLength = { value: 2 }
    this.isStart = false;


    this.fbxLoader.load('../model/shanghai.FBX', (group) => {

      this.group.add(group);

      group.traverse((child) => {
         // 设置城市建筑（mesh物体），材质基本颜色
        if (child.name == 'CITY_UNTRIANGULATED') {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            // material.opacity = 0.6;
            material.transparent = true;
            material.color.setStyle("#9370DB");
          })

        }

        // 设置城市地面（mesh物体），材质基本颜色
        if (child.name == 'LANDMASS') {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            // material.opacity = 0.6;
            material.transparent = true;
            material.color.setStyle("#040912");
          })
        }
      })

      // 获取到城市的fbx模型后，初始化城市类的实例
      this.init();
    });
  }

  // 初始化城市类的实例
  init() {
    this.isStart = true; // 城市渲染启动
    this.clock.start()

    // 飞线效果
    this.fly()

  }

  // 飞线效果
  fly() {
    const flyData = {

      source: {
        x: -350,
        y: 15,
        z: 10
      },
      target: {
        x: 266,
        y: 25,
        z: 2
      },
      color: '#efad35',
      number: 150,
      size: 3,
      period: 1.5,
      opacity: 0.5,
    }


    const source = new THREE.Vector3(flyData.source.x, flyData.source.y, flyData.source.z)
    const target = new THREE.Vector3(flyData.target.x, flyData.target.y, flyData.target.z)
    const center = source.clone().lerp(target, 0.5)
    center.setY(260)
    const distance = parseInt(source.distanceTo(center) + center.distanceTo(target))

    // 定义贝塞尔曲线
    const curve = new THREE.QuadraticBezierCurve3(source, center, target);
    const points = curve.getPoints(distance) 

    // 创建组对象
    const group = new THREE.Group()
    for (let i = 0; i < flyData.number; i++) {

      const geometry = new THREE.SphereGeometry(flyData.size, 50, 50)
      const scale = (i + 1) / flyData.number * 0.7 + 0.3
      geometry.applyMatrix4(new THREE.Matrix4().makeScale(scale, scale, scale))// 缩小小球的几何体


      const material = new THREE.MeshBasicMaterial({
        color: flyData.color,
        transparent: true,
        opacity: flyData.opacity,
        depthTest:false,
      })


      const sphere = new THREE.Mesh(geometry, material)
      sphere.renderOrder = 1000
      sphere.position.copy(points[i])
      sphere.updateMatrix()// 更新相对矩阵
      group.add(sphere)

    }

    this.group.children[0].add(group)


    setInterval(() => {

      const rate = (this.time.value % flyData.period) / flyData.period

      const position = parseInt(points.length * rate)
      for (let i = 0; i < flyData.number; i++) {

        if (position + i >= points.length) {
          group.children[i].material.opacity = 0
        } else {

          group.children[i].material.opacity = flyData.opacity
          group.children[i].position.copy(points[position + i])
          group.children[i].updateMatrix()

        }

      }
    }, 50)
  }

  // 数据更新
  updateData = () => {

    if (!this.isStart) return false;

    const dt = this.clock.getDelta();


    this.time.value += dt; 

    this.startTime.value += dt;

    if (this.startTime.value >= this.startLength.value) {
      this.startTime.value = this.startLength.value;
    }
  }
}

export default City;