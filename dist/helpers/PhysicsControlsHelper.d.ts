import { ColorRepresentation, Group, LineSegments, Vector3 } from 'three';
import { PhysicsControls } from '../controls/PhysicsControls';
declare class PhysicsControlsHelper extends Group {
    controls: PhysicsControls;
    readonly type: string;
    capsuleHelper: LineSegments;
    boundaryHelper?: LineSegments;
    _position: Vector3;
    constructor(controls: PhysicsControls, color?: ColorRepresentation);
    update(): void;
}
export { PhysicsControlsHelper };
