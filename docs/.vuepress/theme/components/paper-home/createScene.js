import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { waterShader, skyShader, paperSketchShader } from './shaders.js'
import { createCameraRig } from './cameraRig.js'

function buildViewStates(layout) {
  const states = { home: layout.homeCamera }
  const base = layout.camera
  if (!base) return states
  const dh = Number(layout.floorHeight) || 0.155
  const count = layout.floorCount || 5
  for (let i = 0; i < count; i++) {
    states[`floor_${i + 1}`] = {
      fov: base.fov,
      near: base.near,
      far: base.far,
      position: [base.position[0], base.position[1] - i * dh, base.position[2]],
      target: [base.target[0], base.target[1] - i * dh, base.target[2]],
    }
  }
  return states
}

const PAPER = '#efe6d6'
const SUN_DIR = new THREE.Vector3(1.53, 0.574, -2.79).normalize()
const COAST_LINE_Z = -14.53
const WATER_FAR_Z = -16.6

export async function createScene(el, { layout, buildingUrl, catalogUrls, sprites }) {
  // —— 渲染器 ——
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.shadowMap.enabled = false
  renderer.setClearColor(PAPER, 1)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(PAPER)

  // —— 相机（姿态由 cameraRig 写） ——
  const shot = layout.homeCamera
  const camera = new THREE.PerspectiveCamera(shot.fov || 40, 1, shot.near || 0.02, shot.far || 40)
  camera.position.fromArray(shot.position)
  if (shot.target) camera.lookAt(new THREE.Vector3().fromArray(shot.target))

  // —— 灯光 ——
  scene.add(new THREE.AmbientLight('#fff7ea', 1.35))
  const key = new THREE.DirectionalLight('#fff4e4', 0.22)
  key.position.set(-4, 10, 8)
  scene.add(key)
  const fill = new THREE.DirectionalLight('#f2ebe0', 0.18)
  fill.position.set(6, 4, 3)
  scene.add(fill)

  // —— 水面 ——
  const waterMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      waterColor: { value: new THREE.Color('#fbe9d1') },
      lineColor: { value: new THREE.Color('#c4b6a4') },
      glintColor: { value: new THREE.Color('#fff8ee') },
      sunDir: { value: SUN_DIR },
      coastZ: { value: COAST_LINE_Z },
    },
    vertexShader: waterShader.vertex,
    fragmentShader: waterShader.fragment,
  })
  const waterNearZ = 4.2
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(32, waterNearZ - WATER_FAR_Z, 1, 1),
    waterMat,
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(6.2, -2.6, (waterNearZ + WATER_FAR_Z) * 0.5)
  water.userData.skipSketch = true
  scene.add(water)

  // —— 天空与太阳 ——
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      sunDir: { value: SUN_DIR },
      sunSize: { value: 0.038 },
      skyTop: { value: new THREE.Color('#ddded9') },
      skyMid: { value: new THREE.Color('#fbe9d1') },
      sunFill: { value: new THREE.Color('#fef1e0') },
      ink: { value: new THREE.Color('#3a342e') },
    },
    vertexShader: skyShader.vertex,
    fragmentShader: skyShader.fragment,
  })
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), skyMat)
  skyDome.userData.skipSketch = true
  skyDome.frustumCulled = false
  skyDome.renderOrder = -20
  scene.add(skyDome)
  const placeSun = () => {
    const r = Math.max(6, camera.far * 0.92)
    skyDome.position.copy(camera.position)
    skyDome.scale.setScalar(r)
  }

  // —— 海岸与云精灵 ——
  const texLoader = new THREE.TextureLoader()
  const addBillboard = (url, x, y, z, width, height) => {
    const tex = texLoader.load(url)
    tex.colorSpace = THREE.SRGBColorSpace
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.04,
    }))
    sprite.position.set(x, y, z)
    sprite.scale.set(width, height, 1)
    sprite.userData.skipSketch = true
    scene.add(sprite)
  }
  addBillboard(sprites.coast, 5.675, -1.851, -14.527, 11.28, 1.984)
  addBillboard(sprites.cloud1, -1.892, 1.769, -5.8, 1.85, 0.36)
  addBillboard(sprites.cloud2, 0.265, 1.46, -6.4, 1.7, 0.2)
  addBillboard(sprites.cloud3, 4.095, 2.309, -7.673, 1.45, 0.36)

  // —— 纸模材质（楼和道具共用） ——
  const creaseLines = []
  const paperMat = () => new THREE.MeshLambertMaterial({
    color: '#f3ece1',
    emissive: '#f0e8db',
    emissiveIntensity: 0.45,
  })
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x2a2622,
    depthTest: true,
    depthWrite: false,
  })
  const styleLikeBuilding = (root, edgeAngle = 28) => {
    root.traverse((o) => {
      if (!o.isMesh) return
      o.material = paperMat()
    })
    root.updateWorldMatrix(true, true)
    root.traverse((o) => {
      if (!o.isMesh || !o.geometry) return
      const edges = new THREE.EdgesGeometry(o.geometry, edgeAngle)
      if (!edges.attributes.position || edges.attributes.position.count < 2) {
        edges.dispose()
        return
      }
      const lines = new THREE.LineSegments(edges, lineMat)
      lines.renderOrder = 2
      o.add(lines)
      creaseLines.push(lines)
    })
  }
  const fitPropInWrap = (prop, height, width) => {
    prop.position.set(0, 0, 0)
    prop.rotation.set(0, 0, 0)
    prop.scale.setScalar(1)
    prop.updateWorldMatrix(true, true)
    const pb = new THREE.Box3().setFromObject(prop)
    const psz = pb.getSize(new THREE.Vector3())
    const sH = height / Math.max(psz.y, 1e-6)
    const sW = (width ?? height) / Math.max(psz.x, psz.z, 1e-6)
    prop.scale.setScalar(Math.min(sH, sW))
    prop.updateWorldMatrix(true, true)
    const pb2 = new THREE.Box3().setFromObject(prop)
    const center = pb2.getCenter(new THREE.Vector3())
    prop.position.set(-center.x, -pb2.min.y, -center.z)
  }

  // —— 楼模型 ——
  const loader = new GLTFLoader()
  const building = (await loader.loadAsync(buildingUrl)).scene
  styleLikeBuilding(building, 28)
  const box = new THREE.Box3().setFromObject(building)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  building.position.sub(center)
  building.position.y += size.y / 2
  scene.add(building)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  camera.near = Math.max(maxDim / 400, 0.02)
  camera.far = maxDim * 40
  camera.updateProjectionMatrix()

  // —— 相机状态机 ——
  const cameraRig = createCameraRig(camera, {
    states: buildViewStates(layout),
    initial: 'home',
  })
  cameraRig.setSway(true)

  // —— 盆栽与笔记本 ——
  for (const place of layout.placements || []) {
    const item = layout.catalog[place.kind]
    const url = catalogUrls[place.kind]
    if (!item || !url) continue
    const gltf = await loader.loadAsync(url)
    const wrap = new THREE.Group()
    wrap.position.set(place.x, place.y, place.z)
    wrap.rotation.set(place.rotX || 0, place.rotY || 0, place.rotZ || 0)
    const prop = gltf.scene
    styleLikeBuilding(prop, 22)
    fitPropInWrap(prop, place.height ?? item.height, place.width ?? item.width)
    wrap.add(prop)
    scene.add(wrap)
  }

  // —— 线稿后处理 ——
  const bufOpts = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.UnsignedByteType }
  const normalRT = new THREE.WebGLRenderTarget(1, 1, bufOpts)
  const depthRT = new THREE.WebGLRenderTarget(1, 1, bufOpts)
  const normalMat = new THREE.MeshNormalMaterial()
  const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
  const sketchDef = paperSketchShader(THREE)
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const sketch = new ShaderPass(sketchDef)
  sketch.uniforms.tNormal.value = normalRT.texture
  sketch.uniforms.tDepth.value = depthRT.texture
  composer.addPass(sketch)
  composer.addPass(new OutputPass())

  const resizeBuffers = (w, h) => {
    const pw = Math.floor(w * renderer.getPixelRatio())
    const ph = Math.floor(h * renderer.getPixelRatio())
    normalRT.setSize(pw, ph)
    depthRT.setSize(pw, ph)
    sketch.uniforms.resolution.value.set(pw, ph)
  }
  const renderBuffers = () => {
    for (const l of creaseLines) l.visible = false
    scene.traverse((o) => { if (o.userData.skipSketch) o.visible = false })
    const bg = scene.background
    const override = scene.overrideMaterial
    scene.background = new THREE.Color(0x8080ff)
    scene.overrideMaterial = normalMat
    renderer.setRenderTarget(normalRT)
    renderer.render(scene, camera)
    scene.background = new THREE.Color(0xffffff)
    scene.overrideMaterial = depthMat
    renderer.setRenderTarget(depthRT)
    renderer.render(scene, camera)
    scene.background = bg
    scene.overrideMaterial = override
    renderer.setRenderTarget(null)
    scene.traverse((o) => { if (o.userData.skipSketch) o.visible = true })
    for (const l of creaseLines) l.visible = true
  }

  const resize = () => {
    const w = el.clientWidth
    const h = Math.max(el.clientHeight, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    composer.setSize(w, h)
    resizeBuffers(w, h)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  // —— 动画循环 ——
  let raf = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    placeSun()
    waterMat.uniforms.time.value = performance.now() * 0.001
    renderBuffers()
    sketch.uniforms.tNormal.value = normalRT.texture
    sketch.uniforms.tDepth.value = depthRT.texture
    composer.render()
  }
  tick()

  return {
    goto: cameraRig.goto,
    setSway: cameraRig.setSway,
    getState: cameraRig.getState,
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      cameraRig.dispose()
      composer.dispose()
      normalRT.dispose()
      depthRT.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
