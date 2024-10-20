import { AnimationClip, Object3D } from 'three';
/**
 * Type definition for a collection of animation clips.
 */
export type AnimationClips = Record<string, AnimationClip>;
/**
 * Class representing a character or group of characters with animations.
 */
declare class Characters {
    private _mixer;
    private _objectGroup;
    private _animationClips;
    private _animationActions;
    /**
     * Constructs a new Characters instance.
     * @param object - The initial Object3D to add to the character.
     * @param _animationClips - Optional initial animation clips.
     */
    constructor(object: Object3D, _animationClips?: AnimationClips);
    /**
     * Returns a read-only copy of the animation clips.
     */
    get clips(): Readonly<{
        [x: string]: AnimationClip;
    }>;
    /**
     * Adds an object to the animation object group.
     * @param object - The Object3D to add.
     */
    addObject(object: Object3D): void;
    /**
     * Removes an object from the animation object group.
     * @param object - The Object3D to remove.
     */
    removeObject(object: Object3D): void;
    /**
     * Adds an animation clip and its corresponding action.
     * @param key - The identifier for the animation clip.
     * @param clip - The AnimationClip to add.
     */
    setAnimationClip(key: string, clip: AnimationClip): void;
    /**
     * Removes an animation clip and its corresponding action.
     * @param key - The identifier for the animation clip to remove.
     */
    removeAnimationClip(key: string): void;
    /**
     * Smoothly transitions to the specified animation action over a given duration.
     * @param key - The identifier for the animation action to transition to.
     * @param duration - The duration of the transition in seconds.
     */
    fadeToAction(key: string, duration: number): void;
    /**
     * Updates the _mixer with the given delta time.
     * @param delta - The time increment in seconds.
     */
    update(delta: number): void;
    /**
     * Stops all actions and disposes of the _mixer.
     */
    dispose(): void;
}
export { Characters };
