import * as THREE from 'three'

// —— 水面着色器 ——
export const waterShader = {
  vertex: /* glsl */`
    varying vec3 vWorldPos;
    void main() {
      vec4 w = modelMatrix * vec4(position, 1.0);
      vWorldPos = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }
  `,
  fragment: /* glsl */`
    uniform float time;
    uniform vec3 waterColor;
    uniform vec3 lineColor;
    uniform vec3 glintColor;
    uniform vec3 sunDir;
    uniform float coastZ;
    uniform float night;
    varying vec3 vWorldPos;

    float hash(float n) {
      return fract(sin(n * 127.1) * 43758.5453);
    }

    // 线性空间直接反相会让奶油色变成中灰蓝；转回 sRGB 再反才是近黑
    vec3 invertSRGB(vec3 c) {
      vec3 s = clamp(pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)), 0.0, 1.0);
      return pow(vec3(1.0) - s, vec3(2.2));
    }

    float layer(float z, float x, float t, float freq, float speed, float thresh, float width) {
      float drift = 0.18 * sin(x * 0.41 + t * 0.14) + 0.09 * sin(x * 0.93 + t * 0.07);
      float u = z * freq + t * speed + drift;
      float id = floor(u);
      float f = fract(u);
      float alive = step(thresh, hash(id + freq * 13.0));
      float pulse = 0.4 + 0.6 * sin(t * (0.28 + hash(id) * 0.55) + hash(id + 4.2) * 6.28318);
      pulse = smoothstep(0.12, 0.88, pulse);
      float stroke = 1.0 - smoothstep(0.0, width, abs(f - 0.5));
      float span = 0.35 + 0.65 * hash(id + 8.1);
      float cut = smoothstep(0.0, 0.12, fract(x * (0.08 + hash(id) * 0.05) + hash(id + 2.3)));
      return stroke * alive * pulse * span * mix(0.45, 1.0, cut);
    }

    float sunGlints(vec2 xz, float t) {
      vec2 az = sunDir.xz;
      float azLen = length(az);
      if (azLen < 1e-4) return 0.0;
      az /= azLen;
      vec2 perp = vec2(-az.y, az.x);
      vec2 toP = xz - cameraPosition.xz;
      float along = dot(toP, az);
      float across = dot(toP, perp);
      if (along < 0.4) return 0.0;
      float acc = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float freq = 1.55 + fi * 0.85;
        float u = along * freq + t * (0.11 + fi * 0.04);
        float id = floor(u);
        float f = fract(u);
        float mid = 1.0 - abs(f - 0.5) * 2.0;
        mid = pow(max(mid, 0.0), 1.35);
        float alive = step(0.22 + fi * 0.08, hash(id + 19.0 + fi));
        float wobble = sin(t * (0.7 + hash(id) * 1.1) + hash(id + 3.1) * 6.28)
                     * (0.035 + hash(id + 7.0) * 0.05);
        wobble += sin(t * 1.7 + id) * 0.012;
        float halfW = mix(0.002, 0.055 + fi * 0.008, mid);
        float body = 1.0 - smoothstep(0.0, halfW, abs(across - wobble));
        float pulse = 0.55 + 0.45 * sin(t * (1.2 + hash(id + 5.0)) + hash(id) * 6.28);
        acc = max(acc, body * alive * mid * pulse);
      }
      float pillar = exp(-across * across * 7.0);
      return acc * mix(0.35, 1.0, pillar);
    }

    void main() {
      vec2 xz = vWorldPos.xz;
      float dist = length(xz - cameraPosition.xz);
      float t = time;
      float l1 = layer(xz.y, xz.x, t, 1.15, 0.042, 0.08, 0.028);
      float l2 = layer(xz.y, xz.x, t * 1.11, 1.9, 0.058, 0.14, 0.022);
      float l3 = layer(xz.y, xz.x, t * 0.91, 2.8, 0.07, 0.22, 0.016);
      float l4 = layer(xz.y, xz.x, t * 1.23, 4.1, 0.09, 0.32, 0.012);
      float l5 = layer(xz.y, xz.x, t * 0.77, 5.6, 0.11, 0.4, 0.009);
      float lines = max(max(l1, l2 * 0.9), max(l3 * 0.78, max(l4 * 0.62, l5 * 0.48)));
      float nearFade = smoothstep(0.8, 2.6, dist);
      float shoreFade = smoothstep(coastZ - 1.8, coastZ + 0.9, vWorldPos.z);
      lines *= nearFade * shoreFade;
      float glint = sunGlints(xz, t) * nearFade * shoreFade;
      // 水体随夜反相（sRGB 空间）；碎金保留原样（月亮也发光），夜里只是淡一点
      vec3 wc = mix(waterColor, invertSRGB(waterColor), night);
      vec3 lc = mix(lineColor, invertSRGB(lineColor), night);
      vec3 col = mix(wc, lc, lines * 0.78);
      col = mix(col, glintColor, glint * mix(0.92, 0.5, night));
      float alpha = smoothstep(coastZ - 2.0, coastZ + 0.35, vWorldPos.z);
      gl_FragColor = vec4(col, alpha);
    }
  `,
}

// —— 天空与太阳着色器 ——
// 夜景：night=0 白天，1 黑夜。月亮在太阳正对面（-sunDir），随 night 绕东西轴转 180°，
// 日落月升互换位置；天空反相、星空淡入，全部由同一个 night 驱动（GSAP 缓动）。
export const skyShader = {
  vertex: /* glsl */`
    varying vec3 vDir;
    varying float vScreenY;
    void main() {
      vDir = position;
      vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vScreenY = clip.y / max(clip.w, 1e-6) * 0.5 + 0.5;
      gl_Position = clip;
    }
  `,
  fragment: /* glsl */`
    uniform vec3 sunDir;
    uniform float sunSize;
    uniform vec3 skyTop;
    uniform vec3 skyMid;
    uniform vec3 sunFill;
    uniform vec3 ink;
    uniform float night;
    varying vec3 vDir;
    varying float vScreenY;

    vec3 rotAxis(vec3 v, vec3 k, float a) {
      float c = cos(a), s = sin(a);
      return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
    }

    // 手绘天体：奶油盘 + 墨线圈（太阳、月亮同一画法）
    vec3 drawBody(vec3 col, vec3 dir, vec3 bodyDir, float size, vec3 fillCol, vec3 ringCol) {
      float ang = acos(clamp(dot(dir, bodyDir), -1.0, 1.0));
      float r = max(size, 0.004) * 0.5;
      float aa = max(fwidth(ang) * 0.65, 0.00012);
      float ringW = max(fwidth(ang) * 0.55, 0.00018);
      float fill = 1.0 - smoothstep(r - aa, r + aa, ang);
      float ring = smoothstep(r - ringW - aa, r - ringW, ang)
                 * (1.0 - smoothstep(r, r + aa, ang));
      return mix(mix(col, fillCol, fill), ringCol, ring);
    }

    void main() {
      vec3 dir = normalize(vDir);
      float h = clamp(vScreenY, 0.0, 1.0);
      vec3 sky = mix(skyMid, skyTop, smoothstep(0.22, 0.88, h));
      vec3 col = mix(sky, vec3(0.0), night); // 夜里纯黑，不要渐变

      // 东西轴垂直于 sunDir，转 180° 太阳正好落到月亮位
      vec3 s = normalize(sunDir);
      vec3 axis = normalize(vec3(-s.z, 0.0, s.x));
      float a = night * 3.14159265;
      vec3 sd = rotAxis(s, axis, a);
      vec3 md = -sd;

      // 星空：随夜淡入（星点核要够 2px 才看得见）
      vec3 cell = floor(dir * 220.0);
      if (night > 0.01 && fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453) > 0.996) {
        float d = length(fract(dir * 220.0) - 0.5);
        col += vec3(1.0, 0.97, 0.9) * smoothstep(0.3, 0.05, d) * night;
      }

      col = drawBody(col, dir, sd, sunSize, sunFill, ink);

      // 月牙：一个大圆减去一个偏移圆。两个距离场取 max 就是月牙轮廓，
      // 比画圆盘再补环形山更准，也少一段代码（lp 是盘内坐标，|lp|<1 为盘内）
      float mr = max(sunSize * 0.85, 0.004) * 0.5;
      float mang = acos(clamp(dot(dir, md), -1.0, 1.0));
      float pw = max(fwidth(mang), 0.00012) / mr; // 一个像素（在均匀控制流里求导）
      if (mang < mr * 1.4) {
        // 盘内坐标系：mu = 屏幕右（相机大致水平朝 -z），咬口沿 mu 偏 → 月牙朝右开口
        vec3 mu = normalize(cross(md, vec3(0.0, 1.0, 0.0)));
        vec3 mv = cross(mu, md);
        vec2 lp = vec2(dot(dir, mu), dot(dir, mv)) / mr;
        float body = max(length(lp) - 1.0, 0.82 - length(lp - vec2(0.36, 0.0)));
        col = mix(col, vec3(0.94, 0.91, 0.85), 1.0 - smoothstep(-pw, pw, body));
        col = mix(col, vec3(0.6, 0.55, 0.47), 1.0 - smoothstep(pw, pw * 2.0, abs(body)));
      }

      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

// —— 纸纹线稿后处理 ——
export function paperSketchShader(THREELib = THREE) {
  return {
    uniforms: {
      tDiffuse: { value: null },
      tNormal: { value: null },
      tDepth: { value: null },
      resolution: { value: new THREELib.Vector2(1, 1) },
      paper: { value: new THREELib.Color('#efe6d6') },
      ink: { value: new THREELib.Color('#2a2622') },
      skyTop: { value: new THREELib.Color('#ddded9') },
      skyMid: { value: new THREELib.Color('#fbe9d1') },
      skyBot: { value: new THREELib.Color('#fbe9d1') },
      night: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      #include <packing>
      uniform sampler2D tDiffuse;
      uniform sampler2D tNormal;
      uniform sampler2D tDepth;
      uniform vec2 resolution;
      uniform vec3 paper;
      uniform vec3 ink;
      uniform float night;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      // 线性空间直接反相会让奶油色变成中灰蓝；转回 sRGB 再反才是近黑
      vec3 invertSRGB(vec3 c) {
        vec3 s = clamp(pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)), 0.0, 1.0);
        return pow(vec3(1.0) - s, vec3(2.2));
      }

      float grain(vec2 uv) {
        vec2 p = uv * resolution * 0.55;
        float n = hash(floor(p)) * 0.55;
        n += hash(floor(p * 2.17 + 11.3)) * 0.28;
        n += hash(p * 0.13) * 0.17;
        float speckle = step(0.82, hash(floor(uv * resolution * 0.22) + 3.1));
        return n * 0.85 + speckle * 0.15;
      }

      float depthAt(vec2 uv) {
        return unpackRGBAToDepth(texture2D(tDepth, uv));
      }

      vec3 normalAt(vec2 uv) {
        return texture2D(tNormal, uv).xyz * 2.0 - 1.0;
      }

      float depthEdge(vec2 uv) {
        vec2 px = 1.0 / resolution;
        float c = depthAt(uv);
        float l = abs(depthAt(uv + vec2(-px.x, 0.0)) - c);
        float r = abs(depthAt(uv + vec2( px.x, 0.0)) - c);
        float t = abs(depthAt(uv + vec2(0.0,  px.y)) - c);
        float b = abs(depthAt(uv + vec2(0.0, -px.y)) - c);
        float tl = abs(depthAt(uv + vec2(-px.x,  px.y)) - c);
        float tr = abs(depthAt(uv + vec2( px.x,  px.y)) - c);
        float bl = abs(depthAt(uv + vec2(-px.x, -px.y)) - c);
        float br = abs(depthAt(uv + vec2( px.x, -px.y)) - c);
        return max(max(l, r), max(t, b)) * 0.65 + max(max(tl, tr), max(bl, br)) * 0.35;
      }

      float normalEdge(vec2 uv) {
        vec2 px = 1.0 / resolution;
        vec3 c = normalAt(uv);
        float e = 0.0;
        e += (1.0 - dot(c, normalAt(uv + vec2(-px.x, 0.0)))) * 0.5;
        e += (1.0 - dot(c, normalAt(uv + vec2( px.x, 0.0)))) * 0.5;
        e += (1.0 - dot(c, normalAt(uv + vec2(0.0,  px.y)))) * 0.5;
        e += (1.0 - dot(c, normalAt(uv + vec2(0.0, -px.y)))) * 0.5;
        e += (1.0 - dot(c, normalAt(uv + vec2(-px.x,  px.y)))) * 0.25;
        e += (1.0 - dot(c, normalAt(uv + vec2( px.x,  px.y)))) * 0.25;
        e += (1.0 - dot(c, normalAt(uv + vec2(-px.x, -px.y)))) * 0.25;
        e += (1.0 - dot(c, normalAt(uv + vec2( px.x, -px.y)))) * 0.25;
        return e;
      }

      void main() {
        vec3 src = texture2D(tDiffuse, vUv).rgb;
        float srcY = dot(src, vec3(0.299, 0.587, 0.114));
        float d = depthAt(vUv);
        float g = grain(vUv);
        vec3 paperTex = paper * (0.93 + g * 0.12);
        paperTex += vec3(0.04, 0.025, 0.01) * (g - 0.45);

        float skyMask = smoothstep(0.9994, 0.99995, d);
        float solid = 1.0 - skyMask;
        float dE = depthEdge(vUv);
        float nE = normalEdge(vUv);

        float crease = smoothstep(0.035, 0.14, nE);
        float occlude = smoothstep(0.0018, 0.008, dE);
        float screenLine = max(crease, occlude);
        screenLine = pow(clamp(screenLine, 0.0, 1.0), 0.7) * solid;
        float meshLine = smoothstep(0.35, 0.14, srcY) * solid;
        float cavity = smoothstep(0.0003, 0.0035, dE) * solid * 0.10;
        vec3 fill = src * (0.97 + g * 0.05) - cavity;
        vec3 skyCol = src * (0.97 + g * 0.06);
        skyCol += vec3(0.03, 0.015, 0.0) * (g - 0.45);
        vec3 col = mix(fill, skyCol, skyMask);
        col = mix(col, ink, max(screenLine, meshLine) * (1.0 - skyMask));
        // 夜景（方案 A 纯反相，sRGB 空间）：只反相实体部分，天空已由 skyShader 自己夜化
        vec3 inv = invertSRGB(col);
        // 反相带蓝味（像深海色）：暗部压成中性黑，亮部线条保持原样
        float invY = dot(inv, vec3(0.299, 0.587, 0.114));
        inv = mix(vec3(invY), inv, smoothstep(0.02, 0.25, invY));
        col = mix(col, inv, night * solid);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }
}
