import { BoxGeometry, CapsuleGeometry, ColorRepresentation, Group, LineBasicMaterial, LineSegments } from 'three';
import { PhysicsControls } from '../controls/base/PhysicsControls';
/**
 * Helper class for visualizing the PhysicsControls' collider and boundaries.
 */
declare class PhysicsControlsHelper extends Group {
    readonly type: string;
    controls: PhysicsControls;
    capsuleHelper: LineSegments<CapsuleGeometry, LineBasicMaterial>;
    boundaryHelper?: LineSegments<BoxGeometry, LineBasicMaterial>;
    private _capsulePosition;
    /**
     * Constructs a new PhysicsControlsHelper.
     * @param controls - The PhysicsControls instance to visualize.
     * @param color - The color for the helper visualization.
     */
    constructor(controls: PhysicsControls, color?: ColorRepresentation);
    /**
     * Updates the position and rotation of the helper to match the controls' object.
     */
    update(): void;
    /**
     * Disposes of the helper's geometry and material.
     */
    dispose(): void;
}
export { PhysicsControlsHelper };
