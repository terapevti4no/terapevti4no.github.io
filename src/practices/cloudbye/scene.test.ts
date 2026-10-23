import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialScene, sceneReducer } from './scene.ts';

test('a new thought keeps the existing cloud and preserves the queue', () => {
  const scene = sceneReducer(initialScene(), { type: 'add', thoughtIndex: 3 });
  assert.deepEqual(scene.clouds, [
    { id: 0, thoughtIndex: 0, fresh: false, leaving: true },
    { id: 1, thoughtIndex: 3, fresh: true, leaving: false },
  ]);
  assert.equal(scene.nextIndex, 1);
  const next = sceneReducer(scene, { type: 'finish', id: 1, count: 4 });
  assert.equal(next.clouds.find(cloud => !cloud.leaving)?.thoughtIndex, 1);
});

test('a departing cloud cannot advance the queue or remove a newer cloud', () => {
  const scene = sceneReducer(initialScene(), { type: 'add', thoughtIndex: 1 });
  const next = sceneReducer(scene, { type: 'finish', id: 0, count: 2 });
  assert.deepEqual(next.clouds, [scene.clouds[1]]);
  assert.equal(next.nextIndex, scene.nextIndex);
  assert.equal(sceneReducer(next, { type: 'finish', id: 0, count: 2 }), next);
});

test('a newly added thought is not immediately repeated in a two-thought session', () => {
  const scene = sceneReducer(initialScene(), { type: 'add', thoughtIndex: 1 });
  const next = sceneReducer(scene, { type: 'finish', id: 1, count: 2 });
  assert.equal(next.clouds.find(cloud => !cloud.leaving)?.thoughtIndex, 0);
});

test('several additions and out-of-order animation endings leave one current cloud', () => {
  let scene = sceneReducer(initialScene(), { type: 'add', thoughtIndex: 1 });
  scene = sceneReducer(scene, { type: 'add', thoughtIndex: 2 });
  assert.equal(scene.clouds.filter(cloud => !cloud.leaving).length, 1);
  assert.equal(scene.clouds.at(-1)?.thoughtIndex, 2);
  scene = sceneReducer(scene, { type: 'finish', id: 2, count: 3 });
  scene = sceneReducer(scene, { type: 'finish', id: 1, count: 3 });
  scene = sceneReducer(scene, { type: 'finish', id: 0, count: 3 });
  assert.equal(scene.clouds.length, 1);
  assert.equal(scene.clouds[0].thoughtIndex, 1);
  assert.deepEqual(sceneReducer(scene, { type: 'reset' }), initialScene());
});
