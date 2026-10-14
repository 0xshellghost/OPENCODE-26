import * as THREE from 'three'
import type { OpenCodeQuality, SceneParameters } from './experience-config'

export function createPetalScene(host: HTMLElement, parameters: SceneParameters, quality: OpenCodeQuality, onFailure: () => void) {
  const small = host.clientWidth < 768
  const conservative = quality === 'low' || (quality === 'auto' && (small || (navigator.hardwareConcurrency || 4) <= 4))
  const count = conservative ? 45 : quality === 'high' ? 150 : 85
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !conservative, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, conservative ? 1 : 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 60)
  camera.position.z = 14
  const geometry = new THREE.PlaneGeometry(1, 1.45, 6, 8)
  const positions = geometry.attributes.position
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    // Float32 edge vertices can fall outside [0, 1], making fractional powers NaN.
    const t = THREE.MathUtils.clamp((y + 0.725) / 1.45, 0, 1)
    positions.setXYZ(i, x * Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.65), y, 0.28 * x * x + 0.2 * Math.sin(t * Math.PI))
  }
  geometry.computeVertexNormals()
  const material = new THREE.MeshStandardMaterial({ color: '#f0a8b8', roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
  const petals = new THREE.InstancedMesh(geometry, material, count)
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  petals.frustumCulled = false
  scene.add(petals)
  scene.add(new THREE.AmbientLight('#fff1ec', 2.3))
  const sun = new THREE.DirectionalLight('#ffd2a0', 3.2)
  sun.position.set(-3, 5, 8)
  scene.add(sun)
  const dummy = new THREE.Object3D()
  let seed = 721
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  const particles = Array.from({ length: count }, () => ({
    x: random() * 36 - 18, y: random() * 22 - 11, z: random() * 22 - 12,
    size: 0.085 + random() * 0.16, speed: 0.3 + random() * 0.5, phase: random() * Math.PI * 2,
  }))
  let frame = 0
  let lastTime = 0
  let elapsed = 0
  let visible = true
  let disposed = false
  let lost = false
  let cameraX = 0
  let cameraY = 0

  const render = (now: number) => {
    frame = 0
    if (disposed || lost || !visible || document.hidden) return
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.045) : 0
    lastTime = now
    const passage = Math.sin(Math.min(parameters.progress, 1) * Math.PI)
    if (!parameters.paused) elapsed += delta
    if (!parameters.paused) {
      cameraX += (parameters.pointerX * 0.22 - cameraX) * 0.035
      cameraY += (-parameters.pointerY * 0.12 - cameraY) * 0.035
    }
    camera.position.set(cameraX, cameraY, 14 - passage * 2)
    material.opacity = 0.8 - Math.max(0, parameters.progress - 0.7) * 1.5
    for (let i = 0; i < count; i++) {
      const petal = particles[i]
      if (!parameters.paused) {
        petal.x += delta * petal.speed * (0.7 + passage * 4)
        petal.y -= delta * petal.speed * 0.55
        petal.z += delta * passage * 1.6
        if (petal.x > 19) petal.x = -19
        if (petal.y < -12) petal.y = 12
        if (petal.z > 11) petal.z = -12
      }
      dummy.position.set(petal.x + Math.sin(elapsed * 0.4 + petal.phase) * 0.7, petal.y, petal.z)
      dummy.rotation.set(elapsed * 0.4 + petal.phase, elapsed * 0.3 + petal.phase, elapsed * 0.18 + petal.phase)
      dummy.scale.setScalar(petal.size)
      dummy.updateMatrix()
      petals.setMatrixAt(i, dummy.matrix)
    }
    petals.instanceMatrix.needsUpdate = true
    renderer.render(scene, camera)
    if (!parameters.paused) frame = requestAnimationFrame(render)
  }
  const invalidate = () => {
    if (!frame && !disposed && !lost && visible && !document.hidden) frame = requestAnimationFrame(render)
  }
  const resize = () => {
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    invalidate()
  }
  const suspend = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0 }
  const onVisibility = () => { if (document.hidden) suspend(); else invalidate() }
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) invalidate(); else suspend()
  })
  const resizeObserver = new ResizeObserver(resize)
  const onLost = (event: Event) => { event.preventDefault(); lost = true; suspend(); onFailure() }
  renderer.domElement.addEventListener('webglcontextlost', onLost)
  document.addEventListener('visibilitychange', onVisibility)
  intersection.observe(host)
  resizeObserver.observe(host)
  resize()

  return {
    invalidate,
    dispose() {
      disposed = true
      suspend()
      intersection.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      renderer.domElement.removeEventListener('webglcontextlost', onLost)
      geometry.dispose()
      material.dispose()
      scene.clear()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
