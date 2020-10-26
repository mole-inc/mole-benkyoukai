//top
import { store } from "../vendors/store";
import * as THREE from 'three';
import { ShaderMaterial, TextureLoader, Vector2 } from "three";

const vertexSource = `
varying vec2 vUv;

uniform float uAspect;

void main() {
  vUv = uv;

  gl_Position = vec4(position, 1.0);
}
`;

const fragmentSource  = `
varying vec2 vUv;

uniform sampler2D uTex;
uniform float uPressed;

void main() {
  float shift = uPressed * 0.01;

  float r = texture2D(uTex, vUv + vec2(shift, 0.0)).r;
  float g = texture2D(uTex, vUv).g;
  float b = texture2D(uTex, vUv + vec2(shift, 0.0)).b;

  vec3 color = vec3(r, g, b);
  gl_FragColor = vec4(color, 1.0);
}
`;

export default async ()=> {
  let pressed = 0.0;

  window.addEventListener('mousedown', ()=> {
    pressed = 1.0;
  });
  window.addEventListener('mouseup', ()=> {
    pressed = 0.0;
  })

  // renderer初期化
    const canvas = document.querySelector('#canvas');
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true
    });
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(store.windowWidth, store.windowHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

  // scene作成
    const scene = new THREE.Scene();

  // camera作成
    const camera = new THREE.PerspectiveCamera(60, store.windowWidth / store.windowHeight, 1, 1000);
    camera.position.set(0, 0, +10);

  // light作成
    const pointLight = new THREE.PointLight(0x00ffff);
    scene.add(pointLight);
    pointLight.position.set(2, 2, 2);

  // texture読み込み
    const texLoader = (src)=>{
      return new Promise((resolve)=>{
        new THREE.TextureLoader().load(
          src,
          (texture)=>{
            resolve(texture);
          }
        )
      })
    }
    const texture = await texLoader('https://img.huffingtonpost.com/asset/5cb44b32230000a5006db215.jpeg?cache=iRXyzLXcyh&ops=scalefit_630_noupscale')

  // geo作成
    const geo = new THREE.PlaneGeometry(1.5, 1.5, 10, 10);

  // material作成
    const uniforms = {
      uPressed: {
        value: pressed,
      },
      uTime: {
        value: 0.0,
      },
      uMouse: {
        value: new Vector2(0.5, 0.5),
      },
      uAspect: {
        value: store.windowHeight / store.windowWidth,
      },
      uTex: {
        value: texture,
      },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
    });

  // mesh作成
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

  // 描画
    renderer.render(scene, camera);
    const tick = ()=> {
      const sec = performance.now() / 1000;
      uniforms.uTime.value = sec;
      uniforms.uPressed.value += (pressed - uniforms.uPressed.value) * 0.1;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
