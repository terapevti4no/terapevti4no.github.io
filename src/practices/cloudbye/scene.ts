export type FlyingThought = {
  id: number;
  thoughtIndex: number;
  fresh: boolean;
  leaving: boolean;
};

type Scene = { clouds: FlyingThought[]; nextIndex: number; nextId: number };
type Action = { type: 'reset' } | { type: 'add'; thoughtIndex: number } | { type: 'finish'; id: number; count: number };

export function initialScene(): Scene {
  return { clouds: [{ id: 0, thoughtIndex: 0, fresh: false, leaving: false }], nextIndex: 1, nextId: 1 };
}

export function sceneReducer(scene: Scene, action: Action): Scene {
  if (action.type === 'reset') return initialScene();
  if (action.type === 'add') return {
    ...scene,
    // Retain IDs so existing clouds continue their animations without restarting.
    clouds: [...scene.clouds.map(cloud => ({ ...cloud, leaving: true })),
      { id: scene.nextId, thoughtIndex: action.thoughtIndex, fresh: true, leaving: false }],
    nextId: scene.nextId + 1,
  };
  const finished = scene.clouds.find(cloud => cloud.id === action.id);
  if (!finished) return scene;
  const remaining = scene.clouds.filter(cloud => cloud.id !== action.id);
  if (finished.leaving) return { ...scene, clouds: remaining };
  let next = scene.nextIndex % action.count;
  // A newly added thought has already appeared; don't immediately repeat it.
  if (next === finished.thoughtIndex && action.count > 1) next = (next + 1) % action.count;
  return {
    clouds: [...remaining, { id: scene.nextId, thoughtIndex: next, fresh: false, leaving: false }],
    nextIndex: next + 1,
    nextId: scene.nextId + 1,
  };
}
