import { AnimationClip, Object3D } from 'three';
export type AnimationClips = Record<string, AnimationClip>;
declare class Characters {
    private mixer;
    private objectGroup;
    private _animationClips;
    private _animationActions;
    constructor(object: Object3D, animationClips?: AnimationClips);
    get animationClips(): Readonly<{
        [x: string]: AnimationClip;
    }>;
    addObject(object: Object3D): void;
    removeObject(object: Object3D): void;
    setAnimationClip(key: string, clip: AnimationClip): void;
    removeAnimationClip(key: string): void;
    fadeToAction(key: string, duration: number): void;
    update(delta: number): void;
    dispose(): void;
}
export { Characters };
