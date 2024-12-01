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

/**
 * Helper class for visualizing the PhysicsControls' collider and boundaries.
 */
class PhysicsControlsHelper extends Group {
  readonly type: string = 'PhysicsControlsHelper';

  controls: PhysicsControls;

  capsuleHelper: LineSegments<CapsuleGeometry, LineBasicMaterial>;
  boundaryHelper?: LineSegments<BoxGeometry, LineBasicMaterial>;

  private _capsulePosition: Vector3 = new Vector3();

  /**
   * Constructs a new PhysicsControlsHelper.
   * @param controls - The PhysicsControls instance to visualize.
   * @param color - The color for the helper visualization.
   */
  constructor(controls: PhysicsControls, color: ColorRepresentation = 0xffffff) {
    super();

    this.controls = controls;

    // Create capsule geometry to visualize the collider.
    const capsuleGeometry = new CapsuleGeometry(
      controls.collider.radius,
      controls.collider.height - 2 * controls.collider.radius,
    );
    this.capsuleHelper = new LineSegments(capsuleGeometry, new LineBasicMaterial({ color: color, toneMapped: false }));
    this.add(this.capsuleHelper);

    // Create box geometry to visualize the boundary if it is set.
    if (controls.boundary) {
      const width = controls.boundary.x.max - controls.boundary.x.min;
      const height = controls.boundary.y.max - controls.boundary.y.min;
      const depth = controls.boundary.z.max - controls.boundary.z.min;

      const boxGeometry = new BoxGeometry(width, height, depth, width, height, depth);
      this.boundaryHelper = new LineSegments(boxGeometry, new LineBasicMaterial({ color: color, toneMapped: false }));

      this.boundaryHelper.position.set(
        controls.boundary.x.min + width / 2,
        controls.boundary.y.min + height / 2,
        controls.boundary.z.min + depth / 2,
      );

      this.add(this.boundaryHelper);
    }

    this.matrixAutoUpdate = false;

    this.update();
  }

  /**
   * Updates the position and rotation of the helper to match the controls' object.
   */
  update() {
    this.controls.object.updateMatrixWorld(true);

    this.controls.object.getWorldPosition(this._capsulePosition);
    this._capsulePosition.y += this.controls.collider.height / 2;

    this.capsuleHelper.position.copy(this._capsulePosition);

    this.updateMatrix();
  }

  /**
   * Disposes of the helper's geometry and material.
   */
  dispose() {
    this.capsuleHelper.geometry.dispose();
    this.capsuleHelper.material.dispose();

    if (this.boundaryHelper) {
      this.boundaryHelper.geometry.dispose();
      this.boundaryHelper.material.dispose();
    }

    this.clear();
  }
}

export { PhysicsControlsHelper };
