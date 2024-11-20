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
const _fallEvent = { type: 'fall' };
const _groundedEvent = { type: 'grounded' };
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
        var _a, _b, _c;
        super(object, domElement);
        this.velocity = new three.Vector3();
        this._isGrounded = false;
        this._deltaPosition = new three.Vector3(); // Temporary vector for delta position calculations
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
        this.gravity = (_a = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.gravity) !== null && _a !== void 0 ? _a : 30;
        this.maxFallSpeed = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.maxFallSpeed) !== null && _b !== void 0 ? _b : 20;
        this.movementResistance = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.movementResistance) !== null && _c !== void 0 ? _c : 4;
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
    checkCollisions() {
        this._isGrounded = false;
        const collisionResult = this._worldOctree.capsuleIntersect(this._capsuleCollider);
        if (!collisionResult)
            return;
        this.dispatchEvent(_collideEvent);
        if (collisionResult.normal.y > 0) {
            // Player is grounded.
            this._isGrounded = true;
            this.dispatchEvent(_groundedEvent);
        }
        else {
            // Player is colliding but not grounded.
            this.velocity.addScaledVector(collisionResult.normal, -collisionResult.normal.dot(this.velocity));
            this.dispatchEvent(_fallEvent);
        }
        // Adjust the collider position to resolve penetration.
        if (collisionResult.depth >= 1e-10) {
            this._capsuleCollider.translate(collisionResult.normal.multiplyScalar(collisionResult.depth));
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
        // Apply movement resistance (damping).
        let damping = Math.exp(-this.movementResistance * delta) - 1;
        if (!this._isGrounded) {
            this.velocity.y -= this.gravity * delta;
            this.velocity.y = Math.max(this.velocity.y, -this.maxFallSpeed);
            damping *= 0.1; // Small air resistance
        }
        this.velocity.addScaledVector(this.velocity, damping);
        this._deltaPosition.copy(this.velocity).multiplyScalar(delta);
        this._capsuleCollider.translate(this._deltaPosition);
        this.checkCollisions();
        this.teleportPlayerIfOutOfBounds();
        // Update the object's position to match the collider.
        this.object.position.copy(this._capsuleCollider.start);
        this.object.position.y -= this._capsuleCollider.radius;
    }
    /**
     * Resets the player's position if they are out of the defined world boundaries.
     */
    teleportPlayerIfOutOfBounds() {
        if (!this.boundary)
            return;
        const { resetPoint, x, y, z } = this.boundary;
        const { x: px, y: py, z: pz } = this.object.position;
        // Check if the player is out of bounds.
        if (px < x.min || px > x.max || py < y.min || py > y.max || pz < z.min || pz > z.max) {
            this._capsuleCollider.start.set(resetPoint.x, resetPoint.y + this._capsuleCollider.radius, resetPoint.z);
            this._capsuleCollider.end.set(resetPoint.x, resetPoint.y + this._capsuleCollider.height - this._capsuleCollider.radius, resetPoint.z);
            this.object.position.copy(resetPoint);
            this.velocity.set(0, 0, 0);
        }
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
 * Class representing a character or group of characters with animations.
 */
class Characters {
    /**
     * Constructs a new Characters instance.
     * @param object - The initial Object3D to add to the character.
     * @param _animationClips - Optional initial animation clips.
     */
    constructor(object, _animationClips) {
        this._animationClips = {};
        this._animationActions = {};
        this._objectGroup = new three.AnimationObjectGroup(object);
        this._mixer = new three.AnimationMixer(this._objectGroup);
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
    fadeToAction(key, duration) {
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
     * Updates the _mixer with the given delta time.
     * @param delta - The time increment in seconds.
     */
    update(delta) {
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
const keyStates = {};
/**
 * KeyboardObjectRotationControls class allows controlling an object using keyboard input,
 * including movement, rotation, physics simulation, camera control, and animations.
 */
class KeyboardObjectRotationControls extends PhysicsControls {
    /**
     * Constructs a new KeyboardObjectRotationControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element for event listeners (optional).
     * @param worldObject - The world object used for physics collision.
     * @param keyOptions - Key mappings for actions.
     * @param cameraOptions - Configuration for the camera (optional).
     * @param animationOptions - Configuration for animations (optional).
     * @param physicsOptions - Physics configuration options (optional).
     */
    constructor(object, domElement, worldObject, keyOptions, cameraOptions, animationOptions, physicsOptions) {
        var _a, _b, _c, _d, _e, _f, _g;
        super(object, domElement, worldObject, physicsOptions);
        this.camera = null;
        this.cameraPosOffset = null;
        this.cameraLookAtOffset = null;
        this._tempVector = new three.Vector3(); // Temporary vector for calculations
        this._direction = new three.Vector3();
        // Initialize character animations.
        const { idle, forward, backward, jump, fall } = animationOptions || {};
        this._characters = new Characters(object, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (idle && { idle })), (forward && { forward })), (backward && { backward })), (jump && { jump })), (fall && { fall })));
        // Set key mappings.
        this.keyOptions = keyOptions;
        // Initialize camera options if provided.
        if (cameraOptions) {
            this.camera = cameraOptions.camera;
            this.cameraPosOffset = cameraOptions.posOffset.clone();
            this.cameraLookAtOffset = cameraOptions.lookAtOffset.clone();
        }
        // Set physics parameters with defaults if not provided.
        this.jumpForce = (_a = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) !== null && _a !== void 0 ? _a : 15;
        this.groundMoveSpeed = (_b = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) !== null && _b !== void 0 ? _b : 25;
        this.floatMoveSpeed = (_c = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) !== null && _c !== void 0 ? _c : 8;
        this.rotateSpeed = (_d = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) !== null && _d !== void 0 ? _d : 1;
        // Set animation options with defaults if not provided.
        this.transitionTime = (_e = animationOptions === null || animationOptions === void 0 ? void 0 : animationOptions.transitionTime) !== null && _e !== void 0 ? _e : 0.3;
        this.fallSpeedThreshold = (_f = animationOptions === null || animationOptions === void 0 ? void 0 : animationOptions.fallSpeedThreshold) !== null && _f !== void 0 ? _f : 15;
        this.moveSpeedThreshold = (_g = animationOptions === null || animationOptions === void 0 ? void 0 : animationOptions.moveSpeedThreshold) !== null && _g !== void 0 ? _g : 1;
        // Bind key event handlers.
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
        // Connect controls to key events.
        this.connect();
    }
    /**
     * Retrieves the forward _direction vector of the object, ignoring the Y-axis.
     * @returns A normalized Vector3 representing the forward _direction.
     */
    getForwardVector() {
        this.object.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        return this._direction;
    }
    /**
     * Updates movement and rotation based on the current keyboard input.
     * @param delta - The time delta for frame-independent movement.
     */
    updateControls(delta) {
        var _a, _b, _c, _d, _e;
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Move forward.
        if ((_a = this.keyOptions.forward) === null || _a === void 0 ? void 0 : _a.some(key => keyStates[key])) {
            this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
        }
        // Move backward.
        if ((_b = this.keyOptions.backward) === null || _b === void 0 ? void 0 : _b.some(key => keyStates[key])) {
            this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
        }
        // Turn left.
        if ((_c = this.keyOptions.leftTurn) === null || _c === void 0 ? void 0 : _c.some(key => keyStates[key])) {
            this.object.rotateY(delta * this.rotateSpeed);
        }
        // Turn right.
        if ((_d = this.keyOptions.rightTurn) === null || _d === void 0 ? void 0 : _d.some(key => keyStates[key])) {
            this.object.rotateY(delta * -this.rotateSpeed);
        }
        // Jump if grounded.
        if (this.isGrounded && ((_e = this.keyOptions.jump) === null || _e === void 0 ? void 0 : _e.some(key => keyStates[key]))) {
            this.velocity.y = this.jumpForce;
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's transformation.
     */
    updateCamera() {
        if (!this.camera || !this.cameraPosOffset || !this.cameraLookAtOffset)
            return;
        this.object.updateMatrixWorld();
        const worldOffset = this.cameraPosOffset.clone().applyMatrix4(this.object.matrixWorld);
        this.camera.position.copy(worldOffset);
        this.camera.lookAt(this.object.getWorldPosition(this._tempVector).add(this.cameraLookAtOffset));
    }
    /**
     * Updates the character's animations based on the current state and velocity.
     * @param delta - The time delta for animation blending.
     */
    updateAnimation(delta) {
        var _a;
        this._characters.update(delta);
        this.object.getWorldDirection(this._direction);
        const forwardSpeed = this._direction.dot(this.velocity);
        if (this.isGrounded && forwardSpeed > this.moveSpeedThreshold) {
            this._characters.fadeToAction('forward', this.transitionTime);
        }
        else if (this.isGrounded && forwardSpeed < -this.moveSpeedThreshold) {
            this._characters.fadeToAction('backward', this.transitionTime);
        }
        else if (this.isGrounded) {
            this._characters.fadeToAction('idle', this.transitionTime);
        }
        else if (this.velocity.y > 0) {
            const jumpKeyPressed = !!((_a = this.keyOptions.jump) === null || _a === void 0 ? void 0 : _a.some(key => keyStates[key]));
            if (jumpKeyPressed) {
                this._characters.fadeToAction('jump', this.transitionTime);
            }
        }
        else if (this.velocity.y < -this.fallSpeedThreshold) {
            this._characters.fadeToAction('fall', this.transitionTime);
        }
    }
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - The time delta for consistent updates.
     */
    update(delta) {
        this.updateControls(delta);
        super.update(delta);
        this.updateCamera();
        this.updateAnimation(delta);
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
        this._characters.dispose();
    }
    /**
     * Handles keydown events, updating the key state.
     * @param event - The keyboard event.
     */
    onKeyDown(event) {
        keyStates[event.key] = true;
    }
    /**
     * Handles keyup events, updating the key state.
     * @param event - The keyboard event.
     */
    onKeyUp(event) {
        keyStates[event.key] = false;
    }
}

/**
 * Controls class that allows movement with the keyboard and rotation with the mouse.
 */
class MouseDragCameraRotationControls extends PhysicsControls {
    /**
     * Constructs a new MouseDragCameraRotationControls instance.
     * @param object - The 3D object to control.
     * @param domElement - The HTML element to attach event listeners to.
     * @param worldObject - The world object used for collision detection.
     * @param keyOptions - Key mappings for actions.
     * @param cameraOptions - Configuration options for the camera.
     * @param animationOptions - Animation clips and options.
     * @param physicsOptions - Physics options.
     */
    constructor(object, domElement, worldObject, keyOptions, cameraOptions, animationOptions = {}, physicsOptions = {}) {
        super(object, domElement, worldObject, physicsOptions);
        this._cameraRadius = 0;
        this._cameraPhi = 0;
        this._cameraTheta = 0;
        this.keyStates = {};
        this._isMouseDown = false;
        // Temporary vectors for calculations
        this._tempVector1 = new three.Vector3();
        this._tempVector2 = new three.Vector3();
        this._tempVector3 = new three.Vector3();
        /** Handles keydown events to update key states. */
        this.onKeyDown = (event) => {
            this.keyStates[event.key] = true;
        };
        /** Handles keyup events to update key states. */
        this.onKeyUp = (event) => {
            this.keyStates[event.key] = false;
        };
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
            this._cameraTheta += (event.movementX * this.rotateSpeed) / 100;
            this._cameraPhi -= (event.movementY * this.rotateSpeed) / 100;
            // Clamp the camera angles to prevent flipping
            this._cameraPhi = Math.max(0.01, Math.min(Math.PI - 0.01, this._cameraPhi));
        };
        // Initialize character animations
        const { idle, forward, jump, fall } = animationOptions || {};
        this._characters = new Characters(object, Object.assign(Object.assign(Object.assign(Object.assign({}, (idle && { idle })), (forward && { forward })), (jump && { jump })), (fall && { fall })));
        this.keyOptions = keyOptions;
        this.camera = cameraOptions.camera;
        this._cameraPositionOffset = cameraOptions.posOffset;
        this._cameraLookAtOffset = cameraOptions.lookAtOffset;
        this.updateCameraInfo();
        // Set physics options with default values
        const { jumpForce = 15, groundMoveSpeed = 25, floatMoveSpeed = 8, rotateSpeed = 1 } = physicsOptions;
        this.jumpForce = jumpForce;
        this.groundMoveSpeed = groundMoveSpeed;
        this.floatMoveSpeed = floatMoveSpeed;
        this.rotateSpeed = rotateSpeed;
        // Set animation options with default values
        const { transitionTime = 0.3, fallSpeedThreshold = 15, moveSpeedThreshold = 1 } = animationOptions;
        this.transitionTime = transitionTime;
        this.fallSpeedThreshold = fallSpeedThreshold;
        this.moveSpeedThreshold = moveSpeedThreshold;
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
        const subVector = this._tempVector1.copy(this._cameraPositionOffset).sub(this._cameraLookAtOffset);
        this._cameraRadius = subVector.length();
        this._cameraPhi = Math.acos(subVector.y / this._cameraRadius);
        this._cameraTheta = Math.atan2(subVector.z, subVector.x);
    }
    /**
     * Gets the forward direction vector based on the camera's orientation.
     * @returns Normalized forward vector.
     */
    getForwardVector() {
        this.camera.getWorldDirection(this._tempVector1);
        this._tempVector1.y = 0;
        this._tempVector1.normalize();
        return this._tempVector1;
    }
    /**
     * Gets the side (right) direction vector based on the camera's orientation.
     * @returns Normalized side vector.
     */
    getSideVector() {
        this.camera.getWorldDirection(this._tempVector2);
        this._tempVector2.y = 0;
        this._tempVector2.normalize();
        this._tempVector2.cross(this.object.up);
        return this._tempVector2;
    }
    /**
     * Updates the object's velocity based on keyboard input.
     * @param delta - Time delta for frame-independent movement.
     */
    updateControls(delta) {
        var _a, _b, _c, _d, _e;
        // Handle jumping
        if (this.isGrounded && ((_a = this.keyOptions.jump) === null || _a === void 0 ? void 0 : _a.some(key => this.keyStates[key]))) {
            this.velocity.y = this.jumpForce;
        }
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        // Reset movement vector
        const movement = this._tempVector3.set(0, 0, 0);
        // Accumulate movement vectors based on key states
        if ((_b = this.keyOptions.leftward) === null || _b === void 0 ? void 0 : _b.some(key => this.keyStates[key])) {
            movement.add(this.getSideVector().multiplyScalar(-1));
        }
        if ((_c = this.keyOptions.rightward) === null || _c === void 0 ? void 0 : _c.some(key => this.keyStates[key])) {
            movement.add(this.getSideVector());
        }
        if ((_d = this.keyOptions.backward) === null || _d === void 0 ? void 0 : _d.some(key => this.keyStates[key])) {
            movement.add(this.getForwardVector().multiplyScalar(-1));
        }
        if ((_e = this.keyOptions.forward) === null || _e === void 0 ? void 0 : _e.some(key => this.keyStates[key])) {
            movement.add(this.getForwardVector());
        }
        // Apply movement if any
        if (movement.lengthSq() > 1e-10) {
            movement.normalize();
            this.velocity.add(movement.multiplyScalar(speedDelta));
            this.object.lookAt(this.object.position.clone().add(movement));
        }
    }
    /**
     * Updates the camera's position and orientation based on the object's position and mouse input.
     */
    updateCamera() {
        this.object.updateMatrixWorld();
        const x = this._cameraRadius * Math.sin(this._cameraPhi) * Math.cos(this._cameraTheta);
        const y = this._cameraRadius * Math.cos(this._cameraPhi);
        const z = this._cameraRadius * Math.sin(this._cameraPhi) * Math.sin(this._cameraTheta);
        const worldOffset = this._tempVector1.copy(this._cameraLookAtOffset).applyMatrix4(this.object.matrixWorld);
        const cameraPosition = this._tempVector2.set(x, y, z).add(worldOffset);
        this.camera.position.copy(cameraPosition);
        const lookAtPosition = this._tempVector3.copy(this.object.position).add(this._cameraLookAtOffset);
        this.camera.lookAt(lookAtPosition);
    }
    /**
     * Updates the character's animations based on the current state and velocity.
     * @param delta - Time delta for animation updates.
     */
    updateAnimation(delta) {
        this._characters.update(delta);
        this.object.getWorldDirection(this._tempVector1);
        const horizontalSpeed = this._tempVector1.copy(this.velocity);
        horizontalSpeed.y = 0;
        const speed = horizontalSpeed.length();
        // Determine which animation to play based on state and speed
        if (this.isGrounded && speed > this.moveSpeedThreshold) {
            this._characters.fadeToAction('forward', this.transitionTime);
        }
        else if (this.isGrounded) {
            this._characters.fadeToAction('idle', this.transitionTime);
        }
        else if (this.velocity.y > 0) {
            this._characters.fadeToAction('jump', this.transitionTime);
        }
        else if (this.velocity.y < -this.fallSpeedThreshold) {
            this._characters.fadeToAction('fall', this.transitionTime);
        }
    }
    /**
     * Main update function that integrates controls, physics, camera, and animations.
     * @param delta - Time delta for consistent updates.
     */
    update(delta) {
        this.updateControls(delta);
        super.update(delta);
        this.updateCamera();
        this.updateAnimation(delta);
    }
    /**
     * Connects the controls by adding event listeners.
     */
    connect() {
        var _a, _b;
        super.connect();
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.addEventListener('mousemove', this.onMouseMove);
    }
    /**
     * Disconnects the controls by removing event listeners.
     */
    disconnect() {
        var _a, _b;
        super.disconnect();
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        (_a = this.domElement) === null || _a === void 0 ? void 0 : _a.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        (_b = this.domElement) === null || _b === void 0 ? void 0 : _b.removeEventListener('mousemove', this.onMouseMove);
    }
    dispose() {
        this.disconnect();
        super.dispose();
        this._characters.dispose();
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
        this.add(this.capsuleHelper);
        // Create box geometry to visualize the boundary if it is set.
        if (controls.boundary) {
            const width = controls.boundary.x.max - controls.boundary.x.min;
            const height = controls.boundary.y.max - controls.boundary.y.min;
            const depth = controls.boundary.z.max - controls.boundary.z.min;
            const boxGeometry = new three.BoxGeometry(width, height, depth);
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
        this._capsulePosition.copy(this.controls.object.position);
        this._capsulePosition.y += this.controls.collider.height / 2;
        this.capsuleHelper.position.copy(this._capsulePosition);
        this.capsuleHelper.rotation.copy(this.controls.object.rotation);
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
            this.capsuleHelper.material.dispose();
        }
        this.clear();
    }
}

exports.KeyboardObjectRotationControls = KeyboardObjectRotationControls;
exports.MouseDragCameraRotationControls = MouseDragCameraRotationControls;
exports.PhysicsControlsHelper = PhysicsControlsHelper;
