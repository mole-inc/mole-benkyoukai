//top
import { store } from "../vendors/store";
import * as THREE from 'three';
import { ShaderMaterial, TextureLoader, Vector2 } from "three";

const vertexSource = `
varying vec2 vUv;

uniform float time;

uniform float uPressed;

//https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
//お作法ここから
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float random(vec2 v) {
  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0,
      0.366025403784439, // 0.5*(sqrt(3.0)-1.0),
      -0.577350269189626, // -1.0 + 2.0 * C.x,
      0.024390243902439); // 1.0 / 41.0,
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  // Avoid truncation effects in permutation,
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
//お作法ここまで

void main() {
  vUv = uv;

  float rand = random(vec2(uv.y, 0.0) * fract(time));
  //vUv.x += rand * uPressed * 0.01;

  gl_Position = vec4(position, 1.0);
}
`;

const fragmentSource  = `
varying vec2 vUv;

uniform float time;
uniform vec2 resolution;

uniform sampler2D image;
uniform vec2 imageResolution;

uniform float uPressed;

//https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
//お作法ここから
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float random(vec2 v) {
  const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0,
      0.366025403784439, // 0.5*(sqrt(3.0)-1.0),
      -0.577350269189626, // -1.0 + 2.0 * C.x,
      0.024390243902439); // 1.0 / 41.0,
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod289(i);
  // Avoid truncation effects in permutation,
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
//お作法ここまで

void main() {

  vec2 ratio = vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  float y = uv.y + time * 0.05;
  float shift = uPressed;

  float noise = mod( random( vec2(y, 0.0) ) * mod(sin(time), 0.01), 0.01);
  noise += mod( random( vec2(y * 10.0, 0.0) ) * mod(cos(time), 0.01), 0.01);
  uv.x += noise * shift;

  float r = texture2D(image, uv).r;
  float g = texture2D(image, uv).g;
  float b = texture2D(image, uv).b;

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
    const imageLoader = (src)=>{
      return new Promise((resolve)=>{
        new THREE.TextureLoader().load(
          src,
          (texture)=>{
            resolve(texture);
          }
        )
      })
    }
    const url = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Vervet_Monkey_%28Chlorocebus_pygerythrus%29.jpg'
    const texture = await imageLoader(url)

  // geo作成
    const geo = new THREE.PlaneGeometry(1.5, 1.5, 10, 10);

  // material作成
    const uniforms = {
      time: {
        value: 0.0,
      },
      resolution: {
        value: new THREE.Vector2(store.windowWidth, store.windowHeight),
      },
      image: {
        value: texture,
      },
      imageResolution: {
        value: new THREE.Vector2(texture.image.naturalWidth, texture.image.naturalHeight),
      },
      uPressed: {
        value: pressed,
      },
      uMouse: {
        value: new THREE.Vector2(0.5, 0.5),
      },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
    });

    //const mat = new THREE

  // mesh作成
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

  // 描画
    renderer.render(scene, camera);
    const tick = ()=> {
      const sec = performance.now() / 1000;
      uniforms.time.value = sec;
      //uniforms.uPressed.value += (pressed - uniforms.uPressed.value) * 0.1;
      uniforms.uPressed.value = pressed;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}
