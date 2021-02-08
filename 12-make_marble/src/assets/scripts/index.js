//index
import "../styles/main.styl";

import * as THREE from "three";

const distance = 1000;
const canvas = document.querySelector("#canvas");

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

// https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object/14614736
const fov =
  (180 * (2 * Math.atan(window.innerHeight / 2 / distance))) / Math.PI;
const camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  1,
  distance
);
camera.position.set(0, 0, distance);

const ambientlight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientlight);
ambientlight.position.set(2, 2, 2);

const axes = new THREE.AxesHelper(1000);
scene.add(axes);

const geo = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 50);
const uniforms = {
  time: {
    value: 0.0,
  },
  resolution: {
    value: new THREE.Vector2(window.innerWidth, window.innerHeight),
  },
};

const mat = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      varying vec2 v_uv;
      uniform vec2 resolution;
      uniform float time;

      // お作法 以下で雲模様のノイズを生成
      // 白黒の雲模様を1.0（白） ~ 0.0（黒）とし、
      // それをgl_FragColorに渡すことで、マーブル模様を作成する。
      // https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
      float random(float p) {
        return fract(sin(p)*10000.);
      }
      float noise(vec2 p) {
        return random(p.x + p.y*10000.);
      }
      vec2 sw(vec2 p) {return vec2( floor(p.x) , floor(p.y) );}
      vec2 se(vec2 p) {return vec2( ceil(p.x)  , floor(p.y) );}
      vec2 nw(vec2 p) {return vec2( floor(p.x) , ceil(p.y)  );}
      vec2 ne(vec2 p) {return vec2( ceil(p.x)  , ceil(p.y)  );}
      float smoothNoise(vec2 p) {
        vec2 inter = smoothstep(0., 1., fract(p));
        float s = mix(noise(sw(p)), noise(se(p)), inter.x);
        float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
        return mix(s, n, inter.y);
        return noise(nw(p));
      }
      float movingNoise(vec2 p) {
        float total = 0.0;
        total += smoothNoise(p     - time);
        total += smoothNoise(p*2.  + time) / 2.;
        total += smoothNoise(p*4.  - time) / 4.;
        total += smoothNoise(p*8.  + time) / 8.;
        total += smoothNoise(p*16. - time) / 16.;
        total /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;
        return total;
      }
      float nestedNoise(vec2 p) {
        float x = movingNoise(p);
        float y = movingNoise(p + 100.);
        return movingNoise(p + vec2(x, y));
      }
      // お作法ここまで

      void main() {
        vec2 ratio = vec2(
          min((resolution.x / resolution.y) / (resolution.x / resolution.y), 1.0),
          min((resolution.y / resolution.x) / (resolution.y / resolution.x), 1.0)
        );
        vec2 fixed_uv = vec2(
          v_uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
          v_uv.y * ratio.y + (1.0 - ratio.y) * 0.5
        );
        float brightness = nestedNoise(fixed_uv);
        vec3 color = vec3(brightness * 0.5, brightness, (1.0 - brightness) + (brightness * 0.5));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  wireframe: false,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

let requestId;
renderer.render(scene, camera);
const tick = () => {
  const sec = performance.now() / 1000;
  uniforms.time.value = sec / 5;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  requestId = requestAnimationFrame(tick);
};
requestId = requestAnimationFrame(tick);
