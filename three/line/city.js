import * as THREE from 'https://cdn.skypack.dev/three@v0.129.0';
import { FBXLoader } from 'https://cdn.skypack.dev/three@v0.129.0/examples/jsm/loaders/FBXLoader.js';


// 定义城市类City，并输出
class City {
  // 构造函数
  constructor() {
    this.fbxLoader = new FBXLoader();
    this.group = new THREE.Group();
    this.clock = new THREE.Clock() 
    this.surroundLineMaterial = null;// 定义包围线材质属性
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

    // 创建城市建筑群的包围线条效果
    this.surroundLine();
  }

  // 创建包围线条效果
  surroundLine() {
    let cityBuildings // 城市建筑群

    this.group.traverse(child => {

      if (child.name !== 'CITY_UNTRIANGULATED') return
      cityBuildings = child
    })


    const geometry = new THREE.EdgesGeometry(cityBuildings.geometry);


    const surroundLineMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: {
          value: new THREE.Color('#FFF')
        }
      },
      vertexShader: `
       void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: ` 
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor, 1);
        }
      `
    });


    const line = new THREE.LineSegments(geometry, surroundLineMaterial);
    line.name = 'surroundLine';

   line.applyMatrix4(cityBuildings.matrix.clone())

    cityBuildings.parent.add(line)
  }


    //数据更新
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