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

    // 雷达扫描效果
    this.createRadar()

  }

  // 雷达扫描效果
  createRadar() {
     // 定义雷达参数  
    const radarData = {

      position: {
        x: 0,
        y: 20,
        z: 0
      },
      radius: 240, 
      color: '#f005f0', 
      opacity: 0.5, 
      speed: 300, 
      followWidth: 220, 
    }

    // 创建几何体
    const circleGeometry = new THREE.CircleGeometry(radarData.radius, 1000)
    const rotateMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 180 * 90) 
    circleGeometry.applyMatrix4(rotateMatrix)

    // 创建材质
    const material = new THREE.MeshPhongMaterial({
      color: radarData.color,
      opacity: radarData.opacity,
      transparent: true,
    })


    const radar = new THREE.Mesh(circleGeometry, material)
    radar.name = 'radar'

    const { x, y, z } = radarData.position
    radar.position.set(x, y, z)
    radar.updateMatrix()


    const cityGroup = this.group.children[0]
    cityGroup.add(radar)


    material.onBeforeCompile = (shader) => {

      Object.assign(shader.uniforms, {
        uSpeed: {
          value: radarData.speed,
        },
        uRadius: {
          value: radarData.radius
        },
        uTime: this.time, 
        uFollowWidth: {
          value: radarData.followWidth
        }
      })



      const vertex = `


        varying vec3 vPosition;
        void main() {

          vPosition = position;

      `
      shader.vertexShader = shader.vertexShader.replace('void main() {', vertex)
      const fragment = `


        uniform float uRadius;     
        uniform float uTime;            
        uniform float uSpeed; 
        uniform float uFollowWidth; 
        varying vec3 vPosition;
       

        float calcAngle(vec3 oFrag){

          float fragAngle;

          const vec3 ox = vec3(1,0,0);

          float dianji = oFrag.x * ox.x + oFrag.z*ox.z;

          float oFrag_length = length(oFrag); // length是内置函数
          float ox_length = length(ox); // length是内置函数

          float yuxian = dianji / (oFrag_length * ox_length);


          fragAngle = acos(yuxian);
          fragAngle = degrees(fragAngle);


          if(oFrag.z > 0.0) {
            fragAngle = -fragAngle + 360.0;
          }


          float scanAngle = uTime * uSpeed - floor(uTime * uSpeed / 360.0) * 360.0;

          float angle = scanAngle - fragAngle;

          if(angle < 0.0){
            angle = angle + 360.0;
          }


          return angle;
        }

        void main() {
    
      `

      const fragementColor = `

        

        // length内置函数，取向量的长度
        if(length(vPosition) == 0.0 || length(vPosition) > uRadius-2.0){
          gl_FragColor = vec4( outgoingLight, diffuseColor.a );

        } else {

          float angle = calcAngle(vPosition);
          if(angle < uFollowWidth){
            // 尾焰区域
            float opacity =  1.0 - angle / uFollowWidth; 
            gl_FragColor = vec4( outgoingLight, diffuseColor.a * opacity );  

          } else {
            // 其他位置的像素均为透明
            gl_FragColor = vec4( outgoingLight, 0.0 ); 

          }

        }
        
      `
      shader.fragmentShader = shader.fragmentShader.replace('void main() {', fragment)
      shader.fragmentShader = shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', fragementColor)

    }

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