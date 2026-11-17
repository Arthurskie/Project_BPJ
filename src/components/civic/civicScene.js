import {
  Box3, BoxGeometry, CircleGeometry, CylinderGeometry, DirectionalLight,
  ExtrudeGeometry, Group, HemisphereLight, MathUtils, Mesh,
  MeshStandardMaterial, PCFShadowMap, PerspectiveCamera, Scene,
  ShadowMaterial, Shape, SRGBColorSpace, WebGLRenderer,
} from 'three';
import { fitCivicCamera } from './sceneFraming.js';

export function mountCivicScene(host, onLost, onReady) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.outputColorSpace = SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new Scene();
  const camera = new PerspectiveCamera(33, 1, 0.1, 50);
  camera.position.set(7.8, 6.1, 10.5);
  camera.lookAt(0, 1.15, 0);
  scene.add(new HemisphereLight(0xfffaf0, 0xb8ab99, 2.8));
  const light = new DirectionalLight(0xfff4df, 4.2);
  light.position.set(-3, 8, 5);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  Object.assign(light.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
  light.shadow.bias = -0.002;
  scene.add(light);
  const group = new Group();
  scene.add(group);
  const materials = {};
  const mat = (color) => materials[color] ||= new MeshStandardMaterial({ color, roughness: 0.78 });
  const box = (w, h, d, x, y, z, color, parent = group) => {
    const mesh = new Mesh(new BoxGeometry(w, h, d), mat(color));
    mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  box(5.3, .18, 3.8, 0, -.05, 0, '#d8cfbf');
  box(4.7, .15, 3.25, 0, .1, 0, '#e8e0d3');
  box(4.15, 2.1, 2.3, 0, 1.25, -.2, '#e5dccb');
  box(4.5, .17, 2.7, 0, 2.36, -.2, '#fffaf0');
  for (const x of [-1.65, -.82, .82, 1.65]) {
    box(.25, 1.94, .28, x, 1.29, 1.12, '#fffcf3');
    box(.38, .13, .4, x, .34, 1.12, '#f5eddf');
    box(.38, .13, .4, x, 2.2, 1.12, '#f5eddf');
  }
  box(.7, 1.35, .06, 0, .98, .99, '#756c60');
  for (const x of [-1.3, 1.3]) box(.52, .83, .06, x, 1.28, .98, '#a89f8e');
  box(4.55, .13, .6, 0, .3, 1.37, '#d0c5b3');
  box(4.85, .12, .65, 0, .18, 1.58, '#e0d6c6');
  const roofShape = new Shape();
  roofShape.moveTo(-2.4, 0); roofShape.lineTo(2.4, 0); roofShape.lineTo(0, 1.22); roofShape.closePath();
  const roof = new Mesh(new ExtrudeGeometry(roofShape, { depth: 2.85, bevelEnabled: false }), mat('#b92f34'));
  roof.position.set(0, 2.47, -1.65); roof.castShadow = true; group.add(roof);
  box(.045, 1.35, .045, 0, 4.05, -.2, '#786e60');
  box(.72, .24, .025, .38, 4.55, -.2, '#c42f35');
  box(.72, .24, .025, .38, 4.31, -.2, '#fffdf7');
  const paper = new Group();
  paper.position.set(2.05, 1.18, 1.8); paper.rotation.set(-.12, -.15, -.16); group.add(paper);
  box(1.3, 1.8, .08, 0, 0, 0, '#fffdf7', paper);
  box(.37, .065, .02, -.25, .57, .055, '#bc3539', paper);
  for (let i = 0; i < 4; i++) box(i === 3 ? .58 : .9, .035, .02, i === 3 ? -.16 : 0, .29 - i * .16, .055, '#c3b9aa', paper);
  const seal = new Mesh(new CylinderGeometry(.2, .2, .025, 32), mat('#ba3237'));
  seal.rotation.x = Math.PI / 2; seal.position.set(.3, -.52, .065); paper.add(seal);
  const floor = new Mesh(new CircleGeometry(5, 64), new ShadowMaterial({ opacity: .12 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.16; floor.receiveShadow = true; scene.add(floor);
  let frame = 0, last = 0, visible = true, disposed = false, dirty = true;
  let targetX = 0, targetY = 0, rendered = false, sized = false;
  const resize = () => { const { width, height } = host.getBoundingClientRect(); if (!width || !height) return; renderer.setSize(width, height, false); sized = true;
    const bounds = new Box3().setFromObject(group).expandByScalar(.3);
    fitCivicCamera(camera, bounds, width / height); dirty = true; resume(); };
  const observer = new ResizeObserver(resize); observer.observe(host);
  const move = (event) => { const r = host.getBoundingClientRect(); targetY = MathUtils.clamp((event.clientX - r.left) / r.width - .5, -.5, .5) * .18; targetX = MathUtils.clamp((event.clientY - r.top) / r.height - .5, -.5, .5) * .06; dirty = true; resume(); };
  const reset = () => { targetX = 0; targetY = 0; dirty = true; resume(); };
  const draw = (time) => {
    if (disposed || !visible || document.hidden) { frame = 0; return; }
    frame = 0;
    if (time - last < 1000 / 30) { frame = requestAnimationFrame(draw); return; }
    last = time;
    group.rotation.y += (targetY - group.rotation.y) * .08;
    group.rotation.x += (targetX - group.rotation.x) * .08;
    if (dirty && sized) {
      try {
        renderer.render(scene, camera);
        if (!rendered) { rendered = true; onReady?.(); }
      } catch { onLost(); return; }
    }
    dirty = Math.abs(targetY - group.rotation.y) > .0001 || Math.abs(targetX - group.rotation.x) > .0001;
    if (dirty) frame = requestAnimationFrame(draw);
  };
  const resume = () => { if (visible && !document.hidden && !frame && !disposed) frame = requestAnimationFrame(draw); };
  const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); }, { threshold: .05 }); visibility.observe(host);
  host.addEventListener('pointermove', move); host.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', resume);
  const lost = (event) => { event.preventDefault(); disposed = true; onLost(); cancelAnimationFrame(frame); frame = 0; };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  resize();
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect();
    host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', reset);
    document.removeEventListener('visibilitychange', resume); renderer.domElement.removeEventListener('webglcontextlost', lost);
    scene.traverse(object => { object.geometry?.dispose(); });
    Object.values(materials).forEach(material => material.dispose()); floor.material.dispose();
    renderer.dispose(); renderer.domElement.remove();
  };
}
