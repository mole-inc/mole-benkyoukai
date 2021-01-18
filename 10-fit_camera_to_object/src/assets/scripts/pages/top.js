//top
import { store } from "../vendors/store";
import * as THREE from "three";
import { ShaderMaterial, TextureLoader, Vector2 } from "three";

const fragmentSource = `
varying vec2 vUv;
uniform float time;
uniform vec2 resolution;
uniform sampler2D image;
uniform vec2 imageResolution;
uniform float uPressed;

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
  noise += mod( random( vec2(y * 10.0, 0.0) ) * mod(sin(time), 0.01), 0.01);
  uv.x += noise * shift;
  float r = texture2D(image, uv).r;
  float g = texture2D(image, uv + vec2(shift * noise, 0.0)).g;
  float b = texture2D(image, uv + vec2(shift * noise, 0.0)).b;
  vec3 color = vec3(r, g, b);
  gl_FragColor = vec4(color, 1.0);
}
`;

export default async () => {
  // renderer初期化
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
  });
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize(store.windowWidth, store.windowHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // scene作成
  const scene = new THREE.Scene();

  // camera作成
  const perspective = 800;
  // https://stackoverflow.com/questions/14614252/how-to-fit-camera-to-object/14614736
  const fov =
    (180 * (2 * Math.atan(store.windowHeight / 2 / perspective))) / Math.PI;
  const camera = new THREE.PerspectiveCamera(
    fov,
    store.windowWidth / store.windowHeight,
    1,
    1000
  );
  camera.position.set(0, 0, perspective);

  // light作成
  const ambientlight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientlight);
  ambientlight.position.set(2, 2, 2);

  // texture読み込み
  const imageLoader = (src) => {
    return new Promise((resolve) => {
      new THREE.TextureLoader().load(src, (texture) => {
        resolve(texture);
      });
    });
  };
  const uniformArray = [];
  const srcArray = [];
  const eachPosArray = [];
  const images = document.querySelectorAll(".images-item");
  images.forEach((item) => {
    const img = item.firstElementChild;
    srcArray.push(img.getAttribute("src"));
    eachPosArray.push(img.getBoundingClientRect());
  });

  for (let i = 0; i < images.length; i++) {
    const rect = eachPosArray[i];
    const geo = new THREE.PlaneGeometry(1, 1, 10);
    const texture = await imageLoader(srcArray[i]);
    const uniforms = {
      resolution: {
        value: new THREE.Vector2(rect.width, rect.height),
      },
      time: {
        value: 0.0,
      },
      offset: {
        value: new THREE.Vector2(0.0, 0.0),
      },
      image: {
        value: texture,
      },
      imageResolution: {
        value: new THREE.Vector2(
          texture.image.naturalWidth,
          texture.image.naturalHeight
        ),
      },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 v_uv;
        uniform float time;
        uniform vec2 offset;
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

        void main() {
          v_uv = uv;
          float rand = random(vec2(v_uv.y, 0.0) * fract(sin(time)));
          float x = position.x;
          float y = position.y;
          float z = position.z;
          x += mod(sin(rand * offset.y)*0.5, 0.01);
          x += fract(sin(rand * offset.y)) * 0.01;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 v_uv;
        uniform float time;
        uniform vec2 resolution;
        uniform sampler2D image;
        uniform vec2 imageResolution;
        uniform vec2 offset;

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

        void main() {
          vec2 ratio = vec2(
            min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
            min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
          );
          vec2 fixed_uv = vec2(
            v_uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            v_uv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          float y = fixed_uv.y + time * 0.05;
          float shift = offset.y;
          float noise = mod( random( vec2(y, 0.0) ) * mod(sin(time), 0.01), 0.01);
          noise += mod( random( vec2(y * 10.0, 0.0) ) * mod(sin(time), 0.01), 0.01);
          fixed_uv.x += noise * shift;
          float r = texture2D(image, fixed_uv).r;
          float g = texture2D(image, fixed_uv + vec2(shift * noise, 0.0)).g;
          float b = texture2D(image, fixed_uv + vec2(shift * noise, 0.0)).b;
          vec3 color = vec3(r, g, b);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const offset = new THREE.Vector2(
      rect.left - store.windowWidth / 2 + rect.width / 2,
      -rect.top + store.windowHeight / 2 - rect.height / 2
    );
    mesh.position.set(offset.x, offset.y, 0);
    mesh.scale.set(rect.width, rect.height, 0);
    uniformArray.push(uniforms);
    scene.add(mesh);
  }

  // 描画
  // 描画
  renderer.render(scene, camera);

  let oldPos = 0;
  let currentPos = 0;
  const tick = () => {
    // const sec = performance.now() / 1000
    currentPos = window.scrollY;
    const offsetY = (currentPos - oldPos) * 0.005;
    for (let i = 0; i < uniformArray.length; i++) {
      const uniforms = uniformArray[i];
      uniforms.offset.value = new Vector2(0, offsetY);
    }
    camera.position.y = window.scrollY * -1;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    oldPos = window.scrollY;
  };
  requestAnimationFrame(tick);
};
