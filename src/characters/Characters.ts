import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  AnimationObjectGroup,
  Object3D,
} from 'three';

export type AnimationClips = Record<string, AnimationClip>;

class Characters {
  private mixer: AnimationMixer;
  private objectGroup: AnimationObjectGroup;
  private _animationClips: Record<string, AnimationClip> = {};
  private _animationActions: Record<string, AnimationAction> = {};

  constructor(object: Object3D, animationClips?: AnimationClips) {
    this.objectGroup = new AnimationObjectGroup(object);
    this.mixer = new AnimationMixer(this.objectGroup);

    if (!animationClips) return;
    Object.entries(animationClips).forEach(([key, clip]) => {
      this.setAnimationClip(key, clip);
    });
  }

  get animationClips() {
    return Object.freeze({ ...this._animationClips });
  }

  addObject(object: Object3D) {
    this.objectGroup.add(object);
  }

  removeObject(object: Object3D) {
    this.objectGroup.remove(object);
  }

  setAnimationClip(key: string, clip: AnimationClip) {
    const action = this.mixer.clipAction(clip);

    this._animationClips[key] = clip;
    this._animationActions[key] = action;
  }

  removeAnimationClip(key: string) {
    const clip = this._animationClips[key];
    if (!clip) return;

    const action = this._animationActions[key];
    if (!action) return;

    action.stop();
    this.mixer.uncacheClip(clip);
    this.mixer.uncacheAction(clip, this.objectGroup);

    delete this._animationClips[key];
    delete this._animationActions[key];
  }

  fadeToAction(key: string, duration: number) {
    const action = this._animationActions[key];
    if (!action) return;

    if (action.isRunning()) return;

    Object.values(this._animationActions).forEach(action => {
      action.fadeOut(duration);
    });

    action.reset(); // 새로운 액션을 처음부터 재생
    action.fadeIn(duration);
    action.play(); // 액션을 재생합니다.
  }

  update(delta: number) {
    this.mixer.update(delta);
  }

  dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.objectGroup);
  }
}

export { Characters };
