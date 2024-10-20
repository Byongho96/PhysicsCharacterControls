import { AnimationAction, AnimationClip, AnimationMixer, AnimationObjectGroup, Object3D } from 'three';

/**
 * Type definition for a collection of animation clips.
 */
export type AnimationClips = Record<string, AnimationClip>;

/**
 * Class representing a character or group of characters with animations.
 */
class Characters {
  private _mixer: AnimationMixer;
  private _objectGroup: AnimationObjectGroup;
  private _animationClips: Record<string, AnimationClip> = {};
  private _animationActions: Record<string, AnimationAction> = {};

  /**
   * Constructs a new Characters instance.
   * @param object - The initial Object3D to add to the character.
   * @param _animationClips - Optional initial animation clips.
   */
  constructor(object: Object3D, _animationClips?: AnimationClips) {
    this._objectGroup = new AnimationObjectGroup(object);
    this._mixer = new AnimationMixer(this._objectGroup);

    if (_animationClips) {
      Object.entries(_animationClips).forEach(([key, clip]) => {
        this.setAnimationClip(key, clip);
      });
    }
  }

  /**
   * Returns a read-only copy of the animation clips.
   */
  get clips() {
    return Object.freeze({ ...this._animationClips });
  }

  /**
   * Adds an object to the animation object group.
   * @param object - The Object3D to add.
   */
  addObject(object: Object3D) {
    this._objectGroup.add(object);
  }

  /**
   * Removes an object from the animation object group.
   * @param object - The Object3D to remove.
   */
  removeObject(object: Object3D) {
    this._objectGroup.remove(object);
  }

  /**
   * Adds an animation clip and its corresponding action.
   * @param key - The identifier for the animation clip.
   * @param clip - The AnimationClip to add.
   */
  setAnimationClip(key: string, clip: AnimationClip) {
    const action = this._mixer.clipAction(clip);

    this._animationClips[key] = clip;
    this._animationActions[key] = action;
  }

  /**
   * Removes an animation clip and its corresponding action.
   * @param key - The identifier for the animation clip to remove.
   */
  removeAnimationClip(key: string) {
    const clip = this._animationClips[key];
    if (!clip) return;

    const action = this._animationActions[key];
    if (action) {
      action.stop();
      this._mixer.uncacheAction(clip, this._objectGroup);
    }

    this._mixer.uncacheClip(clip);

    delete this._animationClips[key];
    delete this._animationActions[key];
  }

  /**
   * Smoothly transitions to the specified animation action over a given duration.
   * @param key - The identifier for the animation action to transition to.
   * @param duration - The duration of the transition in seconds.
   */
  fadeToAction(key: string, duration: number) {
    const action = this._animationActions[key];
    if (!action || action.isRunning()) return;

    // Fade out all current actions
    Object.values(this._animationActions).forEach(currentAction => {
      currentAction.fadeOut(duration);
    });

    action.reset(); // Reset the action to start from the beginning
    action.fadeIn(duration);
    action.play(); // Play the action
  }

  /**
   * Updates the _mixer with the given delta time.
   * @param delta - The time increment in seconds.
   */
  update(delta: number) {
    this._mixer.update(delta);
  }

  /**
   * Stops all actions and disposes of the _mixer.
   */
  dispose() {
    this._mixer.stopAllAction();
    this._mixer.uncacheRoot(this._objectGroup);
  }
}

export { Characters };
