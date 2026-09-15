import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { CSS3DRenderer, CSS3DObject, CSS3DSprite } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { waterShader, skyShader, paperSketchShader } from './shaders.js'
import { createTextLayer } from './createText.js'
import { createCameraRig } from './cameraRig.js'

function buildViewStates(layout) {
  const states = { home: layout.homeCamera }
  if (layout.githubCamera) states.github = layout.githubCamera
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

export async function createScene(el, { layout, buildingUrl, catalogUrls, sprites, catVideoUrl, birdVideoUrl }) {
  // —— 渲染器 ——
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  renderer.shadowMap.enabled = false
  renderer.setClearColor(PAPER, 1)
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.inset = '0'
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
  let laptopWrap = null
  for (const place of layout.placements || []) {
    const item = layout.catalog[place.kind]
    const url = catalogUrls[place.kind]
    if (!item || !url) continue
    const gltf = await loader.loadAsync(url)
    const wrap = new THREE.Group()
    wrap.userData.kind = place.kind
    wrap.position.set(place.x, place.y, place.z)
    wrap.rotation.set(place.rotX || 0, place.rotY || 0, place.rotZ || 0)
    const prop = gltf.scene
    styleLikeBuilding(prop, 22)
    fitPropInWrap(prop, place.height ?? item.height, place.width ?? item.width)
    wrap.add(prop)
    if (place.kind === 'laptop') {
      laptopWrap = wrap
      wrap.traverse((o) => { if (o.isMesh) o.material.side = THREE.DoubleSide })
    }
    scene.add(wrap)
  }

  // —— 场景里的小动物（透明背景视频，纸片朝固定方向，不跟镜头转） ——
  // 想挪位置/改大小，调对应那一行的 pos 与 w 即可。
  // 朝向固定为初始 home 机位；点开电脑切镜头时不会跟着转过来。
  // 单独放在 critterScene，最后叠加在纸纹后处理之上，避免被建筑描边“穿透”。
  const critterScene = new THREE.Scene()
  const CRITTERS = [
    { url: catVideoUrl, pos: { x: -0.12517886111834217, y: 0.967333898955255, z: 0.10696331767205368 }, w: 0.075 },
    { url: birdVideoUrl, pos: { x: 0.22241730340882865, y: 0.712215033815948, z: 0.11625011155843612 }, w: 0.05 },
  ]
  const homeCamPos = new THREE.Vector3().fromArray(layout.homeCamera.position)
  const critterVideos = []
  const critterTextures = []
  for (const critter of CRITTERS) {
    if (!critter.url) continue
    const video = document.createElement('video')
    video.src = critter.url
    video.muted = true
    video.loop = true
    video.autoplay = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.setAttribute('muted', '')
    video.preload = 'auto'
    video.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;'
    el.appendChild(video)
    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    const aspect = (video.videoWidth || 672) / (video.videoHeight || 448)
    const planeH = critter.w / aspect
    const geometry = new THREE.PlaneGeometry(critter.w, planeH)
    geometry.translate(0, planeH / 2, 0) // 以底边中心为锚点
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    }))
    mesh.position.set(critter.pos.x, critter.pos.y, critter.pos.z)
    const dir = new THREE.Vector3().subVectors(homeCamPos, mesh.position)
    mesh.rotation.y = Math.atan2(dir.x, dir.z)
    critterScene.add(mesh)
    const play = () => video.play().catch(() => {})
    video.addEventListener('loadeddata', play)
    play()
    critterVideos.push(video)
    critterTextures.push(texture)
  }

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hitLaptop = (e) => {
    if (!laptopWrap) return false
    const canvas = renderer.domElement
    ndc.x = (e.offsetX / canvas.clientWidth) * 2 - 1
    ndc.y = -(e.offsetY / canvas.clientHeight) * 2 + 1
    camera.updateMatrixWorld()
    laptopWrap.updateMatrixWorld(true)
    raycaster.setFromCamera(ndc, camera)
    return raycaster.intersectObject(laptopWrap, true).some((h) => h.object.isMesh)
  }

  // —— 屏幕上的 CSS3D 网页（真 DOM，不是模型） ——
  const cssRenderer = new CSS3DRenderer()
  cssRenderer.domElement.style.position = 'absolute'
  cssRenderer.domElement.style.inset = '0'
  cssRenderer.domElement.style.pointerEvents = 'none'
  el.appendChild(cssRenderer.domElement)
  const cssScene = new THREE.Scene()
  const iframeW = 900
  const iframeH = 560
  const iframe = document.createElement('iframe')
  iframe.width = iframeW
  iframe.height = iframeH
  iframe.style.border = '0'
  iframe.style.background = '#fff'
  iframe.style.pointerEvents = 'none'
  const cssScreen = new CSS3DObject(iframe)
  cssScene.add(cssScreen)
  const screenAnchor = new THREE.Object3D()
  if (laptopWrap) {
    screenAnchor.position.set(0.0001, 0.0083, -0.0078)
    laptopWrap.add(screenAnchor)
  }
  const screenScale = 0.021 / iframeW
  // CSS3D 把世界坐标当 px 用。本场景是米级（~1 单位），直接把米当 px 会让屏幕
  // 贴在透视平面（~1284px）前 0.02px 处，相机稍一靠近就越界被剔除。
  // 把 CSS3D 这一层整体放大 K 倍（同时给 CSS 相机同样放大），视觉大小不变，
  // 但远离透视平面，任意近距离都不会突然消失。
  const CSS3D_SCALE = 8000
  const cssCamera = new THREE.PerspectiveCamera()
  const _screenPos = new THREE.Vector3()
  const _screenQuat = new THREE.Quaternion()
  const _screenScaleTmp = new THREE.Vector3()
  const profileUrl = 'https://bysq.top/gh-profile/'
  let screenRequested = false
  const loadScreen = () => {
    if (screenRequested) return
    screenRequested = true
    iframe.src = profileUrl
  }
  const setScreenLive = (on) => {
    cssRenderer.domElement.style.pointerEvents = on ? 'auto' : 'none'
    iframe.style.pointerEvents = on ? 'auto' : 'none'
    renderer.domElement.style.pointerEvents = on ? 'none' : 'auto'
    if (on) loadScreen()
  }
  // 预加载：不点笔记本也提前把页面拉起来，进 github 时立即可用
  if ('requestIdleCallback' in window) requestIdleCallback(loadScreen, { timeout: 4000 })
  else setTimeout(loadScreen, 2500)
  const syncCssScreen = () => {
    if (!laptopWrap) return
    screenAnchor.updateWorldMatrix(true, false)
    screenAnchor.matrixWorld.decompose(_screenPos, _screenQuat, _screenScaleTmp)
    cssScreen.position.copy(_screenPos).multiplyScalar(CSS3D_SCALE)
    cssScreen.quaternion.copy(_screenQuat)
    cssScreen.scale.setScalar(screenScale * CSS3D_SCALE)
  }
  const syncCssCamera = () => {
    cssCamera.position.copy(camera.position).multiplyScalar(CSS3D_SCALE)
    cssCamera.quaternion.copy(camera.quaternion)
    cssCamera.fov = camera.fov
    cssCamera.aspect = camera.aspect
    cssCamera.near = camera.near
    cssCamera.far = camera.far
    cssCamera.updateProjectionMatrix()
    cssCamera.updateMatrixWorld()
  }

  // —— 电脑上方的点击提示（CSS3D 精灵，常朝向相机，常驻、无动画） ——
  const hintStyle = document.createElement('style')
  hintStyle.textContent = `
    .ph-hint3d { width: 340px; pointer-events: none; }
    .ph-hint3d-text {
      display: inline-block; text-align: center;
      font: 900 46px/1.1 var(--ph-font, "Microsoft YaHei", "PingFang SC", sans-serif);
      color: #f3ece1; letter-spacing: .03em; transform: rotate(-2deg);
      text-shadow:
        -3px -3px 0 #2a2622, 0 -3px 0 #2a2622, 3px -3px 0 #2a2622,
        -3px 0 0 #2a2622, 3px 0 0 #2a2622,
        -3px 3px 0 #2a2622, 0 3px 0 #2a2622, 3px 3px 0 #2a2622,
        8px 9px 0 rgba(42, 38, 34, .8);
    }
  `
  document.head.appendChild(hintStyle)

  const HINT_ELEMENT_W = 340
  const HINT_WORLD_W = 0.03
  const hintEl = document.createElement('div')
  hintEl.className = 'ph-hint3d'
  const hintText = document.createElement('div')
  hintText.className = 'ph-hint3d-text'
  hintText.textContent = '点击电脑试试'
  hintEl.appendChild(hintText)
  const cssHint = new CSS3DSprite(hintEl)
  cssHint.scale.setScalar((HINT_WORLD_W / HINT_ELEMENT_W) * CSS3D_SCALE)
  cssScene.add(cssHint)
  const hintAnchor = new THREE.Object3D()
  if (laptopWrap) {
    hintAnchor.position.set(0, 0.02, 0)
    laptopWrap.add(hintAnchor)
  }
  const _hintPos = new THREE.Vector3()
  const syncCssHint = () => {
    if (!laptopWrap) return
    hintAnchor.updateWorldMatrix(true, false)
    cssHint.position.copy(_hintPos.setFromMatrixPosition(hintAnchor.matrixWorld)).multiplyScalar(CSS3D_SCALE)
  }

  // —— 文字层（单独文件，纸墨线稿立体字，逐字翻转，和镜头状态机同步） ——
  const text = createTextLayer(el)

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
  const critterPass = new RenderPass(critterScene, camera)
  critterPass.clear = false
  critterPass.clearDepth = false
  composer.addPass(critterPass)
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
    cssRenderer.setSize(w, h)
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
    if (critterTextures.length) for (const tex of critterTextures) tex.needsUpdate = true
    renderBuffers()
    sketch.uniforms.tNormal.value = normalRT.texture
    sketch.uniforms.tDepth.value = depthRT.texture
    composer.render()
    syncCssCamera()
    syncCssScreen()
    syncCssHint()
    cssRenderer.render(cssScene, cssCamera)
  }
  tick()
  text.showText('home')

  const goto = (name, dir = 0) => {
    cameraRig.goto(name)
    text.showText(name, dir)
  }

  return {
    goto,
    setSway: cameraRig.setSway,
    enableGyro: cameraRig.enableGyro,
    getState: cameraRig.getState,
    canvas: renderer.domElement,
    hitLaptop,
    setScreenLive,
    dispose() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      cameraRig.dispose()
      composer.dispose()
      normalRT.dispose()
      depthRT.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      cssRenderer.domElement.remove()
      hintStyle.remove()
      text.dispose()
      for (const video of critterVideos) {
        video.pause()
        video.removeAttribute('src')
        video.load()
        video.remove()
      }
      for (const tex of critterTextures) tex.dispose()
    },
  }
}
