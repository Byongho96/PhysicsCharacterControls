'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var three = require('three');

function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

var Capsule = /*#__PURE__*/function () {
  function Capsule() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new three.Vector3(0, 0, 0);
    var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new three.Vector3(0, 1, 0);
    var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    _classCallCheck(this, Capsule);
    this.start = start;
    this.end = end;
    this.radius = radius;
  }
  return _createClass(Capsule, [{
    key: "clone",
    value: function clone() {
      return new Capsule(this.start.clone(), this.end.clone(), this.radius);
    }
  }, {
    key: "set",
    value: function set(start, end, radius) {
      this.start.copy(start);
      this.end.copy(end);
      this.radius = radius;
    }
  }, {
    key: "copy",
    value: function copy(capsule) {
      this.start.copy(capsule.start);
      this.end.copy(capsule.end);
      this.radius = capsule.radius;
    }
  }, {
    key: "getCenter",
    value: function getCenter(target) {
      return target.copy(this.end).add(this.start).multiplyScalar(0.5);
    }
  }, {
    key: "translate",
    value: function translate(v) {
      this.start.add(v);
      this.end.add(v);
    }
  }, {
    key: "checkAABBAxis",
    value: function checkAABBAxis(p1x, p1y, p2x, p2y, minx, maxx, miny, maxy, radius) {
      return (minx - p1x < radius || minx - p2x < radius) && (p1x - maxx < radius || p2x - maxx < radius) && (miny - p1y < radius || miny - p2y < radius) && (p1y - maxy < radius || p2y - maxy < radius);
    }
  }, {
    key: "intersectsBox",
    value: function intersectsBox(box) {
      return this.checkAABBAxis(this.start.x, this.start.y, this.end.x, this.end.y, box.min.x, box.max.x, box.min.y, box.max.y, this.radius) && this.checkAABBAxis(this.start.x, this.start.z, this.end.x, this.end.z, box.min.x, box.max.x, box.min.z, box.max.z, this.radius) && this.checkAABBAxis(this.start.y, this.start.z, this.end.y, this.end.z, box.min.y, box.max.y, box.min.z, box.max.z, this.radius);
    }
  }]);
}();

var _v1 = new three.Vector3();
var _v2 = new three.Vector3();
var _point1 = new three.Vector3();
var _point2 = new three.Vector3();
var _plane = new three.Plane();
var _line1 = new three.Line3();
var _line2 = new three.Line3();
var _sphere = new three.Sphere();
var _capsule = new Capsule();
var _temp1 = new three.Vector3();
var _temp2 = new three.Vector3();
var _temp3 = new three.Vector3();
var EPS = 1e-10;
function lineToLineClosestPoints(line1, line2) {
  var target1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var target2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var r = _temp1.copy(line1.end).sub(line1.start);
  var s = _temp2.copy(line2.end).sub(line2.start);
  var w = _temp3.copy(line2.start).sub(line1.start);
  var a = r.dot(s),
    b = r.dot(r),
    c = s.dot(s),
    d = s.dot(w),
    e = r.dot(w);
  var t1, t2;
  var divisor = b * c - a * a;
  if (Math.abs(divisor) < EPS) {
    var d1 = -d / c;
    var d2 = (a - d) / c;
    if (Math.abs(d1 - 0.5) < Math.abs(d2 - 0.5)) {
      t1 = 0;
      t2 = d1;
    } else {
      t1 = 1;
      t2 = d2;
    }
  } else {
    t1 = (d * a + e * c) / divisor;
    t2 = (t1 * a - d) / c;
  }
  t2 = Math.max(0, Math.min(1, t2));
  t1 = Math.max(0, Math.min(1, t1));
  if (target1) {
    target1.copy(r).multiplyScalar(t1).add(line1.start);
  }
  if (target2) {
    target2.copy(s).multiplyScalar(t2).add(line2.start);
  }
}
var Octree = /*#__PURE__*/function () {
  function Octree(box) {
    _classCallCheck(this, Octree);
    this.box = box;
    this.bounds = new three.Box3();
    this.subTrees = [];
    this.triangles = [];
    this.layers = new three.Layers();
  }
  return _createClass(Octree, [{
    key: "addTriangle",
    value: function addTriangle(triangle) {
      this.bounds.min.x = Math.min(this.bounds.min.x, triangle.a.x, triangle.b.x, triangle.c.x);
      this.bounds.min.y = Math.min(this.bounds.min.y, triangle.a.y, triangle.b.y, triangle.c.y);
      this.bounds.min.z = Math.min(this.bounds.min.z, triangle.a.z, triangle.b.z, triangle.c.z);
      this.bounds.max.x = Math.max(this.bounds.max.x, triangle.a.x, triangle.b.x, triangle.c.x);
      this.bounds.max.y = Math.max(this.bounds.max.y, triangle.a.y, triangle.b.y, triangle.c.y);
      this.bounds.max.z = Math.max(this.bounds.max.z, triangle.a.z, triangle.b.z, triangle.c.z);
      this.triangles.push(triangle);
      return this;
    }
  }, {
    key: "calcBox",
    value: function calcBox() {
      this.box = this.bounds.clone();

      // offset small amount to account for regular grid
      this.box.min.x -= 0.01;
      this.box.min.y -= 0.01;
      this.box.min.z -= 0.01;
      return this;
    }
  }, {
    key: "split",
    value: function split(level) {
      if (!this.box) return;
      var subTrees = [];
      var halfsize = _v2.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
      for (var x = 0; x < 2; x++) {
        for (var y = 0; y < 2; y++) {
          for (var z = 0; z < 2; z++) {
            var box = new three.Box3();
            var v = _v1.set(x, y, z);
            box.min.copy(this.box.min).add(v.multiply(halfsize));
            box.max.copy(box.min).add(halfsize);
            subTrees.push(new Octree(box));
          }
        }
      }
      var triangle;
      while (triangle = this.triangles.pop()) {
        for (var i = 0; i < subTrees.length; i++) {
          if (subTrees[i].box.intersectsTriangle(triangle)) {
            subTrees[i].triangles.push(triangle);
          }
        }
      }
      for (var _i = 0; _i < subTrees.length; _i++) {
        var len = subTrees[_i].triangles.length;
        if (len > 8 && level < 16) {
          subTrees[_i].split(level + 1);
        }
        if (len !== 0) {
          this.subTrees.push(subTrees[_i]);
        }
      }
      return this;
    }
  }, {
    key: "build",
    value: function build() {
      this.calcBox();
      this.split(0);
      return this;
    }
  }, {
    key: "getRayTriangles",
    value: function getRayTriangles(ray, triangles) {
      for (var i = 0; i < this.subTrees.length; i++) {
        var subTree = this.subTrees[i];
        if (!ray.intersectsBox(subTree.box)) continue;
        if (subTree.triangles.length > 0) {
          for (var j = 0; j < subTree.triangles.length; j++) {
            if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
          }
        } else {
          subTree.getRayTriangles(ray, triangles);
        }
      }
      return triangles;
    }
  }, {
    key: "triangleCapsuleIntersect",
    value: function triangleCapsuleIntersect(capsule, triangle) {
      triangle.getPlane(_plane);
      var d1 = _plane.distanceToPoint(capsule.start) - capsule.radius;
      var d2 = _plane.distanceToPoint(capsule.end) - capsule.radius;
      if (d1 > 0 && d2 > 0 || d1 < -capsule.radius && d2 < -capsule.radius) {
        return false;
      }
      var delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
      var intersectPoint = _v1.copy(capsule.start).lerp(capsule.end, delta);
      if (triangle.containsPoint(intersectPoint)) {
        return {
          normal: _plane.normal.clone(),
          point: intersectPoint.clone(),
          depth: Math.abs(Math.min(d1, d2))
        };
      }
      var r2 = capsule.radius * capsule.radius;
      var line1 = _line1.set(capsule.start, capsule.end);
      var lines = [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]];
      for (var i = 0; i < lines.length; i++) {
        var line2 = _line2.set(lines[i][0], lines[i][1]);
        lineToLineClosestPoints(line1, line2, _point1, _point2);
        if (_point1.distanceToSquared(_point2) < r2) {
          return {
            normal: _point1.clone().sub(_point2).normalize(),
            point: _point2.clone(),
            depth: capsule.radius - _point1.distanceTo(_point2)
          };
        }
      }
      return false;
    }
  }, {
    key: "triangleSphereIntersect",
    value: function triangleSphereIntersect(sphere, triangle) {
      triangle.getPlane(_plane);
      if (!sphere.intersectsPlane(_plane)) return false;
      var depth = Math.abs(_plane.distanceToSphere(sphere));
      var r2 = sphere.radius * sphere.radius - depth * depth;
      var plainPoint = _plane.projectPoint(sphere.center, _v1);
      if (triangle.containsPoint(sphere.center)) {
        return {
          normal: _plane.normal.clone(),
          point: plainPoint.clone(),
          depth: Math.abs(_plane.distanceToSphere(sphere))
        };
      }
      var lines = [[triangle.a, triangle.b], [triangle.b, triangle.c], [triangle.c, triangle.a]];
      for (var i = 0; i < lines.length; i++) {
        _line1.set(lines[i][0], lines[i][1]);
        _line1.closestPointToPoint(plainPoint, true, _v2);
        var d = _v2.distanceToSquared(sphere.center);
        if (d < r2) {
          return {
            normal: sphere.center.clone().sub(_v2).normalize(),
            point: _v2.clone(),
            depth: sphere.radius - Math.sqrt(d)
          };
        }
      }
      return false;
    }
  }, {
    key: "getSphereTriangles",
    value: function getSphereTriangles(sphere, triangles) {
      for (var i = 0; i < this.subTrees.length; i++) {
        var subTree = this.subTrees[i];
        if (!sphere.intersectsBox(subTree.box)) continue;
        if (subTree.triangles.length > 0) {
          for (var j = 0; j < subTree.triangles.length; j++) {
            if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
          }
        } else {
          subTree.getSphereTriangles(sphere, triangles);
        }
      }
    }
  }, {
    key: "getCapsuleTriangles",
    value: function getCapsuleTriangles(capsule, triangles) {
      for (var i = 0; i < this.subTrees.length; i++) {
        var subTree = this.subTrees[i];
        if (!capsule.intersectsBox(subTree.box)) continue;
        if (subTree.triangles.length > 0) {
          for (var j = 0; j < subTree.triangles.length; j++) {
            if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
          }
        } else {
          subTree.getCapsuleTriangles(capsule, triangles);
        }
      }
    }
  }, {
    key: "sphereIntersect",
    value: function sphereIntersect(sphere) {
      _sphere.copy(sphere);
      var triangles = [];
      var result,
        hit = false;
      this.getSphereTriangles(sphere, triangles);
      for (var i = 0; i < triangles.length; i++) {
        if (result = this.triangleSphereIntersect(_sphere, triangles[i])) {
          hit = true;
          _sphere.center.add(result.normal.multiplyScalar(result.depth));
        }
      }
      if (hit) {
        var collisionVector = _sphere.center.clone().sub(sphere.center);
        var depth = collisionVector.length();
        return {
          normal: collisionVector.normalize(),
          depth: depth
        };
      }
      return false;
    }
  }, {
    key: "capsuleIntersect",
    value: function capsuleIntersect(capsule) {
      _capsule.copy(capsule);
      var triangles = [];
      var result,
        hit = false;
      this.getCapsuleTriangles(_capsule, triangles);
      for (var i = 0; i < triangles.length; i++) {
        if (result = this.triangleCapsuleIntersect(_capsule, triangles[i])) {
          hit = true;
          _capsule.translate(result.normal.multiplyScalar(result.depth));
        }
      }
      if (hit) {
        var collisionVector = _capsule.getCenter(new three.Vector3()).sub(capsule.getCenter(_v1));
        var depth = collisionVector.length();
        return {
          normal: collisionVector.normalize(),
          depth: depth
        };
      }
      return false;
    }
  }, {
    key: "rayIntersect",
    value: function rayIntersect(ray) {
      if (ray.direction.length() === 0) return;
      var triangles = [];
      var triangle,
        position,
        distance = 1e100;
      this.getRayTriangles(ray, triangles);
      for (var i = 0; i < triangles.length; i++) {
        var result = ray.intersectTriangle(triangles[i].a, triangles[i].b, triangles[i].c, true, _v1);
        if (result) {
          var newdistance = result.sub(ray.origin).length();
          if (distance > newdistance) {
            position = result.clone().add(ray.origin);
            distance = newdistance;
            triangle = triangles[i];
          }
        }
      }
      return distance < 1e100 ? {
        distance: distance,
        triangle: triangle,
        position: position
      } : false;
    }
  }, {
    key: "fromGraphNode",
    value: function fromGraphNode(group) {
      var _this = this;
      group.updateWorldMatrix(true, true);
      group.traverse(function (obj) {
        if (obj.isMesh === true) {
          if (_this.layers.test(obj.layers)) {
            var geometry,
              isTemp = false;
            if (obj.geometry.index !== null) {
              isTemp = true;
              geometry = obj.geometry.toNonIndexed();
            } else {
              geometry = obj.geometry;
            }
            var positionAttribute = geometry.getAttribute('position');
            for (var i = 0; i < positionAttribute.count; i += 3) {
              var v1 = new three.Vector3().fromBufferAttribute(positionAttribute, i);
              var v2 = new three.Vector3().fromBufferAttribute(positionAttribute, i + 1);
              var v3 = new three.Vector3().fromBufferAttribute(positionAttribute, i + 2);
              v1.applyMatrix4(obj.matrixWorld);
              v2.applyMatrix4(obj.matrixWorld);
              v3.applyMatrix4(obj.matrixWorld);
              _this.addTriangle(new three.Triangle(v1, v2, v3));
            }
            if (isTemp) {
              geometry.dispose();
            }
          }
        }
      });
      this.build();
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.box = null;
      this.bounds.makeEmpty();
      this.subTrees.length = 0;
      this.triangles.length = 0;
      return this;
    }
  }]);
}();

class ColliderCapsule extends Capsule {
    constructor(start, end, radius) {
        super(start, end, radius);
    }
    get height() {
        return this.start.distanceTo(this.end) + 2 * this.radius;
    }
}

/**
 * Predefined event objects for reuse when dispatching events.
 */
const _collideEvent = { type: 'collide' };
/**
 * PhysicsControls class that adds physics-based controls to a 3D object.
 */
class PhysicsControls extends three.Controls {
    /**
     * Constructs a new PhysicsControls instance.
     * @param object - The 3D object to apply physics controls to.
     * @param domElement - The HTML element for event listeners (optional).
     * @param world - The world object used to build the collision octree.
     * @param physicsOptions - Optional physics configuration.
     */
    constructor(object, domElement, world, physicsOptions) {
        var _a, _b, _c, _d;
        super(object, domElement);
        this.velocity = new three.Vector3();
        this._isGrounded = false;
        // Temporary vectors for calculations
        this._deltaVelocity = new three.Vector3();
        this._collisionPosition = new three.Vector3();
        // Create an octree from the world for collision detection.
        this._worldOctree = new Octree();
        this._worldOctree.fromGraphNode(world);
        // Create a capsule collider for the player.
        const objectSize = new three.Vector3();
        new three.Box3().setFromObject(this.object).getSize(objectSize);
        const radius = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.colliderRadius) || objectSize.y / 4;
        const height = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.colliderHeight) || objectSize.y;
        this._capsuleCollider = new ColliderCapsule(new three.Vector3(0, radius, 0), new three.Vector3(0, height - radius, 0), radius);
        this._capsuleCollider.translate(object.position);
        // Set physics properties
        this.step = (_a = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.step) !== null && _a !== void 0 ? _a : 5;
        this.gravity = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.gravity) !== null && _b !== void 0 ? _b : 30;
        this.maxFallSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.maxFallSpeed) !== null && _c !== void 0 ? _c : 20;
        this.movementResistance = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.movementResistance) !== null && _d !== void 0 ? _d : 4;
        // Set boundary properties if provided.
        this.boundary = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.boundary;
    }
    get isGrounded() {
        return this._isGrounded;
    }
    get collider() {
        return this._capsuleCollider;
    }
    /**
     * Checks for collisions between the player's collider and the world octree.
     * Updates the player's grounded state and adjusts velocity and position accordingly.
     */
    _checkCollisions() {
        this._isGrounded = false;
        const collisionResult = this._worldOctree.capsuleIntersect(this.collider);
        if (!collisionResult)
            return;
        if (collisionResult.normal.y > 0) {
            // Player is grounded.
            this._isGrounded = true;
        }
        // Adjust the collider position to resolve penetration.
        if (collisionResult.depth >= 1e-10) {
            this.collider.translate(collisionResult.normal.multiplyScalar(collisionResult.depth));
            const position = this.collider.getCenter(this._collisionPosition) +
                collisionResult.normal.multiplyScalar(-0.5 * collisionResult.depth);
            this.dispatchEvent(Object.assign(Object.assign({}, _collideEvent), { position: position, normal: collisionResult.normal }));
        }
    }
    /**
     * Resets the player's position if they are out of the defined world boundaries.
     */
    _teleportPlayerIfOutOfBounds() {
        if (!this.boundary)
            return;
        const { resetPoint, x, y, z } = this.boundary;
        const { x: px, y: py, z: pz } = this.object.position;
        // Check if the player is out of bounds.
        if (px < x.min || px > x.max || py < y.min || py > y.max || pz < z.min || pz > z.max) {
            this.collider.start.set(resetPoint.x, resetPoint.y + this.collider.radius, resetPoint.z);
            this.collider.end.set(resetPoint.x, resetPoint.y + this.collider.height - this.collider.radius, resetPoint.z);
            this.velocity.set(0, 0, 0);
        }
    }
    /**
     * Updates the player's physics state.
     * @param delta - The time step for the update (in seconds).
     */
    update(delta) {
        if (!this.enabled)
            return;
        super.update(delta);
        const stepDelta = delta / this.step;
        for (let i = 0; i < this.step; i++) {
            // Apply movement resistance (damping).
            let damping = Math.exp(-this.movementResistance * stepDelta) - 1; // Always negative
            if (!this._isGrounded) {
                this.velocity.y -= this.gravity * stepDelta;
                this.velocity.y = Math.max(this.velocity.y, -this.maxFallSpeed); // Limit fall speed
                damping *= 0.1; // Small air resistance
            }
            this.velocity.addScaledVector(this.velocity, damping);
            this._deltaVelocity.copy(this.velocity).multiplyScalar(stepDelta);
            this.collider.translate(this._deltaVelocity);
            this._checkCollisions();
            this._teleportPlayerIfOutOfBounds();
        }
        // Update the object's position to match the collider.
        this.object.position.copy(this.collider.start);
        this.object.position.y -= this.collider.radius;
    }
    connect() {
        super.connect();
    }
    disconnect() {
        super.disconnect();
    }
    dispose() {
        super.dispose();
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$4 = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    turnUp: false,
    turnDown: false,
    turnLeft: false,
    turnRight: false,
    jump: false,
};
/**
 * FirstPersonKeyboardControls class allows controlling a 3D object using the keyboard,
 */
class FirstPersonKeyboardControls extends PhysicsControls {
    /**
     * Constructs a new FirstPersonKeyboardControls  instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners (optional).
     * @param worldObject - The world object used for physics collision.
     * @param actionKeys - Key mappings for actions.
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor(object, domElement, worldObject, actionKeys, physicsOptions) {
        var _a, _b, _c, _d, _e;
        super(object, domElement, worldObject, Object.assign({ colliderHeight: 1.6, colliderRadius: 0.5 }, physicsOptions));
        // Temporary vectors for calculations
        this._objectWorldDirection = new three.Vector3();
        this._worldYDirection = new three.Vector3(0, 1, 0);
        // Set key mappings.
        this.actionKeys = actionKeys;
        // Set physics parameters with defaults if not provided.
        this.eyeHeight = (_a = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.eyeHeight) !== null && _a !== void 0 ? _a : 1.5;
        this.jumpForce = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _b !== void 0 ? _b : 15;
        this.groundMoveSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _c !== void 0 ? _c : 25;
        this.floatMoveSpeed = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _d !== void 0 ? _d : 8;
        this.rotateSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _e !== void 0 ? _e : 1;
        // Bind key event handlers.
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        // Connect controls to key events.
        this.connect();
    }
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    getForwardVector() {
        this.object.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        return this._objectWorldDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    getSideVector() {
        this.object.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        this._objectWorldDirection.cross(this.object.up);
        return this._objectWorldDirection;
    }
    /**
     * Updates movement and rotation based on the current keyboard input.
     * @param delta - The time delta for frame-independent movement.
     */
    updateControls(delta) {
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Move
        if (keyStates$4.forward) {
            this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
        }
        if (keyStates$4.backward) {
            this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
        }
        if (keyStates$4.leftward) {
            this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta));
        }
        if (keyStates$4.rightward) {
            this.velocity.add(this.getSideVector().multiplyScalar(speedDelta));
        }
        // Turn
        if (keyStates$4.turnLeft) {
            this.object.rotateOnWorldAxis(this._worldYDirection, this.rotateSpeed * delta);
        }
        if (keyStates$4.turnRight) {
            this.object.rotateOnWorldAxis(this._worldYDirection, -this.rotateSpeed * delta);
        }
        if (keyStates$4.turnUp && this.object.rotation.x < Math.PI / 2 - 0.01) {
            this.object.rotateX(this.rotateSpeed * delta);
        }
        if (keyStates$4.turnDown && this.object.rotation.x > -Math.PI / 2 + 0.01) {
            this.object.rotateX(-this.rotateSpeed * delta);
        }
        // Jump if grounded.
        if (keyStates$4.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
    }
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - The time delta for consistent updates.
     */
    update(delta) {
        super.update(delta);
        this.object.position.y += this.eyeHeight;
        this.updateControls(delta);
    }
    /**
     * Connects the keyboard controls by adding event listeners.
     */
    connect() {
        super.connect();
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
    }
    /**
     * Disconnects the keyboard controls by removing event listeners.
     */
    disconnect() {
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }
    /**
     * Disposes of the keyboard controls, cleaning up event listeners and animations.
     */
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /**
     * Handles keydown events, updating the key state.
     * @param event - The keyboard event.
     */
    onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.key)) {
                keyStates$4[action] = true;
            }
        }
    }
    /**
     * Handles keyup events, updating the key state.
     * @param event - The keyboard event.
     */
    onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.key)) {
                keyStates$4[action] = false;
            }
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$3 = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    jump: false,
};
/**
 * FirstPersonPointerLockControls class allows controlling a 3D object using the Pointer Lock API and mouse input.
 */
class FirstPersonPointerLockControls extends PhysicsControls {
    /**
     * Constructs a new FirstPersonPointerLockControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners.
     * @param worldObject - The world object used for physics collision.
     * @param actionKeys - Key mappings for actions.
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor(object, domElement, worldObject, actionKeys, physicsOptions) {
        var _a, _b, _c, _d, _e;
        super(object, domElement, worldObject, Object.assign({ colliderHeight: 1.6, colliderRadius: 0.5 }, physicsOptions));
        // Temporary vectors for calculations
        this._objectWorldDirection = new three.Vector3();
        this.actionKeys = actionKeys;
        // Set physics parameters with defaults if not provided.
        this.eyeHeight = (_a = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.eyeHeight) !== null && _a !== void 0 ? _a : 1.5;
        this.jumpForce = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _b !== void 0 ? _b : 15;
        this.groundMoveSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _c !== void 0 ? _c : 25;
        this.floatMoveSpeed = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _d !== void 0 ? _d : 8;
        this.rotateSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _e !== void 0 ? _e : 0.002;
        // Bind key event handlers.
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        // Bind event handlers.
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        // Connect controls to pointer lock events.
        this.connect();
    }
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    getForwardVector() {
        this.object.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        return this._objectWorldDirection;
    }
    /**
     * Gets the side (right) direction vector based on the object's orientation.
     * @returns Normalized side vector.
     */
    getSideVector() {
        this.object.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        this._objectWorldDirection.cross(this.object.up);
        return this._objectWorldDirection;
    }
    /**
     * Updates movement based on physics and camera rotation.
     * @param delta - The time delta for frame-independent movement.
     */
    updateControls(delta) {
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Move forward.
        if (keyStates$3.forward) {
            this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
        }
        // Move backward.
        if (keyStates$3.backward) {
            this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
        }
        // Move leftward.
        if (keyStates$3.leftward) {
            this.velocity.add(this.getSideVector().multiplyScalar(-speedDelta));
        }
        // Move rightward.
        if (keyStates$3.rightward) {
            this.velocity.add(this.getSideVector().multiplyScalar(speedDelta));
        }
        // Jump if grounded.
        if (keyStates$3.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
    }
    /**
     * Main update function that integrates controls, physics, and camera.
     * @param delta - The time delta for consistent updates.
     */
    update(delta) {
        super.update(delta);
        this.object.position.y += this.eyeHeight;
        this.updateControls(delta);
    }
    /**
     * Connects the pointer lock controls by adding event listeners.
     */
    connect() {
        var _a;
        super.connect();
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('click', this.onMouseDownHandler);
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
        document.addEventListener('mousemove', this.onMouseMoveHandler);
    }
    /**
     * Disconnects the pointer lock controls by removing event listeners.
     */
    disconnect() {
        var _a;
        super.disconnect();
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('click', this.onMouseDownHandler);
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
        document.removeEventListener('mousemove', this.onMouseMoveHandler);
    }
    /**
     * Disposes of the pointer lock controls, cleaning up event listeners and animations.
     */
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    onKeyDown(event) {
        var _a, _b, _c, _d, _e;
        if ((_a = this.actionKeys.forward) === null || _a === void 0 ? void 0 : _a.some(key => event.key === key)) {
            keyStates$3.forward = true;
        }
        if ((_b = this.actionKeys.backward) === null || _b === void 0 ? void 0 : _b.some(key => event.key === key)) {
            keyStates$3.backward = true;
        }
        if ((_c = this.actionKeys.leftward) === null || _c === void 0 ? void 0 : _c.some(key => event.key === key)) {
            keyStates$3.leftward = true;
        }
        if ((_d = this.actionKeys.rightward) === null || _d === void 0 ? void 0 : _d.some(key => event.key === key)) {
            keyStates$3.rightward = true;
        }
        if ((_e = this.actionKeys.jump) === null || _e === void 0 ? void 0 : _e.some(key => event.key === key)) {
            keyStates$3.jump = true;
        }
    }
    /** Handles keyup events, updating the key state. */
    onKeyUp(event) {
        var _a, _b, _c, _d, _e;
        if ((_a = this.actionKeys.forward) === null || _a === void 0 ? void 0 : _a.some(key => event.key === key)) {
            keyStates$3.forward = false;
        }
        if ((_b = this.actionKeys.backward) === null || _b === void 0 ? void 0 : _b.some(key => event.key === key)) {
            keyStates$3.backward = false;
        }
        if ((_c = this.actionKeys.leftward) === null || _c === void 0 ? void 0 : _c.some(key => event.key === key)) {
            keyStates$3.leftward = false;
        }
        if ((_d = this.actionKeys.rightward) === null || _d === void 0 ? void 0 : _d.some(key => event.key === key)) {
            keyStates$3.rightward = false;
        }
        if ((_e = this.actionKeys.jump) === null || _e === void 0 ? void 0 : _e.some(key => event.key === key)) {
            keyStates$3.jump = false;
        }
    }
    /**
     * @param event - The mouse movement event.
     */
    /** Handles mousemove events to update camera angles with separate clamping for upward and downward movements. */
    onMouseMove(event) {
        if (document.pointerLockElement === this.domElement) {
            this.object.rotation.y -= event.movementX * this.rotateSpeed;
            this.object.rotation.x -= event.movementY * this.rotateSpeed;
            this.object.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.object.rotation.x));
        }
    }
    /**
     * Requests pointer lock on the DOM element.
     */
    onMouseDown() {
        var _a;
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.requestPointerLock();
    }
}

class PhysicsCharacterControls extends PhysicsControls {
    constructor(object, domElement, world, animationOptions = {}, physicsOptions = {}) {
        var _a, _b, _c;
        super(object, domElement, world, physicsOptions);
        this._animationClips = {};
        this._animationActions = {};
        this._localVelocity = new three.Vector3();
        this._worldQuaternion = new three.Quaternion();
        this._objectGroup = new three.AnimationObjectGroup(object);
        this._mixer = new three.AnimationMixer(this._objectGroup);
        if (animationOptions.animationClips) {
            Object.entries(animationOptions.animationClips).forEach(([key, clip]) => {
                this.setAnimationClip(key, clip);
            });
        }
        this.transitionTime = (_a = animationOptions.transitionTime) !== null && _a !== void 0 ? _a : 0.5;
        this.fallSpeedThreshold = (_b = animationOptions.fallSpeedThreshold) !== null && _b !== void 0 ? _b : 15;
        this.moveSpeedThreshold = (_c = animationOptions.moveSpeedThreshold) !== null && _c !== void 0 ? _c : 0.1;
    }
    /**
     * Returns a read-only copy of the animation clips.
     */
    get clips() {
        return Object.freeze(Object.assign({}, this._animationClips));
    }
    /**
     * Adds an object to the animation object group.
     * @param object - The Object3D to add.
     */
    addObject(object) {
        this._objectGroup.add(object);
    }
    /**
     * Removes an object from the animation object group.
     * @param object - The Object3D to remove.
     */
    removeObject(object) {
        this._objectGroup.remove(object);
    }
    /**
     * Adds an animation clip and its corresponding action.
     * @param key - The identifier for the animation clip.
     * @param clip - The AnimationClip to add.
     */
    setAnimationClip(key, clip) {
        const action = this._mixer.clipAction(clip);
        this._animationClips[key] = clip;
        this._animationActions[key] = action;
    }
    /**
     * Removes an animation clip and its corresponding action.
     * @param key - The identifier for the animation clip to remove.
     */
    removeAnimationClip(key) {
        const clip = this._animationClips[key];
        if (!clip)
            return;
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
    _fadeToAction(key, duration) {
        const action = this._animationActions[key];
        if (!action || action.isRunning())
            return;
        // Fade out all current actions
        Object.values(this._animationActions).forEach(currentAction => {
            currentAction.fadeOut(duration);
        });
        action.reset(); // Reset the action to start from the beginning
        action.fadeIn(duration);
        action.play(); // Play the action
    }
    /**
     * Updates the animation based on the current state of the player.
     */
    _updateAnimation() {
        const worldQuaternion = this.object.getWorldQuaternion(this._worldQuaternion);
        this._localVelocity.copy(this.velocity).applyQuaternion(worldQuaternion.invert());
        if (this.isGrounded && this._localVelocity.z > this.moveSpeedThreshold) {
            return this._fadeToAction('forward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.z < -this.moveSpeedThreshold) {
            return this._fadeToAction('backward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.x > this.moveSpeedThreshold) {
            return this._fadeToAction('leftward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.x < -this.moveSpeedThreshold) {
            return this._fadeToAction('rightward', this.transitionTime);
        }
        if (this.velocity.y > 0) {
            return this._fadeToAction('jump', this.transitionTime);
        }
        if (this.velocity.y < -this.fallSpeedThreshold) {
            return this._fadeToAction('fall', this.transitionTime);
        }
        if (this.isGrounded) {
            return this._fadeToAction('idle', this.transitionTime);
        }
    }
    /**
     * Updates the _mixer with the given delta time.
     * @param delta - The time increment in seconds.
     */
    update(delta) {
        super.update(delta);
        this._updateAnimation();
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

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$2 = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    jump: false,
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class ThirdPersonMouseDragControls extends PhysicsCharacterControls {
    /**
     * Constructs a new ThirdPersonMouseDragControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions = {}, physicsOptions = {}) {
        var _a, _b, _c, _d, _e, _f;
        super(object, domElement, worldObject, animationOptions, physicsOptions);
        this.cameraLerpFactor = 0;
        this._isMouseDown = false;
        // Temporary vectors for calculations
        this._objectWorldDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._cameraLookAtPosition = new three.Vector3();
        this._cameraLerpPosition = new three.Vector3();
        /** Handles mousedown events to set _isMouseDown flag. */
        this.onMouseDown = () => {
            this._isMouseDown = true;
        };
        /** Handles mouseup events to reset _isMouseDown flag. */
        this.onMouseUp = () => {
            this._isMouseDown = false;
        };
        /** Handles mousemove events to update camera angles when mouse is down. */
        this.onMouseMove = (event) => {
            if (!this._isMouseDown)
                return;
            this._spherical.theta -= (event.movementX * this.rotateSpeed) / 100;
            this._spherical.phi -= (event.movementY * this.rotateSpeed) / 100;
            // Clamp the camera angles to prevent flipping
            this._spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this._spherical.phi));
        };
        this.actionKeys = actionKeys;
        this.camera = camera;
        this._cameraPositionOffset = cameraOptions.posOffset;
        this._cameraLookAtOffset = cameraOptions.lookAtOffset;
        this._spherical = new three.Spherical();
        this.cameraLerpFactor = (_a = cameraOptions.cameraLerpFactor) !== null && _a !== void 0 ? _a : 0;
        this.updateCameraInfo();
        this.axisSync = (_b = cameraOptions.axisSync) !== null && _b !== void 0 ? _b : 'move';
        // Set physics options with default values
        this.jumpForce = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _c !== void 0 ? _c : 15;
        this.groundMoveSpeed = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _d !== void 0 ? _d : 25;
        this.floatMoveSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _e !== void 0 ? _e : 8;
        this.rotateSpeed = (_f = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _f !== void 0 ? _f : 1;
        // Bind key event handlers.
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.onMouseUpHandler = this.onMouseUp.bind(this);
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        // Connect event listeners
        this.connect();
    }
    get cameraPosOffset() {
        return this._cameraPositionOffset;
    }
    set cameraPosOffset(offset) {
        this._cameraPositionOffset = offset;
        this.updateCameraInfo();
    }
    get cameraLookAtOffset() {
        return this._cameraLookAtOffset;
    }
    set cameraLookAtOffset(offset) {
        this._cameraLookAtOffset = offset;
        this.updateCameraInfo();
    }
    /**
     * Updates the camera's spherical coordinates based on the current offsets.
     */
    updateCameraInfo() {
        const subVector = this._cameraPositionOffset.clone().sub(this._cameraLookAtOffset);
        this._spherical.setFromVector3(subVector);
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    getForwardVector() {
        this.camera.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        return this._objectWorldDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    getSideVector() {
        this.camera.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        this._objectWorldDirection.cross(this.object.up);
        return this._objectWorldDirection;
    }
    updateSync() {
        if (this.axisSync === 'always') {
            this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
            return;
        }
        if (this.axisSync === 'move' &&
            (keyStates$2.forward || keyStates$2.backward || keyStates$2.leftward || keyStates$2.rightward)) {
            this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
            return;
        }
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Reset movement vector
        const movement = this._accumulatedDirection.set(0, 0, 0);
        // Accumulate movement vectors based on key states
        if (keyStates$2.leftward) {
            movement.add(this.getSideVector().multiplyScalar(-1));
        }
        if (keyStates$2.rightward) {
            movement.add(this.getSideVector());
        }
        if (keyStates$2.backward) {
            movement.add(this.getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$2.forward) {
            movement.add(this.getForwardVector());
        }
        // Apply accumulated movement vector
        if (movement.lengthSq() > 1e-10) {
            movement.normalize();
            this.velocity.add(movement.multiplyScalar(speedDelta));
            this.object.lookAt(this.object.position.clone().add(movement));
        }
        // Jump if grounded.
        if (keyStates$2.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    updateCamera() {
        this.object.updateMatrixWorld();
        const targetVector = this._cameraLerpPosition.addVectors(this.object.position, this._cameraLookAtOffset);
        const lookAtPosition = this._cameraLookAtPosition;
        if (this.cameraLerpFactor > 0) {
            const distance = lookAtPosition.distanceTo(targetVector);
            lookAtPosition.lerp(targetVector, this.cameraLerpFactor * distance);
        }
        else {
            lookAtPosition.copy(targetVector);
        }
        this.camera.position.setFromSpherical(this._spherical).add(lookAtPosition);
        this.camera.lookAt(lookAtPosition);
    }
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - Time delta for consistent updates.
     */
    update(delta) {
        super.update(delta);
        this.updateCamera();
        this.updateSync();
        this.updateControls(delta);
    }
    /**
     * Connects the controls by adding event listeners.
     */
    connect() {
        var _a, _b;
        super.connect();
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', this.onMouseDownHandler);
        document.addEventListener('mouseup', this.onMouseUpHandler);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMoveHandler);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        var _a, _b;
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('mousedown', this.onMouseDownHandler);
        document.removeEventListener('mouseup', this.onMouseUpHandler);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMoveHandler);
    }
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    onKeyDown(event) {
        var _a, _b, _c, _d, _e;
        if ((_a = this.actionKeys.forward) === null || _a === void 0 ? void 0 : _a.some(key => event.key === key)) {
            keyStates$2.forward = true;
        }
        if ((_b = this.actionKeys.backward) === null || _b === void 0 ? void 0 : _b.some(key => event.key === key)) {
            keyStates$2.backward = true;
        }
        if ((_c = this.actionKeys.leftward) === null || _c === void 0 ? void 0 : _c.some(key => event.key === key)) {
            keyStates$2.leftward = true;
        }
        if ((_d = this.actionKeys.rightward) === null || _d === void 0 ? void 0 : _d.some(key => event.key === key)) {
            keyStates$2.rightward = true;
        }
        if ((_e = this.actionKeys.jump) === null || _e === void 0 ? void 0 : _e.some(key => event.key === key)) {
            keyStates$2.jump = true;
        }
    }
    /** Handles keyup events, updating the key state. */
    onKeyUp(event) {
        var _a, _b, _c, _d, _e;
        if ((_a = this.actionKeys.forward) === null || _a === void 0 ? void 0 : _a.some(key => event.key === key)) {
            keyStates$2.forward = false;
        }
        if ((_b = this.actionKeys.backward) === null || _b === void 0 ? void 0 : _b.some(key => event.key === key)) {
            keyStates$2.backward = false;
        }
        if ((_c = this.actionKeys.leftward) === null || _c === void 0 ? void 0 : _c.some(key => event.key === key)) {
            keyStates$2.leftward = false;
        }
        if ((_d = this.actionKeys.rightward) === null || _d === void 0 ? void 0 : _d.some(key => event.key === key)) {
            keyStates$2.rightward = false;
        }
        if ((_e = this.actionKeys.jump) === null || _e === void 0 ? void 0 : _e.some(key => event.key === key)) {
            keyStates$2.jump = false;
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$1 = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    jump: false,
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class ThirdPersonPointerLockControls extends PhysicsCharacterControls {
    /**
     * Constructs a new ThirdPersonMouseDragControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions = {}, physicsOptions = {}) {
        var _a, _b, _c, _d, _e;
        super(object, domElement, worldObject, animationOptions, physicsOptions);
        this._isMouseDown = false;
        // Temporary vectors for calculations
        this._objectWorldDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._cameraLookAtPosition = new three.Vector3();
        /** Handles mousedown events to lock pointer. */
        this.onMouseDown = () => {
            var _a;
            (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.requestPointerLock();
        };
        /** Handles mousemove events to update camera angles when pointer is locked. */
        this.onMouseMove = (event) => {
            if (document.pointerLockElement !== this.domElement)
                return;
            this._spherical.theta -= (event.movementX * this.rotateSpeed) / 100;
            this._spherical.phi -= (event.movementY * this.rotateSpeed) / 100;
            // Clamp the camera angles to prevent flipping
            this._spherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this._spherical.phi));
        };
        this.actionKeys = actionKeys;
        this.camera = camera;
        this._cameraPositionOffset = cameraOptions.posOffset;
        this._cameraLookAtOffset = cameraOptions.lookAtOffset;
        this._spherical = new three.Spherical();
        this.updateCameraInfo();
        this.axisSync = (_a = cameraOptions.axisSync) !== null && _a !== void 0 ? _a : 'move';
        // Set physics options with default values
        this.jumpForce = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _b !== void 0 ? _b : 15;
        this.groundMoveSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _c !== void 0 ? _c : 25;
        this.floatMoveSpeed = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _d !== void 0 ? _d : 8;
        this.rotateSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _e !== void 0 ? _e : 1;
        // Bind key event handlers.
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        // Connect event listeners
        this.connect();
    }
    get cameraPosOffset() {
        return this._cameraPositionOffset;
    }
    set cameraPosOffset(offset) {
        this._cameraPositionOffset = offset;
        this.updateCameraInfo();
    }
    get cameraLookAtOffset() {
        return this._cameraLookAtOffset;
    }
    set cameraLookAtOffset(offset) {
        this._cameraLookAtOffset = offset;
        this.updateCameraInfo();
    }
    /**
     * Updates the camera's spherical coordinates based on the current offsets.
     */
    updateCameraInfo() {
        const subVector = this._cameraPositionOffset.clone().sub(this._cameraLookAtOffset);
        this._spherical.setFromVector3(subVector);
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    getForwardVector() {
        this.camera.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        return this._objectWorldDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    getSideVector() {
        this.camera.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        this._objectWorldDirection.cross(this.object.up);
        return this._objectWorldDirection;
    }
    updateSync() {
        if (this.axisSync === 'always') {
            this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
            return;
        }
        if (this.axisSync === 'move' &&
            (keyStates$1.forward || keyStates$1.backward || keyStates$1.leftward || keyStates$1.rightward)) {
            this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
            return;
        }
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Reset movement vector
        const movement = this._accumulatedDirection.set(0, 0, 0);
        // Accumulate movement vectors based on key states
        if (keyStates$1.leftward) {
            movement.add(this.getSideVector().multiplyScalar(-1));
        }
        if (keyStates$1.rightward) {
            movement.add(this.getSideVector());
        }
        if (keyStates$1.backward) {
            movement.add(this.getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$1.forward) {
            movement.add(this.getForwardVector());
        }
        // Apply accumulated movement vector
        if (movement.lengthSq() > 1e-10) {
            movement.normalize();
            this.velocity.add(movement.multiplyScalar(speedDelta));
            this.object.lookAt(this.object.position.clone().add(movement));
        }
        // Jump if grounded.
        if (keyStates$1.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    updateCamera() {
        this.object.updateMatrixWorld();
        const lookAtPosition = this._cameraLookAtPosition.copy(this.object.position).add(this._cameraLookAtOffset);
        this.camera.position.setFromSpherical(this._spherical).add(lookAtPosition);
        this.camera.lookAt(lookAtPosition);
    }
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - Time delta for consistent updates.
     */
    update(delta) {
        super.update(delta);
        this.updateCamera();
        this.updateSync();
        this.updateControls(delta);
    }
    /**
     * Connects the controls by adding event listeners.
     */
    connect() {
        var _a, _b;
        super.connect();
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', this.onMouseDownHandler);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMoveHandler);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        var _a, _b;
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('mousedown', this.onMouseDownHandler);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMoveHandler);
    }
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    onKeyDown(event) {
        var _a, _b, _c, _d, _e;
        if ((_a = this.actionKeys.forward) === null || _a === void 0 ? void 0 : _a.some(key => event.key === key)) {
            keyStates$1.forward = true;
        }
        if ((_b = this.actionKeys.backward) === null || _b === void 0 ? void 0 : _b.some(key => event.key === key)) {
            keyStates$1.backward = true;
        }
        if ((_c = this.actionKeys.leftward) === null || _c === void 0 ? void 0 : _c.some(key => event.key === key)) {
            keyStates$1.leftward = true;
        }
        if ((_d = this.actionKeys.rightward) === null || _d === void 0 ? void 0 : _d.some(key => event.key === key)) {
            keyStates$1.rightward = true;
        }
        if ((_e = this.actionKeys.jump) === null || _e === void 0 ? void 0 : _e.some(key => event.key === key)) {
            keyStates$1.jump = true;
        }
    }
    /** Handles keyup events, updating the key state. */
    onKeyUp(event) {
        var _a, _b, _c, _d, _e;
        if ((_a = this.actionKeys.forward) === null || _a === void 0 ? void 0 : _a.some(key => event.key === key)) {
            keyStates$1.forward = false;
        }
        if ((_b = this.actionKeys.backward) === null || _b === void 0 ? void 0 : _b.some(key => event.key === key)) {
            keyStates$1.backward = false;
        }
        if ((_c = this.actionKeys.leftward) === null || _c === void 0 ? void 0 : _c.some(key => event.key === key)) {
            keyStates$1.leftward = false;
        }
        if ((_d = this.actionKeys.rightward) === null || _d === void 0 ? void 0 : _d.some(key => event.key === key)) {
            keyStates$1.rightward = false;
        }
        if ((_e = this.actionKeys.jump) === null || _e === void 0 ? void 0 : _e.some(key => event.key === key)) {
            keyStates$1.jump = false;
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates = {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    jump: false,
    cameraUp: false,
    cameraDown: false,
    cameraLeft: false,
    cameraRight: false,
};
/**
 * Controls class that allows movement with the keyboard and rotation with the camera.
 */
class ThirdPersonKeyboardControls extends PhysicsCharacterControls {
    /**
     * Constructs a new ThirdPersonKeyboardControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param camera - The camera to control.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions = {}, physicsOptions = {}) {
        var _a, _b, _c, _d, _e;
        super(object, domElement, worldObject, animationOptions, physicsOptions);
        this._objectWorldDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._cameraLookAtPosition = new three.Vector3();
        this.actionKeys = actionKeys;
        this.camera = camera;
        this._cameraPositionOffset = cameraOptions.posOffset;
        this._cameraLookAtOffset = cameraOptions.lookAtOffset;
        this._spherical = new three.Spherical();
        this.updateCameraInfo();
        this.axisSync = (_a = cameraOptions.axisSync) !== null && _a !== void 0 ? _a : 'move';
        this.jumpForce = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _b !== void 0 ? _b : 15;
        this.groundMoveSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _c !== void 0 ? _c : 25;
        this.floatMoveSpeed = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _d !== void 0 ? _d : 8;
        this.rotateSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _e !== void 0 ? _e : 1;
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        this.connect();
    }
    get cameraPosOffset() {
        return this._cameraPositionOffset;
    }
    set cameraPosOffset(offset) {
        this._cameraPositionOffset = offset;
        this.updateCameraInfo();
    }
    get cameraLookAtOffset() {
        return this._cameraLookAtOffset;
    }
    set cameraLookAtOffset(offset) {
        this._cameraLookAtOffset = offset;
        this.updateCameraInfo();
    }
    /**
     * Updates the camera's spherical coordinates based on the current offsets.
     */
    updateCameraInfo() {
        const subVector = this._cameraPositionOffset.clone().sub(this._cameraLookAtOffset);
        this._spherical.setFromVector3(subVector);
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    getForwardVector() {
        // Returns the forward direction vector relative to the camera.
        this.camera.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        return this._objectWorldDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    getSideVector() {
        // Returns the side (right) direction vector relative to the camera.
        this.camera.getWorldDirection(this._objectWorldDirection);
        this._objectWorldDirection.y = 0;
        this._objectWorldDirection.normalize();
        this._objectWorldDirection.cross(this.object.up);
        return this._objectWorldDirection;
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Reset movement vector
        const movement = this._accumulatedDirection.set(0, 0, 0);
        // Accumulate movement vectors based on key states
        if (keyStates.leftward) {
            movement.add(this.getSideVector().multiplyScalar(-1));
        }
        if (keyStates.rightward) {
            movement.add(this.getSideVector());
        }
        if (keyStates.backward) {
            movement.add(this.getForwardVector().multiplyScalar(-1));
        }
        if (keyStates.forward) {
            movement.add(this.getForwardVector());
        }
        // Apply accumulated movement vector
        if (movement.lengthSq() > 1e-10) {
            movement.normalize();
            this.velocity.add(movement.multiplyScalar(speedDelta));
            this.object.lookAt(this.object.position.clone().add(movement));
        }
        // Jump if grounded.
        if (keyStates.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and keyboard input.
     */
    updateCamera(delta) {
        const rotationSpeed = this.rotateSpeed * delta;
        if (keyStates.cameraLeft) {
            this._spherical.theta += rotationSpeed;
        }
        if (keyStates.cameraRight) {
            this._spherical.theta -= rotationSpeed;
        }
        if (keyStates.cameraUp) {
            this._spherical.phi = Math.max(0.01, this._spherical.phi - rotationSpeed);
        }
        if (keyStates.cameraDown) {
            this._spherical.phi = Math.min(Math.PI - 0.01, this._spherical.phi + rotationSpeed);
        }
        this.object.updateMatrixWorld();
        const lookAtPosition = this._cameraLookAtPosition.copy(this.object.position).add(this._cameraLookAtOffset);
        this.camera.position.setFromSpherical(this._spherical).add(lookAtPosition);
        this.camera.lookAt(lookAtPosition);
    }
    updateSync() {
        if (this.axisSync === 'always') {
            this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
            return;
        }
        if (this.axisSync === 'move' &&
            (keyStates.forward || keyStates.backward || keyStates.leftward || keyStates.rightward)) {
            this.object.lookAt(this.object.position.clone().add(this.getForwardVector()));
            return;
        }
    }
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - Time delta for consistent updates.
     */
    update(delta) {
        super.update(delta);
        this.updateCamera(delta);
        this.updateSync();
        this.updateControls(delta);
    }
    /** Handles keydown events, updating the key state. */
    onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.key)) {
                keyStates[action] = true;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.key)) {
                keyStates[action] = false;
            }
        }
    }
    /**
     * Connects the controls by adding event listeners.
     */
    connect() {
        super.connect();
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }
    dispose() {
        this.disconnect();
        super.dispose();
    }
}

/**
 * Helper class for visualizing the PhysicsControls' collider and boundaries.
 */
class PhysicsControlsHelper extends three.Group {
    /**
     * Constructs a new PhysicsControlsHelper.
     * @param controls - The PhysicsControls instance to visualize.
     * @param color - The color for the helper visualization.
     */
    constructor(controls, color = 0xffffff) {
        super();
        this.type = 'PhysicsControlsHelper';
        this._capsulePosition = new three.Vector3();
        this.controls = controls;
        // Create capsule geometry to visualize the collider.
        const capsuleGeometry = new three.CapsuleGeometry(controls.collider.radius, controls.collider.height - 2 * controls.collider.radius);
        this.capsuleHelper = new three.LineSegments(capsuleGeometry, new three.LineBasicMaterial({ color: color, toneMapped: false }));
        this.capsuleHelper.frustumCulled = false;
        this.add(this.capsuleHelper);
        // Create box geometry to visualize the boundary if it is set.
        if (controls.boundary) {
            const width = controls.boundary.x.max - controls.boundary.x.min;
            const height = controls.boundary.y.max - controls.boundary.y.min;
            const depth = controls.boundary.z.max - controls.boundary.z.min;
            const boxGeometry = new three.BoxGeometry(width, height, depth, width, height, depth);
            this.boundaryHelper = new three.LineSegments(boxGeometry, new three.LineBasicMaterial({ color: color, toneMapped: false }));
            this.boundaryHelper.position.set(controls.boundary.x.min + width / 2, controls.boundary.y.min + height / 2, controls.boundary.z.min + depth / 2);
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

exports.FirstPersonKeyboardControls = FirstPersonKeyboardControls;
exports.FirstPersonPointerLockControls = FirstPersonPointerLockControls;
exports.PhysicsControlsHelper = PhysicsControlsHelper;
exports.ThirdPersonKeyboardControls = ThirdPersonKeyboardControls;
exports.ThirdPersonMouseDragControls = ThirdPersonMouseDragControls;
exports.ThirdPersonPointerLockControls = ThirdPersonPointerLockControls;
