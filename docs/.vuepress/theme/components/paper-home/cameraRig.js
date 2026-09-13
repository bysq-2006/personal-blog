import { Vector3, Quaternion, Spherical, MathUtils, PerspectiveCamera } from 'three'

const _look = new PerspectiveCamera()
const _offset = new Vector3()
const _sph = new Spherical()

function poseFromShot(shot) {
  const position = new Vector3().fromArray(shot.position)
  const lookAt = shot.target
    ? new Vector3().fromArray(shot.target)
    : position.clone().add(new Vector3(0, 0, -1))
  const quaternion = new Quaternion()
  if (shot.quaternion) {
    quaternion.fromArray(shot.quaternion)
  } else {
    _look.position.copy(position)
    _look.up.set(0, 1, 0)
    _look.lookAt(lookAt)
    quaternion.copy(_look.quaternion)
  }
  return {
    position,
    lookAt,
    quaternion,
    fov: shot.fov,
    rotZ: Number.isFinite(shot.rotZ) ? (shot.rotZ * Math.PI) / 180 : 0,
  }
}

// Unity SmoothDamp：带速度追目标，中途换目标不会停
function smoothDamp(current, target, vel, smoothTime, dt) {
  const st = Math.max(0.0001, smoothTime)
  const omega = 2 / st
  const x = omega * dt
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  const change = current - target
  const originalTo = target
  const temp = (vel + omega * change) * dt
  let newVel = (vel - omega * temp) * exp
  const movedTo = current - change
  let out = movedTo + (change + temp) * exp
  if (originalTo - current > 0 === out > originalTo) {
    out = originalTo
    newVel = 0
  }
  return [out, newVel]
}

function dampVec3(current, target, vel, smoothTime, dt) {
  ;[current.x, vel.x] = smoothDamp(current.x, target.x, vel.x, smoothTime, dt)
  ;[current.y, vel.y] = smoothDamp(current.y, target.y, vel.y, smoothTime, dt)
  ;[current.z, vel.z] = smoothDamp(current.z, target.z, vel.z, smoothTime, dt)
}

/**
 * 对外只暴露 goto / setSway。
 * 目标机位可瞬间替换；真实位姿平滑追目标；摇晃叠在看向点周围（与 paper-home 预览相同）。
 */
export function createCameraRig(camera, { states, initial = 'home', smoothTime = 0.3 } = {}) {
  const poses = {}
  for (const [name, shot] of Object.entries(states || {})) {
    poses[name] = poseFromShot(shot)
  }

  let state = poses[initial] ? initial : Object.keys(poses)[0]
  const start = poses[state]
  const target = {
    position: start.position.clone(),
    lookAt: start.lookAt.clone(),
    fov: start.fov ?? camera.fov,
    rotZ: start.rotZ || 0,
  }
  const real = {
    position: start.position.clone(),
    lookAt: start.lookAt.clone(),
    fov: target.fov,
    rotZ: target.rotZ,
    posVel: new Vector3(),
    lookVel: new Vector3(),
  }

  let swayOn = false
  const mouse = { x: 0, y: 0 }
  const sway = { x: 0, y: 0 }
  const SWAY_AMP = 0.012

  camera.position.copy(real.position)
  camera.lookAt(real.lookAt)

  function goto(name) {
    const pose = poses[name]
    if (!pose) return
    state = name
    target.position.copy(pose.position)
    target.lookAt.copy(pose.lookAt)
    target.fov = pose.fov ?? target.fov
    target.rotZ = pose.rotZ || 0
  }

  function setSway(on) {
    swayOn = !!on
  }

  function onPointerMove(e) {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = (e.clientY / innerHeight) * 2 - 1
  }

  let last = performance.now()
  let raf = 0
  const tick = (now) => {
    raf = requestAnimationFrame(tick)
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
    last = now

    dampVec3(real.position, target.position, real.posVel, smoothTime, dt)
    dampVec3(real.lookAt, target.lookAt, real.lookVel, smoothTime, dt)
    const k = 1 - Math.exp((-2 * dt) / Math.max(smoothTime, 0.0001))
    real.fov += (target.fov - real.fov) * k
    real.rotZ += (target.rotZ - real.rotZ) * k

    const wantX = swayOn ? mouse.x : 0
    const wantY = swayOn ? mouse.y : 0
    sway.x += (wantX - sway.x) * 0.08
    sway.y += (wantY - sway.y) * 0.08

    camera.position.copy(real.position)
    camera.lookAt(real.lookAt)
    if (Math.abs(sway.x) > 1e-4 || Math.abs(sway.y) > 1e-4) {
      _offset.copy(real.position).sub(real.lookAt)
      _sph.setFromVector3(_offset)
      _sph.theta -= sway.x * SWAY_AMP
      _sph.phi = MathUtils.clamp(_sph.phi - sway.y * SWAY_AMP, 0.05, Math.PI - 0.05)
      _offset.setFromSpherical(_sph)
      camera.position.copy(real.lookAt).add(_offset)
      camera.lookAt(real.lookAt)
    }
    if (Math.abs(real.rotZ) > 1e-6) camera.rotateZ(real.rotZ)
    if (Math.abs(camera.fov - real.fov) > 1e-4) {
      camera.fov = real.fov
      camera.updateProjectionMatrix()
    }
  }
  raf = requestAnimationFrame(tick)
  addEventListener('pointermove', onPointerMove, { passive: true })

  return {
    goto,
    setSway,
    getState: () => state,
    dispose() {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onPointerMove)
    },
  }
}
