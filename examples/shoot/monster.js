import { AnimationMixer, AudioLoader, PositionalAudio } from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Monster {
  constructor(object, target, runClip, dieClip, audio, growlBuffer, attackBuffer) {
    this.health = 100;

    this.object = object;
    this.target = target;

    this.mixer = new AnimationMixer(this.object);
    this.runAction = this.mixer.clipAction(runClip);
    this.dieAction = this.mixer.clipAction(dieClip);
    this.dieAction.clampWhenFinished = true;

    this.audio = audio;
    this.growlBuffer = growlBuffer;
    this.attackBuffer = attackBuffer;

    this.audio.setBuffer(this.growlBuffer);
    this.audio.setRefDistance(5);
    this.audio.setLoop(true);
    this.audio.play();

    this._targetPosition = this.target.position.clone();

    this.runAction.play();
  }

  hit(damage) {
    this.health -= damage;

    if (this.health <= 0) {
      this.audio.stop();
      this.audio.setLoop(false);
      this.audio.setBuffer(this.attackBuffer);
      this.audio.play();
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
  constructor(listener) {
    this.listener = listener;

    this.gltfLoader = new GLTFLoader();
    this.audioLoader = new AudioLoader();

    this.object = null;

    this.runClip = null;
    this.dieClip = null;

    this.growlBuffer = null;
    this.attackBuffer = null;

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

    Promise.all([
      this.audioLoader.loadAsync('../../assets/audios/monster-growl.mp3'),
      this.audioLoader.loadAsync('../../assets/audios/monster-attack.mp3'),
    ]).then(([growlBuffer, attackBuffer]) => {
      this.growlBuffer = growlBuffer;
      this.attackBuffer = attackBuffer;
    });
  }

  createMonster(target) {
    if (!this.object || !this.runClip || !this.dieClip || !this.growlBuffer || !this.attackBuffer) {
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

    const audio = new PositionalAudio(this.listener);

    return new Monster(clonedObject, target, this.runClip, this.dieClip, audio, this.growlBuffer, this.attackBuffer);
  }
}

export { Monster, MonsterFactory };
