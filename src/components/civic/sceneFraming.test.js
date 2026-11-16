import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fitCivicCamera } from './sceneFraming.js';

test('original hero composition stays contained across constrained frame sizes', () => {
  const bounds = new THREE.Box3(new THREE.Vector3(-3.65, -.41, -2.66), new THREE.Vector3(3.65, 4.97, 2.66));
  for (const aspect of [.7, .9, 1.1, 1.35, 1.8]) {
    const camera = new THREE.PerspectiveCamera(33, aspect, .1, 100);
    fitCivicCamera(camera, bounds, aspect);
    let extent = 0;
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const point = new THREE.Vector3(x, y, z).project(camera);
      assert.ok(Math.abs(point.x) <= .961 && Math.abs(point.y) <= .961, `corner escaped at aspect ${aspect}`);
      extent = Math.max(extent, Math.abs(point.x), Math.abs(point.y));
      assert.ok(point.z > -1 && point.z < 1);
    }
    assert.ok(extent > .5, `scene is too small at aspect ${aspect}`);
    const direction = camera.position.clone().sub(new THREE.Vector3(0, 1.15, 0)).normalize();
    assert.ok(direction.distanceTo(new THREE.Vector3(7.8, 4.95, 10.5).normalize()) < 1e-10);
  }
});

 test('wide frames preserve the original camera position and target', () => {
  const camera = new THREE.PerspectiveCamera(33, 1.8, .1, 50);
  const bounds = new THREE.Box3(new THREE.Vector3(-2.65, -.14, -1.9), new THREE.Vector3(2.8, 4.725, 2));
  fitCivicCamera(camera, bounds, 1.8);
  assert.ok(camera.position.distanceTo(new THREE.Vector3(7.8, 6.1, 10.5)) < 1e-10);
});
