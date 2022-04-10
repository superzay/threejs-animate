import * as THREE from 'https://cdn.skypack.dev/three@v0.129.0';
import { FBXLoader } from 'https://cdn.skypack.dev/three@v0.129.0/examples/jsm/loaders/FBXLoader.js';

// 定义城市类City，并输出
class City {
  // 构造函数
  constructor() {
    this.fbxLoader = new FBXLoader();
    this.group = new THREE.Group();
    this.clock = new THREE.Clock() // 时钟，
    this.time = {
      value: 0
    };

    this.startTime = {
      value: 0
    };
   this.startLength = {
      value: 2
    }
    this.isStart = false; // 启动

    this.fbxLoader.load('../model/shanghai.FBX', (group) => {
      this.group.add(group);

      group.traverse((child) => {
        // 设置城市建筑（mesh物体），材质基本颜色
        if(child.name == 'CITY_UNTRIANGULATED') {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            // material.opacity = 0.6;
            material.transparent = true;
            material.color.setStyle("#9370DB");
          })

        }

        // 设置城市地面（mesh物体），材质基本颜色
        if(child.name == 'LANDMASS') {
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

    // 光墙光幕效果
    this.createWall()

  }

  // 光墙光幕效果
  createWall() {
    // 定义光幕参数
    const wallData = {
      position: {
        x: 0,
        y: 20,
        z: 0
      },
      height: 200, 
      radius: 120, 
      maxRadius: 450, 
      color: '#efad35', 
      opacity: 0.4, 
      period: 2, 
    }


    const point1 = new THREE.Vector3()
    const point2 = point1.clone().setY(point1.y + wallData.height)
    const curve = new THREE.LineCurve3(point1, point2);
    const geometry = new THREE.TubeGeometry(curve, 20, wallData.radius, 220, false);
   // 确定光墙包围盒box
    geometry.computeBoundingBox();
    const max = geometry.boundingBox.max;
    const min = geometry.boundingBox.min

    // 创建材质
    const material = new THREE.ShaderMaterial({
      color: wallData.color,
      opacity: wallData.opacity,
      transparent: true, 
      side: THREE.DoubleSide, // 两面都渲染
      depthTest: false, // 关闭材质的深度测试
      uniforms: {
        uMax: {
          value: max
        },
        uMin: {
          value: min
        },
        uColor: {
          value: new THREE.Color(wallData.color)
        }

      },
      vertexShader: `
        varying vec4 vPosition;
        void main() {
          vPosition = modelMatrix * vec4(position,1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }

      `,
      fragmentShader: `
        uniform vec3 uColor; // 光墙半径        
        uniform vec3 uMax; 
        uniform vec3 uMin;
        uniform mat4 modelMatrix; // 世界矩阵
        varying vec4 vPosition; // 接收顶点着色传递进来的位置数据
        
       
        void main() {
          // 转世界坐标
          vec4 uMax_world = modelMatrix * vec4(uMax,1.0);
          vec4 uMin_world = modelMatrix * vec4(uMin,1.0);
          // 根据像素点世界坐标的y轴高度,设置透明度
          float opacity =1.0 - (vPosition.y - uMin_world.y) / (uMax_world.y -uMin_world.y); 

           gl_FragColor = vec4( uColor, opacity);
        }
      `,
    })

    // 创建wall
    const wall = new THREE.Mesh(geometry, material)
    wall.renderOrder = 1000 // 渲染顺序

    wall.name = 'wall'
    const {
      x,
      y,
      z
    } = wallData.position
    wall.position.set(x, y, z)
    wall.updateMatrix()


    const cityGroup = this.group.children[0]
    cityGroup.add(wall)

    // 解耦
    const originScale = wall.scale.clone()
    setInterval(() => {
      const time = this.time.value
      const {
        period,
        radius,
        maxRadius
      } = wallData
      const rate = (time % period) / period 
      const currRadius = rate * (maxRadius - radius) + radius
      const scaleRate = currRadius / radius
      const matrix = new THREE.Matrix4().makeScale(scaleRate, 1, scaleRate)

      wall.scale.copy(originScale.clone().applyMatrix4(matrix)) 
      wall.updateMatrix()
    }, 50)

  }

  // 数据更新
  updateData = () => {

    if(!this.isStart) return false;
    const dt = this.clock.getDelta();
    this.time.value += dt; 
    this.startTime.value += dt;

    if(this.startTime.value >= this.startLength.value) {
      this.startTime.value = this.startLength.value;
    }
  }
}

export default City;