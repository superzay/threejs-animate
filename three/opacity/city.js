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

    // 城市建筑透明渐变出现，动效
    this.gradient()
  }

  // 透明渐变出现
  gradient() {
    let cityBuildings // 城市建筑群

    this.group.traverse(child => {

      if(child.name !== 'CITY_UNTRIANGULATED') return
      cityBuildings = child
    })


    const materials = Array.isArray(cityBuildings.material) ? cityBuildings.material : [cityBuildings.material]
    materials.forEach((material) => {

      material.onBeforeCompile = (shader) => {

        shader.uniforms.uTime = this.time;
        shader.uniforms.uPeriod = {value:6};

        shader.uniforms.uStartTime = this.startTime;
        shader.uniforms.uStartLength = this.startLength
        const fragmentVariable = `
          
          uniform float uTime;
          uniform float uPeriod;
          void main() {
       `


        const fragmentColor = `
                  float rate = mod(uTime , uPeriod) / uPeriod * 2.0;
          if(rate >1.0){
          rate = 1.0;
          }
         gl_FragColor = vec4(outgoingLight, diffuseColor.a * rate);
        `;
        shader.fragmentShader = shader.fragmentShader.replace("void main() {", fragmentVariable)
        shader.fragmentShader = shader.fragmentShader.replace("gl_FragColor = vec4( outgoingLight, diffuseColor.a );", fragmentColor);
      }
    });

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