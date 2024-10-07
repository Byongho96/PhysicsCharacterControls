import {
  BoxGeometry,
  CapsuleGeometry,
  ColorRepresentation,
  Group,
  LineBasicMaterial,
  LineSegments,
  Vector3,
} from 'three';
import { PhysicsControls } from '../controls/PhysicsControls';

class PhysicsControlsHelper extends Group {
  controls: PhysicsControls;

  readonly type: string = 'PhysicsControlsHelper';

  capsuleHelper: LineSegments;
  boundaryHelper?: LineSegments;

  _position: Vector3 = new Vector3();

  constructor(
    controls: PhysicsControls,
    color: ColorRepresentation = 0xffffff,
  ) {
    super();

    const capsuleGeometry = new CapsuleGeometry(
      controls.radius,
      controls.height - 2 * controls.radius,
    );
    this.capsuleHelper = new LineSegments(
      capsuleGeometry,
      new LineBasicMaterial({ color: color, toneMapped: false }),
    );
    this.add(this.capsuleHelper);

    if (controls.boundary) {
      const width = controls.boundary.x[1] - controls.boundary.x[0];
      const height = controls.boundary.y[1] - controls.boundary.y[0];
      const depth = controls.boundary.z[1] - controls.boundary.z[0];

      const boxGeometry = new BoxGeometry(
        width,
        height,
        depth,
        width,
        height,
        depth,
      );
      this.boundaryHelper = new LineSegments(
        boxGeometry,
        new LineBasicMaterial({ color: color, toneMapped: false }),
      );
      this.add(this.boundaryHelper);
    }

    this.controls = controls;
    this.matrixAutoUpdate = false;

    this.update();
  }

  update() {
    this.controls.object.updateMatrixWorld(true);

    this._position.copy(this.controls.object.position);
    this._position.y += this.controls.height / 2;

    this.capsuleHelper.position.copy(this._position);
    this.capsuleHelper.rotation.copy(this.controls.object.rotation);

    this.updateMatrix();
  }
}

export { PhysicsControlsHelper };
