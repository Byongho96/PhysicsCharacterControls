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
        var _a, _b, _c, _d, _e;
        super(object, domElement);
        this._ray = new three.Ray(new three.Vector3(), new three.Vector3(0, -1, 0));
        this.velocity = new three.Vector3();
        this._isGrounded = false;
        this._isLanding = false;
        // Temporary vectors for calculations
        this._deltaVelocity = new three.Vector3();
        // Create an octree from the world for collision detection.
        this._worldOctree = new Octree();
        this._worldOctree.fromGraphNode(world);
        // Create a capsule collider for the player.
        const objectSize = new three.Vector3();
        new three.Box3().setFromObject(this.object).getSize(objectSize);
        const radius = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.colliderRadius) || objectSize.y / 4;
        const height = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.colliderHeight) || objectSize.y;
        this._capsuleCollider = new Capsule(new three.Vector3(0, radius, 0), new three.Vector3(0, height - radius, 0), radius);
        this._capsuleCollider.translate(object.position);
        // Set physics properties
        this.step = (_a = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.step) !== null && _a !== void 0 ? _a : 5;
        this.gravity = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.gravity) !== null && _b !== void 0 ? _b : 30;
        this.maxFallSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.maxFallSpeed) !== null && _c !== void 0 ? _c : 20;
        this.movementResistance = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.movementResistance) !== null && _d !== void 0 ? _d : 6;
        this.landTimeThreshold = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.landTimeThreshold) !== null && _e !== void 0 ? _e : 250;
        // Set boundary properties if provided.
        this.boundary = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.boundary;
    }
    get isGrounded() {
        return this._isGrounded;
    }
    get isLanding() {
        return this._isLanding;
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
            this.dispatchEvent(Object.assign(Object.assign({}, _collideEvent), { normal: collisionResult.normal.normalize() }));
        }
    }
    _checkLanding() {
        this._isLanding = false;
        if (this._isGrounded || this.velocity.y >= 0)
            return;
        this._ray.origin.copy(this._capsuleCollider.start).y -= this._capsuleCollider.radius;
        const rayResult = this._worldOctree.rayIntersect(this._ray);
        if (rayResult.distance / -this._deltaVelocity.y < this.landTimeThreshold) {
            this._isLanding = true;
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
            this.collider.end.set(resetPoint.x, resetPoint.y + this.collider.start.distanceTo(this.collider.end) + this.collider.radius, resetPoint.z);
            this.collider.start.set(resetPoint.x, resetPoint.y + this.collider.radius, resetPoint.z);
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
            this._checkLanding();
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
const keyStates$5 = {
    forward: 0,
    backward: 0,
    leftward: 0,
    rightward: 0,
    turnUp: 0,
    turnDown: 0,
    turnLeft: 0,
    turnRight: 0,
    jump: 0,
    accelerate: 0,
};
const DEFAULT_ACTION_KEYS$5 = {
    forward: ['KeyW'],
    backward: ['KeyS'],
    leftward: ['KeyA'],
    rightward: ['KeyD'],
    jump: ['Space'],
    turnUp: ['ArrowUp'],
    turnDown: ['ArrowDown'],
    turnLeft: ['ArrowLeft'],
    turnRight: ['ArrowRight'],
    accelerate: ['ShiftLeft'],
};
/**
 * FirstPersonKeyboardControls class allows controlling a 3D object using the keyboard,
 */
class FirstPersonKeyboardControls extends PhysicsControls {
    constructor({ object, domElement, worldObject, actionKeys, cameraOptions, physicsOptions, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super(object, domElement, worldObject, Object.assign({ colliderHeight: 1.6, colliderRadius: 0.5 }, physicsOptions));
        this._keyCount = 0;
        // Temporary vectors for calculations
        this._objectLocalDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._worldYDirection = new three.Vector3(0, 1, 0);
        this._onMouseWheel = (event) => {
            if (!this.enableZoom)
                return;
            if (!(this.object instanceof three.PerspectiveCamera) && !(this.object instanceof three.OrthographicCamera)) {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                this.enableZoom = false;
                return;
            }
            const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));
            if (event.deltaY > 0)
                this.object.zoom *= normalizedDelta;
            else if (event.deltaY < 0)
                this.object.zoom /= normalizedDelta;
            this.object.updateProjectionMatrix();
        };
        this.object.rotation.order = 'YZX';
        this.actionKeys = actionKeys !== null && actionKeys !== void 0 ? actionKeys : DEFAULT_ACTION_KEYS$5;
        this.enableZoom = (_a = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.enableZoom) !== null && _a !== void 0 ? _a : true;
        this.zoomSpeed = (_b = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.zoomSpeed) !== null && _b !== void 0 ? _b : 1;
        // Set physics parameters with defaults if not provided.
        this.eyeHeight = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.eyeHeight) !== null && _c !== void 0 ? _c : 1.5;
        this.jumpForce = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _d !== void 0 ? _d : 15;
        this.groundMoveSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _e !== void 0 ? _e : 30;
        this.floatMoveSpeed = (_f = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _f !== void 0 ? _f : 8;
        this.rotateSpeed = (_g = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _g !== void 0 ? _g : 1;
        this.enableDiagonalMovement = (_h = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableDiagonalMovement) !== null && _h !== void 0 ? _h : true;
        this.enableAcceleration = (_j = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableAcceleration) !== null && _j !== void 0 ? _j : true;
        this.accelerationFactor = (_k = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.accelerationFactor) !== null && _k !== void 0 ? _k : 1.5;
        // Bind key event handlers.
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseWheel = this._onMouseWheel.bind(this);
        // Connect controls to key events.
        this.connect();
    }
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    _getForwardVector() {
        this.object.getWorldDirection(this._objectLocalDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        return this._objectLocalDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    _getSideVector() {
        this.object.getWorldDirection(this._objectLocalDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        this._objectLocalDirection.cross(this.object.up);
        return this._objectLocalDirection;
    }
    _accumulateDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        if (keyStates$5.forward) {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        if (keyStates$5.backward) {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$5.leftward) {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        if (keyStates$5.rightward) {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection.normalize();
    }
    _getMostRecentDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        let lastAction = null;
        let lastCount = 0;
        Object.entries(keyStates$5).forEach(([key, value]) => {
            if (value > lastCount) {
                lastAction = key;
                lastCount = value;
            }
        });
        if (lastAction === 'forward') {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        else if (lastAction === 'backward') {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        else if (lastAction === 'leftward') {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        else if (lastAction === 'rightward') {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection;
    }
    /**
     * Updates movement and rotation based on the current keyboard input.
     * @param delta - The time delta for frame-independent movement.
     */
    updateControls(delta) {
        let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if (this.enableAcceleration && keyStates$5.accelerate)
            speedDelta *= this.accelerationFactor;
        // Move
        let movement;
        if (this.enableDiagonalMovement)
            movement = this._accumulateDirection();
        else
            movement = this._getMostRecentDirection();
        this.velocity.add(movement.multiplyScalar(speedDelta));
        // Turn
        if (keyStates$5.turnLeft) {
            this.object.rotateOnWorldAxis(this._worldYDirection, this.rotateSpeed * delta);
        }
        if (keyStates$5.turnRight) {
            this.object.rotateOnWorldAxis(this._worldYDirection, -this.rotateSpeed * delta);
        }
        if (keyStates$5.turnUp) {
            this.object.rotateX(this.rotateSpeed * delta);
        }
        if (keyStates$5.turnDown) {
            this.object.rotateX(-this.rotateSpeed * delta);
        }
        this.object.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.object.rotation.x));
        // Jump if grounded.
        if (keyStates$5.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
        this.object.updateMatrixWorld();
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
        var _a;
        super.connect();
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disconnects the keyboard controls by removing event listeners.
     */
    disconnect() {
        var _a;
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disposes of the keyboard controls, cleaning up event listeners and animations.
     */
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    _onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$5[action] = ++this._keyCount;
                break;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    _onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$5[action] = 0;
                break;
            }
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$4 = {
    forward: 0,
    backward: 0,
    leftward: 0,
    rightward: 0,
    jump: 0,
    accelerate: 0,
};
const DEFAULT_ACTION_KEYS$4 = {
    forward: ['KeyW', 'ArrowUp'],
    backward: ['KeyS', 'ArrowDown'],
    leftward: ['KeyA', 'ArrowLeft'],
    rightward: ['KeyD', 'ArrowRight'],
    jump: ['Space'],
    accelerate: ['ShiftLeft'],
};
/**
 * FirstPersonMouseDragControls class allows controlling a 3D object using the mouse drag,
 */
class FirstPersonMouseDragControls extends PhysicsControls {
    /**
     * Constructs a new FirstPersonMouseDragControls  instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners (optional).
     * @param worldObject - The world object used for physics collision.
     * @param actionKeys - Key mappings for actions.
     * @param cameraOptions - Configuration for the camera (optional).
     * @param animationOptions - Configuration for animations (optional).
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor({ object, domElement, worldObject, actionKeys, cameraOptions, physicsOptions, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super(object, domElement, worldObject, Object.assign({ colliderHeight: 1.6, colliderRadius: 0.5 }, physicsOptions));
        this._keyCount = 0;
        // Temporary vectors for calculations
        this._isMouseDown = false;
        this._objectLocalDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._worldYDirection = new three.Vector3(0, 1, 0);
        /** Handles mousedown events to set _isMouseDown flag. */
        this._onMouseDown = () => {
            this._isMouseDown = true;
        };
        /** Handles mouseup events to reset _isMouseDown flag. */
        this._onMouseUp = () => {
            this._isMouseDown = false;
        };
        /** Handles mousemove events to update camera angles when mouse is down. */
        this._onMouseMove = (event) => {
            if (!this._isMouseDown)
                return;
            this.object.rotateOnWorldAxis(this._worldYDirection, (-1 * event.movementX * this.rotateSpeed) / 100);
            this.object.rotateX((-1 * event.movementY * this.rotateSpeed) / 100);
            this.object.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.object.rotation.x));
        };
        this._onMouseWheel = (event) => {
            if (!this.enableZoom)
                return;
            if (!(this.object instanceof three.PerspectiveCamera) && !(this.object instanceof three.OrthographicCamera)) {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                this.enableZoom = false;
                return;
            }
            const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));
            if (event.deltaY > 0)
                this.object.zoom *= normalizedDelta;
            else if (event.deltaY < 0)
                this.object.zoom /= normalizedDelta;
            this.object.updateProjectionMatrix();
        };
        this.object.rotation.order = 'YZX';
        this.actionKeys = actionKeys !== null && actionKeys !== void 0 ? actionKeys : DEFAULT_ACTION_KEYS$4;
        this.enableZoom = (_a = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.enableZoom) !== null && _a !== void 0 ? _a : true;
        this.zoomSpeed = (_b = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.zoomSpeed) !== null && _b !== void 0 ? _b : 1;
        // Set physics parameters with defaults if not provided.
        this.eyeHeight = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.eyeHeight) !== null && _c !== void 0 ? _c : 1.5;
        this.jumpForce = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _d !== void 0 ? _d : 15;
        this.groundMoveSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _e !== void 0 ? _e : 30;
        this.floatMoveSpeed = (_f = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _f !== void 0 ? _f : 8;
        this.rotateSpeed = (_g = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _g !== void 0 ? _g : 0.5;
        this.enableDiagonalMovement = (_h = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableDiagonalMovement) !== null && _h !== void 0 ? _h : true;
        this.enableAcceleration = (_j = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableAcceleration) !== null && _j !== void 0 ? _j : true;
        this.accelerationFactor = (_k = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.accelerationFactor) !== null && _k !== void 0 ? _k : 1.5;
        // Bind key event handlers.
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseDown = this._onMouseDown.bind(this);
        this.onMouseUp = this._onMouseUp.bind(this);
        this.onMouseMove = this._onMouseMove.bind(this);
        this.onMouseWheel = this._onMouseWheel.bind(this);
        // Connect controls to key events.
        this.connect();
    }
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    _getForwardVector() {
        this.object.getWorldDirection(this._objectLocalDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        return this._objectLocalDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    _getSideVector() {
        this.object.getWorldDirection(this._objectLocalDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        this._objectLocalDirection.cross(this.object.up);
        return this._objectLocalDirection;
    }
    _accumulateDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        if (keyStates$4.forward) {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        if (keyStates$4.backward) {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$4.leftward) {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        if (keyStates$4.rightward) {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection.normalize();
    }
    _getMostRecentDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        let lastAction = null;
        let lastCount = 0;
        Object.entries(keyStates$4).forEach(([key, value]) => {
            if (value > lastCount) {
                lastAction = key;
                lastCount = value;
            }
        });
        if (lastAction === 'forward') {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        else if (lastAction === 'backward') {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        else if (lastAction === 'leftward') {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        else if (lastAction === 'rightward') {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection;
    }
    /**
     * Updates movement based on physics and camera rotation.
     * @param delta - The time delta for frame-independent movement.
     */
    updateControls(delta) {
        let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if (this.enableAcceleration && keyStates$4.accelerate)
            speedDelta *= this.accelerationFactor;
        // Move
        let movement;
        if (this.enableDiagonalMovement)
            movement = this._accumulateDirection();
        else
            movement = this._getMostRecentDirection();
        this.velocity.add(movement.multiplyScalar(speedDelta));
        // Jump if grounded.
        if (keyStates$4.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
        this.object.updateMatrixWorld();
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
        var _a, _b, _c;
        super.connect();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.removeEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disconnects the keyboard controls by removing event listeners.
     */
    disconnect() {
        var _a, _b, _c;
        super.disconnect();
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.removeEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disposes of the keyboard controls, cleaning up event listeners and animations.
     */
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    _onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$4[action] = ++this._keyCount;
                break;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    _onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$4[action] = 0;
                break;
            }
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$3 = {
    forward: 0,
    backward: 0,
    leftward: 0,
    rightward: 0,
    jump: 0,
    accelerate: 0,
};
const DEFAULT_ACTION_KEYS$3 = {
    forward: ['KeyW', 'ArrowUp'],
    backward: ['KeyS', 'ArrowDown'],
    leftward: ['KeyA', 'ArrowLeft'],
    rightward: ['KeyD', 'ArrowRight'],
    jump: ['Space'],
    accelerate: ['ShiftLeft'],
};
/**
 * FirstPersonPointerLockControls class allows controlling a 3D object using the Pointer Lock API and mouse input.
 */
class FirstPersonPointerLockControls extends PhysicsControls {
    constructor({ object, domElement, worldObject, actionKeys, cameraOptions, physicsOptions, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        super(object, domElement, worldObject, Object.assign({ colliderHeight: 1.6, colliderRadius: 0.5 }, physicsOptions));
        this._keyCount = 0;
        // Temporary vectors for calculations
        this._objectLocalDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._worldYDirection = new three.Vector3(0, 1, 0);
        this._onMouseWheel = (event) => {
            if (!this.enableZoom)
                return;
            if (!(this.object instanceof three.PerspectiveCamera) && !(this.object instanceof three.OrthographicCamera)) {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                this.enableZoom = false;
                return;
            }
            const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));
            if (event.deltaY > 0)
                this.object.zoom *= normalizedDelta;
            else if (event.deltaY < 0)
                this.object.zoom /= normalizedDelta;
            this.object.updateProjectionMatrix();
        };
        this.object.rotation.order = 'YZX';
        this.actionKeys = actionKeys !== null && actionKeys !== void 0 ? actionKeys : DEFAULT_ACTION_KEYS$3;
        this.enableZoom = (_a = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.enableZoom) !== null && _a !== void 0 ? _a : true;
        this.zoomSpeed = (_b = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.zoomSpeed) !== null && _b !== void 0 ? _b : 1;
        // Set physics parameters with defaults if not provided.
        this.eyeHeight = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.eyeHeight) !== null && _c !== void 0 ? _c : 1.5;
        this.jumpForce = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _d !== void 0 ? _d : 15;
        this.groundMoveSpeed = (_e = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _e !== void 0 ? _e : 30;
        this.floatMoveSpeed = (_f = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _f !== void 0 ? _f : 8;
        this.rotateSpeed = (_g = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _g !== void 0 ? _g : 0.2;
        this.enableDiagonalMovement = (_h = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableDiagonalMovement) !== null && _h !== void 0 ? _h : true;
        this.enableAcceleration = (_j = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableAcceleration) !== null && _j !== void 0 ? _j : true;
        this.accelerationFactor = (_k = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.accelerationFactor) !== null && _k !== void 0 ? _k : 1.5;
        // Bind key event handlers.
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseMove = this._onMouseMove.bind(this);
        this.onMouseDown = this._onMouseDown.bind(this);
        this.onMouseWheel = this._onMouseWheel.bind(this);
        // Connect controls to pointer lock events.
        this.connect();
    }
    /**
     * Retrieves the forward _objectWorldDirection vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _objectWorldDirection.
     */
    _getForwardVector() {
        this.object.getWorldDirection(this._objectLocalDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        return this._objectLocalDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    _getSideVector() {
        this.object.getWorldDirection(this._objectLocalDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        this._objectLocalDirection.cross(this.object.up);
        return this._objectLocalDirection;
    }
    _accumulateDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        if (keyStates$3.forward) {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        if (keyStates$3.backward) {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$3.leftward) {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        if (keyStates$3.rightward) {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection.normalize();
    }
    _getMostRecentDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        let lastAction = null;
        let lastCount = 0;
        Object.entries(keyStates$3).forEach(([key, value]) => {
            if (value > lastCount) {
                lastAction = key;
                lastCount = value;
            }
        });
        if (lastAction === 'forward') {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        else if (lastAction === 'backward') {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        else if (lastAction === 'leftward') {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        else if (lastAction === 'rightward') {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection;
    }
    /**
     * Updates movement based on physics and camera rotation.
     * @param delta - The time delta for frame-independent movement.
     */
    updateControls(delta) {
        let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if (this.enableAcceleration && keyStates$3.accelerate)
            speedDelta *= this.accelerationFactor;
        // Move
        let movement;
        if (this.enableDiagonalMovement)
            movement = this._accumulateDirection();
        else
            movement = this._getMostRecentDirection();
        this.velocity.add(movement.multiplyScalar(speedDelta));
        // Jump if grounded.
        if (keyStates$3.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
        this.object.updateMatrixWorld();
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
        var _a, _b, _c;
        super.connect();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('click', this.onMouseDown);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.addEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disconnects the pointer lock controls by removing event listeners.
     */
    disconnect() {
        var _a, _b, _c;
        super.disconnect();
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('click', this.onMouseDown);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.removeEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disposes of the pointer lock controls, cleaning up event listeners and animations.
     */
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    _onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$3[action] = ++this._keyCount;
                break;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    _onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$3[action] = 0;
                break;
            }
        }
    }
    /**
     * Requests pointer lock on the DOM element.
     */
    _onMouseDown() {
        var _a;
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.requestPointerLock();
    }
    /** Handles mousemove events to update camera angles with separate clamping for upward and downward movements. */
    _onMouseMove(event) {
        if (document.pointerLockElement !== this.domElement)
            return;
        this.object.rotateOnWorldAxis(this._worldYDirection, (-1 * event.movementX * this.rotateSpeed) / 100);
        this.object.rotateX((-1 * event.movementY * this.rotateSpeed) / 100);
        this.object.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.object.rotation.x));
    }
}

class PhysicsCharacterControls extends PhysicsControls {
    constructor(object, domElement, world, animationOptions = {}, physicsOptions = {}) {
        var _a, _b, _c, _d, _e;
        super(object, domElement, world, physicsOptions);
        this._animationClips = {};
        this._animationActions = {};
        this._localVelocity = new three.Vector3();
        this._worldQuaternion = new three.Quaternion();
        this._currentAction = null;
        this._objectGroup = new three.AnimationObjectGroup(object);
        this._mixer = new three.AnimationMixer(this._objectGroup);
        if (animationOptions.animationClips) {
            Object.entries(animationOptions.animationClips).forEach(([key, clip]) => {
                this.setAnimationClip(key, clip);
            });
        }
        this.transitionTime = (_a = animationOptions.transitionTime) !== null && _a !== void 0 ? _a : 0.3;
        this.transitionDelay = (_b = animationOptions.transitionDelay) !== null && _b !== void 0 ? _b : 0.3;
        this.fallSpeedThreshold = (_c = animationOptions.fallSpeedThreshold) !== null && _c !== void 0 ? _c : 15;
        this.moveSpeedThreshold = (_d = animationOptions.moveSpeedThreshold) !== null && _d !== void 0 ? _d : 1;
        this.runSpeedThreshold = (_e = animationOptions.runSpeedThreshold) !== null && _e !== void 0 ? _e : 5;
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
     * @param isOnce - (Optional) If true, the animation will play only once and stop at the last frame.
     */
    _fadeToAction(key, duration, isOnce) {
        const action = this._animationActions[key];
        if (!action || action === this._currentAction)
            return;
        // Fade out all current actions
        Object.values(this._animationActions).forEach(currentAction => {
            currentAction.fadeOut(duration);
        });
        this._currentAction = action;
        action.reset(); // Reset the action to start from the beginning
        if (isOnce) {
            action.setLoop(three.LoopOnce, 1);
            action.clampWhenFinished = true;
        }
        action.fadeIn(duration);
        action.play(); // Play the action
    }
    /**
     * Updates the animation based on the current state of the player.
     */
    _updateAnimation() {
        const worldQuaternion = this.object.getWorldQuaternion(this._worldQuaternion);
        this._localVelocity.copy(this.velocity).applyQuaternion(worldQuaternion.invert());
        if (this.velocity.y > 0) {
            return this._fadeToAction('jumpUp', this.transitionTime, true);
        }
        if (this.isLanding) {
            return this._fadeToAction('jumpDown', this.transitionTime, true);
        }
        if (this.isGrounded && this._localVelocity.z > this.runSpeedThreshold && this._animationActions.runForward) {
            return this._fadeToAction('runForward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.z > this.moveSpeedThreshold) {
            return this._fadeToAction('forward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.z < -this.runSpeedThreshold && this._animationActions.runBackward) {
            return this._fadeToAction('runBackward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.z < -this.moveSpeedThreshold) {
            return this._fadeToAction('backward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.x > this.runSpeedThreshold && this._animationActions.runLeftward) {
            return this._fadeToAction('runLeftward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.x > this.moveSpeedThreshold) {
            return this._fadeToAction('leftward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.x < -this.runSpeedThreshold && this._animationActions.runRightward) {
            return this._fadeToAction('runRightward', this.transitionTime);
        }
        if (this.isGrounded && this._localVelocity.x < -this.moveSpeedThreshold) {
            return this._fadeToAction('rightward', this.transitionTime);
        }
        if (!this.isLanding && this.velocity.y < -this.fallSpeedThreshold) {
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
    forward: 0,
    backward: 0,
    leftward: 0,
    rightward: 0,
    jump: 0,
    accelerate: 0,
};
const DEFAULT_ACTION_KEYS$2 = {
    forward: ['KeyW', 'ArrowUp'],
    backward: ['KeyS', 'ArrowDown'],
    leftward: ['KeyA', 'ArrowLeft'],
    rightward: ['KeyD', 'ArrowRight'],
    jump: ['Space'],
    accelerate: ['ShiftLeft'],
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class ThirdPersonMouseDragControls extends PhysicsCharacterControls {
    constructor({ object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions, physicsOptions, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(object, domElement, worldObject, animationOptions, physicsOptions);
        this._spherical = new three.Spherical(); // Spherical coordinates for camera position
        this._isMouseDown = false; // Flag to track mouse down state
        this._keyCount = 0; // Number of keys currently pressed
        // Temporary vectors for calculations
        this._forwardDirection = new three.Vector3();
        this._objectLocalDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._cameraLookAtPosition = new three.Vector3();
        this._cameraLerpPosition = new three.Vector3();
        /** Handles mousedown events to set _isMouseDown flag. */
        this._onMouseDown = () => {
            this._isMouseDown = true;
        };
        /** Handles mouseup events to reset _isMouseDown flag. */
        this._onMouseUp = () => {
            this._isMouseDown = false;
        };
        /** Handles mousemove events to update camera angles when mouse is down. */
        this._onMouseMove = (event) => {
            if (!this._isMouseDown)
                return;
            this._spherical.theta -= (event.movementX * this.rotateSpeed) / 100;
            this._spherical.phi -= (event.movementY * this.rotateSpeed) / 100;
            this._spherical.makeSafe();
        };
        /** Handles mouse wheel events to zoom in and out. */
        this._onMouseWheel = (event) => {
            if (!this.enableZoom)
                return;
            if (!(this.camera instanceof three.PerspectiveCamera) && !(this.camera instanceof three.OrthographicCamera)) {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                this.enableZoom = false;
                return;
            }
            const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));
            if (event.deltaY > 0)
                this.camera.zoom *= normalizedDelta;
            else if (event.deltaY < 0)
                this.camera.zoom /= normalizedDelta;
            this.camera.updateProjectionMatrix();
        };
        this.actionKeys = actionKeys !== null && actionKeys !== void 0 ? actionKeys : DEFAULT_ACTION_KEYS$2;
        this.camera = camera;
        this.cameraPositionOffset = (_a = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.posOffset) !== null && _a !== void 0 ? _a : new three.Vector3(0, 2, -2);
        this.cameraLookAtOffset = (_b = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.lookAtOffset) !== null && _b !== void 0 ? _b : new three.Vector3(0, 1, 0);
        this.cameraLerpFactor = (_c = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.cameraLerpFactor) !== null && _c !== void 0 ? _c : 1;
        const subVector = this.cameraPositionOffset.clone().sub(this.cameraLookAtOffset);
        this._spherical.setFromVector3(subVector);
        this.axisSync = (_d = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.axisSync) !== null && _d !== void 0 ? _d : 'move';
        this.enableZoom = (_e = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.enableZoom) !== null && _e !== void 0 ? _e : true;
        this.zoomSpeed = (_f = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.zoomSpeed) !== null && _f !== void 0 ? _f : 1;
        this.jumpForce = (_g = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _g !== void 0 ? _g : 15;
        this.groundMoveSpeed = (_h = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _h !== void 0 ? _h : 30;
        this.floatMoveSpeed = (_j = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _j !== void 0 ? _j : 8;
        this.rotateSpeed = (_k = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _k !== void 0 ? _k : 1;
        this.enableDiagonalMovement = (_l = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableDiagonalMovement) !== null && _l !== void 0 ? _l : true;
        this.enableRotationOnMove = (_m = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableRotationOnMove) !== null && _m !== void 0 ? _m : true;
        this.enableAcceleration = (_o = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableAcceleration) !== null && _o !== void 0 ? _o : true;
        this.accelerationFactor = (_p = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.accelerationFactor) !== null && _p !== void 0 ? _p : 1.5;
        // Bind key event handlers.
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseDown = this._onMouseDown.bind(this);
        this.onMouseUp = this._onMouseUp.bind(this);
        this.onMouseMove = this._onMouseMove.bind(this);
        this.onMouseWheel = this._onMouseWheel.bind(this);
        // Connect event listeners
        this.connect();
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    _getForwardVector() {
        this._objectLocalDirection.copy(this._forwardDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        return this._objectLocalDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    _getSideVector() {
        this._objectLocalDirection.copy(this._forwardDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        this._objectLocalDirection.cross(this.object.up);
        return this._objectLocalDirection;
    }
    _accumulateDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        if (keyStates$2.forward) {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        if (keyStates$2.backward) {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$2.leftward) {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        if (keyStates$2.rightward) {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection.normalize();
    }
    _getMostRecentDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        let lastAction = null;
        let lastCount = 0;
        Object.entries(keyStates$2).forEach(([key, value]) => {
            if (value > lastCount) {
                lastAction = key;
                lastCount = value;
            }
        });
        if (lastAction === 'forward') {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        else if (lastAction === 'backward') {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        else if (lastAction === 'leftward') {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        else if (lastAction === 'rightward') {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection;
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if (this.enableAcceleration && keyStates$2.accelerate)
            speedDelta *= this.accelerationFactor;
        let movement;
        if (this.enableDiagonalMovement)
            movement = this._accumulateDirection();
        else
            movement = this._getMostRecentDirection();
        // Apply movement vector
        if (movement.lengthSq() > 1e-10) {
            this.velocity.add(movement.multiplyScalar(speedDelta));
            if (this.enableRotationOnMove)
                this.object.lookAt(this.object.position.clone().add(movement));
        }
        // Jump if grounded.
        if (keyStates$2.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
        this.object.updateMatrixWorld();
    }
    updateSync() {
        if (this.axisSync === 'always') {
            this.camera.getWorldDirection(this._forwardDirection);
            this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
            return;
        }
        if (this.axisSync === 'move' &&
            (keyStates$2.forward || keyStates$2.backward || keyStates$2.leftward || keyStates$2.rightward)) {
            this.camera.getWorldDirection(this._forwardDirection);
            this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
            return;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    updateCamera() {
        this._cameraLookAtPosition.copy(this.object.position).add(this.cameraLookAtOffset);
        this._cameraLerpPosition.lerp(this._cameraLookAtPosition, this.cameraLerpFactor);
        this._spherical.radius = this.cameraPositionOffset.distanceTo(this.cameraLookAtOffset);
        this.camera.position.setFromSpherical(this._spherical).add(this._cameraLerpPosition);
        this.camera.lookAt(this._cameraLookAtPosition);
        this.camera.updateMatrixWorld();
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
        var _a, _b, _c;
        super.connect();
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.addEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        var _a, _b, _c;
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.removeEventListener('wheel', this.onMouseWheel);
    }
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    _onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$2[action] = ++this._keyCount;
                break;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    _onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$2[action] = 0;
                break;
            }
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates$1 = {
    forward: 0,
    backward: 0,
    leftward: 0,
    rightward: 0,
    jump: 0,
    accelerate: 0,
};
const DEFAULT_ACTION_KEYS$1 = {
    forward: ['KeyW', 'ArrowUp'],
    backward: ['KeyS', 'ArrowDown'],
    leftward: ['KeyA', 'ArrowLeft'],
    rightward: ['KeyD', 'ArrowRight'],
    jump: ['Space'],
    accelerate: ['ShiftLeft'],
};
/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class ThirdPersonPointerLockControls extends PhysicsCharacterControls {
    constructor({ object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions, physicsOptions, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(object, domElement, worldObject, animationOptions, physicsOptions);
        this._spherical = new three.Spherical(); // Spherical coordinates for camera position
        this._keyCount = 0; // Number of keys currently pressed
        // Temporary vectors for calculations
        this._forwardDirection = new three.Vector3();
        this._objectLocalDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._cameraLookAtPosition = new three.Vector3();
        this._cameraLerpPosition = new three.Vector3();
        /** Handles mousedown events to lock pointer. */
        this._onMouseDown = () => {
            var _a;
            (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.requestPointerLock();
        };
        /** Handles mousemove events to update camera angles when pointer is locked. */
        this._onMouseMove = (event) => {
            if (document.pointerLockElement !== this.domElement)
                return;
            this._spherical.theta -= (event.movementX * this.rotateSpeed) / 100;
            this._spherical.phi -= (event.movementY * this.rotateSpeed) / 100;
            this._spherical.makeSafe();
        };
        /** Handles mouse wheel events to zoom in and out. */
        this._onMouseWheel = (event) => {
            if (!this.enableZoom)
                return;
            if (!(this.camera instanceof three.PerspectiveCamera) && !(this.camera instanceof three.OrthographicCamera)) {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                this.enableZoom = false;
                return;
            }
            const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));
            if (event.deltaY > 0)
                this.camera.zoom *= normalizedDelta;
            else if (event.deltaY < 0)
                this.camera.zoom /= normalizedDelta;
            this.camera.updateProjectionMatrix();
        };
        this.actionKeys = actionKeys !== null && actionKeys !== void 0 ? actionKeys : DEFAULT_ACTION_KEYS$1;
        this.camera = camera;
        this.cameraPositionOffset = (_a = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.posOffset) !== null && _a !== void 0 ? _a : new three.Vector3(0, 2, -2);
        this.cameraLookAtOffset = (_b = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.lookAtOffset) !== null && _b !== void 0 ? _b : new three.Vector3(0, 1, 0);
        this.cameraLerpFactor = (_c = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.cameraLerpFactor) !== null && _c !== void 0 ? _c : 1;
        const subVector = this.cameraPositionOffset.clone().sub(this.cameraLookAtOffset);
        this._spherical.setFromVector3(subVector);
        this.axisSync = (_d = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.axisSync) !== null && _d !== void 0 ? _d : 'move';
        this.enableZoom = (_e = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.enableZoom) !== null && _e !== void 0 ? _e : true;
        this.zoomSpeed = (_f = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.zoomSpeed) !== null && _f !== void 0 ? _f : 1;
        this.jumpForce = (_g = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _g !== void 0 ? _g : 15;
        this.groundMoveSpeed = (_h = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _h !== void 0 ? _h : 30;
        this.floatMoveSpeed = (_j = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _j !== void 0 ? _j : 8;
        this.rotateSpeed = (_k = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _k !== void 0 ? _k : 1;
        this.enableDiagonalMovement = (_l = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableDiagonalMovement) !== null && _l !== void 0 ? _l : true;
        this.enableRotationOnMove = (_m = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableRotationOnMove) !== null && _m !== void 0 ? _m : true;
        this.enableAcceleration = (_o = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableAcceleration) !== null && _o !== void 0 ? _o : true;
        this.accelerationFactor = (_p = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.accelerationFactor) !== null && _p !== void 0 ? _p : 1.5;
        // Bind key event handlers.
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseDown = this._onMouseDown.bind(this);
        this.onMouseMove = this._onMouseMove.bind(this);
        this.onMouseWheel = this._onMouseWheel.bind(this);
        // Connect event listeners
        this.connect();
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    _getForwardVector() {
        this._objectLocalDirection.copy(this._forwardDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        return this._objectLocalDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    _getSideVector() {
        this._objectLocalDirection.copy(this._forwardDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        this._objectLocalDirection.cross(this.object.up);
        return this._objectLocalDirection;
    }
    _accumulateDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        if (keyStates$1.forward) {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        if (keyStates$1.backward) {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        if (keyStates$1.leftward) {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        if (keyStates$1.rightward) {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection.normalize();
    }
    _getMostRecentDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        let lastAction = null;
        let lastCount = 0;
        Object.entries(keyStates$1).forEach(([key, value]) => {
            if (value > lastCount) {
                lastAction = key;
                lastCount = value;
            }
        });
        if (lastAction === 'forward') {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        else if (lastAction === 'backward') {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        else if (lastAction === 'leftward') {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        else if (lastAction === 'rightward') {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection;
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if (this.enableAcceleration && keyStates$1.accelerate)
            speedDelta *= this.accelerationFactor;
        let movement;
        if (this.enableDiagonalMovement)
            movement = this._accumulateDirection();
        else
            movement = this._getMostRecentDirection();
        // Apply movement vector
        if (movement.lengthSq() > 1e-10) {
            this.velocity.add(movement.multiplyScalar(speedDelta));
            if (this.enableRotationOnMove)
                this.object.lookAt(this.object.position.clone().add(movement));
        }
        // Jump if grounded.
        if (keyStates$1.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
        this.object.updateMatrixWorld();
    }
    updateSync() {
        if (this.axisSync === 'always') {
            this.camera.getWorldDirection(this._forwardDirection);
            this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
            return;
        }
        if (this.axisSync === 'move' &&
            (keyStates$1.forward || keyStates$1.backward || keyStates$1.leftward || keyStates$1.rightward)) {
            this.camera.getWorldDirection(this._forwardDirection);
            this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
            return;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    updateCamera() {
        this._cameraLookAtPosition.copy(this.object.position).add(this.cameraLookAtOffset);
        this._cameraLerpPosition.lerp(this._cameraLookAtPosition, this.cameraLerpFactor);
        this._spherical.radius = this.cameraPositionOffset.distanceTo(this.cameraLookAtOffset);
        this.camera.position.setFromSpherical(this._spherical).add(this._cameraLerpPosition);
        this.camera.lookAt(this._cameraLookAtPosition);
        this.camera.updateMatrixWorld();
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
        var _a, _b, _c;
        super.connect();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', this.onMouseDown);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.addEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        var _a, _b, _c;
        super.disconnect();
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('mousedown', this.onMouseDown);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMove);
        (_c = this.domElement) === null || _c === void 0 ? void 0 : _c.addEventListener('wheel', this.onMouseWheel);
    }
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    _onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$1[action] = ++this._keyCount;
                break;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    _onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates$1[action] = 0;
                break;
            }
        }
    }
}

/**
 * Global object to track the current state of pressed keys.
 */
const keyStates = {
    forward: 0,
    backward: 0,
    leftward: 0,
    rightward: 0,
    jump: 0,
    turnUp: 0,
    turnDown: 0,
    turnLeft: 0,
    turnRight: 0,
    accelerate: 0,
};
const DEFAULT_ACTION_KEYS = {
    forward: ['KeyW'],
    backward: ['KeyS'],
    leftward: ['KeyA'],
    rightward: ['KeyD'],
    jump: ['Space'],
    turnUp: ['ArrowUp'],
    turnDown: ['ArrowDown'],
    turnLeft: ['ArrowLeft'],
    turnRight: ['ArrowRight'],
    accelerate: ['ShiftLeft'],
};
/**
 * Controls class that allows movement with the keyboard and rotation with the camera.
 */
class ThirdPersonKeyboardControls extends PhysicsCharacterControls {
    constructor({ object, domElement, worldObject, camera, actionKeys, cameraOptions, animationOptions, physicsOptions, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        super(object, domElement, worldObject, animationOptions, physicsOptions);
        this._spherical = new three.Spherical();
        this._keyCount = 0;
        // Temporary vectors for calculations
        this._forwardDirection = new three.Vector3();
        this._objectLocalDirection = new three.Vector3();
        this._accumulatedDirection = new three.Vector3();
        this._cameraLookAtPosition = new three.Vector3();
        this._cameraLerpPosition = new three.Vector3();
        /** Handles mouse wheel events to zoom in and out. */
        this._onMouseWheel = (event) => {
            if (!this.enableZoom)
                return;
            if (!(this.camera instanceof three.PerspectiveCamera) && !(this.camera instanceof three.OrthographicCamera)) {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
                this.enableZoom = false;
                return;
            }
            const normalizedDelta = Math.pow(0.95, this.zoomSpeed * Math.abs(event.deltaY * 0.01));
            if (event.deltaY > 0)
                this.camera.zoom *= normalizedDelta;
            else if (event.deltaY < 0)
                this.camera.zoom /= normalizedDelta;
            this.camera.updateProjectionMatrix();
        };
        this.actionKeys = actionKeys !== null && actionKeys !== void 0 ? actionKeys : DEFAULT_ACTION_KEYS;
        this.camera = camera;
        this.cameraPositionOffset = (_a = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.posOffset) !== null && _a !== void 0 ? _a : new three.Vector3(0, 2, -2);
        this.cameraLookAtOffset = (_b = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.lookAtOffset) !== null && _b !== void 0 ? _b : new three.Vector3(0, 1, 0);
        this.cameraLerpFactor = (_c = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.cameraLerpFactor) !== null && _c !== void 0 ? _c : 0.5;
        const subVector = this.cameraPositionOffset.clone().sub(this.cameraLookAtOffset);
        this._spherical.setFromVector3(subVector);
        this.axisSync = (_d = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.axisSync) !== null && _d !== void 0 ? _d : 'move';
        this.enableZoom = (_e = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.enableZoom) !== null && _e !== void 0 ? _e : true;
        this.zoomSpeed = (_f = cameraOptions === null || cameraOptions === void 0 ? void 0 : cameraOptions.zoomSpeed) !== null && _f !== void 0 ? _f : 1;
        this.jumpForce = (_g = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _g !== void 0 ? _g : 15;
        this.groundMoveSpeed = (_h = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _h !== void 0 ? _h : 30;
        this.floatMoveSpeed = (_j = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _j !== void 0 ? _j : 8;
        this.rotateSpeed = (_k = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _k !== void 0 ? _k : 1;
        this.enableDiagonalMovement = (_l = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableDiagonalMovement) !== null && _l !== void 0 ? _l : true;
        this.enableRotationOnMove = (_m = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableRotationOnMove) !== null && _m !== void 0 ? _m : true;
        this.enableAcceleration = (_o = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.enableAcceleration) !== null && _o !== void 0 ? _o : true;
        this.accelerationFactor = (_p = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.accelerationFactor) !== null && _p !== void 0 ? _p : 1.5;
        this.onKeyDown = this._onKeyDown.bind(this);
        this.onKeyUp = this._onKeyUp.bind(this);
        this.onMouseWheel = this._onMouseWheel.bind(this);
        this.connect();
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    _getForwardVector() {
        this._objectLocalDirection.copy(this._forwardDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        return this._objectLocalDirection;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    _getSideVector() {
        this._objectLocalDirection.copy(this._forwardDirection);
        this._objectLocalDirection.y = 0;
        this._objectLocalDirection.normalize();
        this._objectLocalDirection.cross(this.object.up);
        return this._objectLocalDirection;
    }
    _accumulateDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        if (keyStates.forward) {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        if (keyStates.backward) {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        if (keyStates.leftward) {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        if (keyStates.rightward) {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection.normalize();
    }
    _getMostRecentDirection() {
        this._accumulatedDirection.set(0, 0, 0);
        let lastAction = null;
        let lastCount = 0;
        Object.entries(keyStates).forEach(([key, value]) => {
            if (value > lastCount) {
                lastAction = key;
                lastCount = value;
            }
        });
        if (lastAction === 'forward') {
            this._accumulatedDirection.add(this._getForwardVector());
        }
        else if (lastAction === 'backward') {
            this._accumulatedDirection.add(this._getForwardVector().multiplyScalar(-1));
        }
        else if (lastAction === 'leftward') {
            this._accumulatedDirection.add(this._getSideVector().multiplyScalar(-1));
        }
        else if (lastAction === 'rightward') {
            this._accumulatedDirection.add(this._getSideVector());
        }
        return this._accumulatedDirection;
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        let speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if (this.enableAcceleration && keyStates.accelerate)
            speedDelta *= this.accelerationFactor;
        let movement;
        if (this.enableDiagonalMovement)
            movement = this._accumulateDirection();
        else
            movement = this._getMostRecentDirection();
        // Apply movement vector
        if (movement.lengthSq() > 1e-10) {
            this.velocity.add(movement.multiplyScalar(speedDelta));
            if (this.enableRotationOnMove)
                this.object.lookAt(this.object.position.clone().add(movement));
        }
        // Jump if grounded.
        if (keyStates.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
        }
        this.object.updateMatrixWorld();
    }
    updateSync() {
        if (this.axisSync === 'always') {
            this.camera.getWorldDirection(this._forwardDirection);
            this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
            return;
        }
        if (this.axisSync === 'move' &&
            (keyStates.forward || keyStates.backward || keyStates.leftward || keyStates.rightward)) {
            this.camera.getWorldDirection(this._forwardDirection);
            this.object.lookAt(this.object.position.clone().add(this._getForwardVector()));
            return;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and keyboard input.
     */
    updateCamera(delta) {
        // Update spherical properties
        const rotationSpeed = this.rotateSpeed * delta;
        if (keyStates.turnUp) {
            this._spherical.phi -= rotationSpeed;
        }
        if (keyStates.turnDown) {
            this._spherical.phi += rotationSpeed;
        }
        if (keyStates.turnLeft) {
            this._spherical.theta += rotationSpeed;
        }
        if (keyStates.turnRight) {
            this._spherical.theta -= rotationSpeed;
        }
        this._spherical.makeSafe();
        // Update camera position with lerp
        this._cameraLookAtPosition.copy(this.object.position).add(this.cameraLookAtOffset);
        this._cameraLerpPosition.lerp(this._cameraLookAtPosition, this.cameraLerpFactor);
        this._spherical.radius = this.cameraPositionOffset.distanceTo(this.cameraLookAtOffset);
        this.camera.position.setFromSpherical(this._spherical).add(this._cameraLerpPosition);
        this.camera.lookAt(this._cameraLookAtPosition);
        this.camera.updateMatrixWorld();
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
    /**
     * Connects the controls by adding event listeners.
     */
    connect() {
        var _a;
        super.connect();
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', this.onMouseWheel);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        var _a;
        super.disconnect();
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', this.onMouseWheel);
    }
    dispose() {
        this.disconnect();
        super.dispose();
    }
    /** Handles keydown events, updating the key state. */
    _onKeyDown(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates[action] = ++this._keyCount;
                break;
            }
        }
    }
    /** Handles keyup events, updating the key state. */
    _onKeyUp(event) {
        for (const [action, keys] of Object.entries(this.actionKeys)) {
            if (keys === null || keys === void 0 ? void 0 : keys.includes(event.code)) {
                keyStates[action] = 0;
                break;
            }
        }
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
        const capsuleGeometry = new three.CapsuleGeometry(controls.collider.radius, controls.collider.start.distanceTo(controls.collider.end));
        this.capsuleHelper = new three.LineSegments(capsuleGeometry, new three.LineBasicMaterial({ color: color, toneMapped: false }));
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
        this._capsulePosition.y +=
            this.controls.collider.start.distanceTo(this.controls.collider.end) / 2 + this.controls.collider.radius;
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
exports.FirstPersonMouseDragControls = FirstPersonMouseDragControls;
exports.FirstPersonPointerLockControls = FirstPersonPointerLockControls;
exports.PhysicsControls = PhysicsControls;
exports.PhysicsControlsHelper = PhysicsControlsHelper;
exports.ThirdPersonKeyboardControls = ThirdPersonKeyboardControls;
exports.ThirdPersonMouseDragControls = ThirdPersonMouseDragControls;
exports.ThirdPersonPointerLockControls = ThirdPersonPointerLockControls;
