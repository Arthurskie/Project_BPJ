import * as THREE from 'three';

export function fitCivicCamera(camera, bounds, aspect) {
  const center = new THREE.Vector3(0, 1.15, 0);
  const direction = new THREE.Vector3(7.8, 4.95, 10.5).normalize();
  camera.aspect = aspect;
  camera.position.copy(center).add(direction);
  camera.lookAt(center);
  const inverseRotation = camera.quaternion.clone().invert();
  const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * .96;
  const horizontal = vertical * aspect;
  // Keep the first illustration's camera unless a narrow frame needs more room.
  let distance = new THREE.Vector3(7.8, 4.95, 10.5).length();
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(center).applyQuaternion(inverseRotation);
        distance = Math.max(distance, point.z + Math.abs(point.x) / horizontal, point.z + Math.abs(point.y) / vertical);
      }
    }
  }
  camera.position.copy(center).addScaledVector(direction, distance);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}
