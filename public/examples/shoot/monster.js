import { AnimationMixer } from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Monster {
  constructor(object, target, runClip, dieClip) {
    this.health = 100;

    this.object = object;
    this.target = target;
    this.mixer = new AnimationMixer(this.object);
    this.runAction = this.mixer.clipAction(runClip);
    this.dieAction = this.mixer.clipAction(dieClip);
    this.dieAction.clampWhenFinished = true;

    this._targetPosition = this.target.position.clone();

    this.runAction.play();
  }

  hit(damage) {
    this.health -= damage;

    if (this.health <= 0) {
      this.dieAction.play();
    }
  }

  // playAnimation(clipName) {
  //   const clip = this.clips.find(clip => clip.name === clipName);
  //   if (clip) {
  //     if (this.currentAction) {
  //       this.currentAction.stop();
  //     }
  //     this.currentAction = this.mixer.clipAction(clip);
  //     this.currentAction.play();
  //   } else {
  //     console.warn(`Clip "${clipName}" not found.`);
  //   }
  // }

  update(delta) {
    this.mixer.update(delta);

    this._targetPosition.copy(this.target.position);
    this._targetPosition.y = 0;
    this.object.lookAt(this._targetPosition);

    const direction = this._targetPosition.sub(this.object.position).normalize();
    const distance = this.object.position.distanceTo(this.target.position);

    if (distance > 3) {
      this.object.position.add(direction.multiplyScalar(delta));
    }
  }
}

class MonsterFactory {
  constructor() {
    this.gltfLoader = new GLTFLoader();

    this.object = null;
    this.runClip = null;
    this.dieClip = null;

    this.monsters = [];

    this.loadGLTF();
  }

  async loadGLTF() {
    Promise.all([
      this.gltfLoader.loadAsync('../../assets/models/monster.glb'),
      this.gltfLoader.loadAsync('../../assets/animations/monster_run.glb'),
      this.gltfLoader.loadAsync('../../assets/animations/monster_die.glb'),
    ]).then(([object, runClip, dieClip]) => {
      this.object = object.scene;
      this.runClip = runClip.animations[0];
      this.dieClip = dieClip.animations[0];
    });
  }

  createMonster(target) {
    if (!this.object || !this.runClip) {
      console.warn('GLTF data is not loaded. Call loadGLTF() first.');
      return null;
    }

    const clonedObject = SkeletonUtils.clone(this.object);
    clonedObject.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return new Monster(clonedObject, target, this.runClip, this.dieClip);
  }
}

export { Monster, MonsterFactory };
