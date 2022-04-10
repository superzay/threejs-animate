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

    // 城市建筑生长动效
    this.grow()

  }

  // 生长动效
  grow() {
    let cityBuildings // 城市建筑群（mesh对象）

    this.group.traverse(child => {

      if(child.name !== 'CITY_UNTRIANGULATED') return
      cityBuildings = child
    })


    const materials = Array.isArray(cityBuildings.material) ? cityBuildings.material : [cityBuildings.material]
    materials.forEach((material) => {

      material.onBeforeCompile = (shader) => {

        shader.uniforms.uTime = this.time;
        shader.uniforms.uPeriod = {value:4};


        const vertex = `
          uniform float uTime;
          uniform float uPeriod;
          
          void main() {
        `
        // 生长动效，着色逻辑修正代码
        const vertexPosition = `


          vec4 mvPosition = vec4( transformed, 1.0 );
          #ifdef USE_INSTANCING
            mvPosition = instanceMatrix * mvPosition;
          #endif
       
          float rate = mod(uTime , uPeriod) / uPeriod * 2.0;
          if(rate >1.0){
          rate = 1.0;
          }
          mvPosition.z = mvPosition.z * rate;
          

          mvPosition = modelViewMatrix * mvPosition;
          gl_Position = projectionMatrix * mvPosition;
        `
        shader.vertexShader = shader.vertexShader.replace("void main() {", vertex);
        shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", vertexPosition);
      }
    });

  }

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