import {
  BoxGeometry,
  CapsuleGeometry,
  ColorRepresentation,
  Group,
  LineBasicMaterial,
  LineSegments,
  Vector3,
} from 'three';
import { PhysicsControls } from '../controls/base/PhysicsControls';

class PhysicsControlsHelper extends Group {
  readonly type: string = ' PhysicsControlsHelper';

  controls: PhysicsControls;

  capsuleHelper: LineSegments;
  boundaryHelper?: LineSegments;

  private _capsulePosition: Vector3 = new Vector3();

  constructor(controls: PhysicsControls, color: ColorRepresentation = 0xffffff) {
    super();

    // Create capsule geometry to visualize the player's collider
    const capsuleGeometry = new CapsuleGeometry(
      controls.collider.radius,
      controls.collider.height - 2 * controls.collider.radius,
    );
    this.capsuleHelper = new LineSegments(capsuleGeometry, new LineBasicMaterial({ color: color, toneMapped: false }));
    this.add(this.capsuleHelper);

    // Create box geometry if boundary is set
    if (controls.boundary) {
      const { x, y, z } = controls.boundary;
      const width = x.max - x.min;
      const height = y.max - y.min;
      const depth = z.max - z.min;

      const boxGeometry = new BoxGeometry(width, height, depth, width, height, depth);
      this.boundaryHelper = new LineSegments(boxGeometry, new LineBasicMaterial({ color: color, toneMapped: false }));
      this.add(this.boundaryHelper);
    }

    this.controls = controls;
    this.matrixAutoUpdate = false; // Manually control matrix updates

    this.update();
  }

  /**
   * Updates the position and rotation of the helper to match the controls' object.
   */
  update() {
    this.controls.object.updateMatrixWorld(true);

    this._capsulePosition.copy(this.controls.object.position);
    this._capsulePosition.y += this.controls.collider.height / 2;

    this.capsuleHelper.position.copy(this._capsulePosition);
    this.capsuleHelper.rotation.copy(this.controls.object.rotation);

    this.updateMatrix();
  }
}

export { PhysicsControlsHelper };
