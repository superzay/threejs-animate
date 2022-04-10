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

    // 颜色渐变效果（建筑表面上下颜色渐变）
    this.gradient()
  }

  // 颜色渐变效果（建筑表面上下颜色渐变）
  gradient() {
    let cityBuildings // 城市建筑群

    this.group.traverse(child => {

      if (child.name !== 'CITY_UNTRIANGULATED') return
      cityBuildings = child
    })


    const { geometry } = cityBuildings;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();


    const { max, min } = geometry.boundingBox;

const topColor = {
  value:new THREE.Color('#56FFDC')
}
       setInterval(()=>{
         const color= ['#98F90C','#FF69B4','#56FFDC','#98FF21','#FFD700','#59dFD0',]
         const index = parseInt( Math.random()*5)
         topColor.value = new THREE.Color(color[index])
         console.log(color[index])
         
       },1500)
    const materials = Array.isArray(cityBuildings.material) ? cityBuildings.material : [cityBuildings.material]
    materials.forEach((material) => {

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uMax = {
          value: max
        }
       shader.uniforms.uMin = {
          value: min
        }
       shader.uniforms.uTopColor = topColor
       
       


        const vertex = `

          varying vec4 vPosition;

          void main() {
             vPosition = modelMatrix * vec4(position,1.0);
        `
        shader.vertexShader = shader.vertexShader.replace("void main() {", vertex);

        const fragment = `

          uniform mat4 modelMatrix;

           varying vec4 vPosition;
          uniform vec3 uMax; 
          uniform vec3 uMin; 
          uniform vec3 uTopColor; 
          vec4 uMax_world;
          vec4 uMin_world;

          void main() {
            // 转世界坐标

            uMax_world =  modelMatrix * vec4(uMax,1.0);
            uMin_world =  modelMatrix * vec4(uMin,1.0);
  
        `;
        const fragmentColor = `

          vec3 distColor = outgoingLight;


          float rate = (vPosition.y - uMin_world.y) / (uMax_world.y - uMin_world.y); 
          
           distColor = mix(distColor, uTopColor, rate);
          

          gl_FragColor = vec4(distColor, diffuseColor.a);
        `;
        shader.fragmentShader = shader.fragmentShader.replace("void main() {", fragment)
        shader.fragmentShader = shader.fragmentShader.replace("gl_FragColor = vec4( outgoingLight, diffuseColor.a );", fragmentColor);
      }
    });

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