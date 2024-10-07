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

const _collideEvent = { type: 'collide' };
const _fallEvent = { type: 'fall' };
const _groundEvent = { type: 'ground' };
class PhysicsControls extends three.Controls {
    constructor(object, domElement, world, physicsOptions) {
        super(object, domElement);
        this._isGrounded = false;
        this.velocity = new three.Vector3();
        this.height = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.height) || this.getSize(object).y;
        this.radius = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.radius) || this.getSize(object).y / 4;
        this.resistance = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.resistance) || 4;
        this._collider = new Capsule(new three.Vector3(0, this.radius, 0), new three.Vector3(0, this.height - this.radius, 0), this.radius);
        this._collider.translate(object.position);
        this.gravity = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.gravity) || 30;
        this.maxFallSpeed = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.maxFallSpeed) || 60;
        this.boundary = physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.boundary;
        this._worldOctree = new Octree();
        this._worldOctree.fromGraphNode(world);
    }
    get collider() {
        return this._collider;
    }
    get isGrounded() {
        return this._isGrounded;
    }
    getSize(object) {
        const box = new three.Box3().setFromObject(object);
        const size = new three.Vector3();
        box.getSize(size);
        return size;
    }
    checkCollisions() {
        const result = this._worldOctree.capsuleIntersect(this._collider);
        this._isGrounded = false;
        if (!result)
            return;
        this.dispatchEvent(_collideEvent);
        if (result.normal.y > 0) {
            this.dispatchEvent(_groundEvent);
            this._isGrounded = true;
        }
        if (!this._isGrounded) {
            this.velocity.addScaledVector(result.normal, -result.normal.dot(this.velocity));
            this.dispatchEvent(_fallEvent);
        }
        if (result.depth >= 1e-10) {
            this.collider.translate(result.normal.multiplyScalar(result.depth));
        }
    }
    update(delta) {
        if (!this.enabled)
            return;
        let damping = Math.exp(-this.resistance * delta) - 1;
        if (!this._isGrounded) {
            this.velocity.y -= Math.min(this.gravity * delta, this.maxFallSpeed);
            // small air resistance
            damping *= 0.1;
        }
        this.velocity.addScaledVector(this.velocity, damping);
        const deltaPosition = this.velocity.clone().multiplyScalar(delta);
        this._collider.translate(deltaPosition);
        this.checkCollisions();
        this.teleportPlayerIfOob();
        this.object.position.copy(this._collider.end).y -=
            this.height / 2 + this.radius;
    }
    teleportPlayerIfOob() {
        if (!this.boundary)
            return;
        const { resetPoint, x, y, z } = this.boundary;
        if (this.object.position.x < x[0] ||
            this.object.position.x > x[1] ||
            this.object.position.y < y[0] ||
            this.object.position.y > y[1] ||
            this.object.position.z < z[0] ||
            this.object.position.z > z[1]) {
            this.object.position.copy(resetPoint);
            this._collider.start.set(resetPoint.x, resetPoint.y + this.radius, resetPoint.z);
            this._collider.end.set(resetPoint.x, resetPoint.y + this.height - this.radius, resetPoint.z);
            this.velocity.set(0, 0, 0);
        }
    }
}

class Characters {
    constructor(object, animationClips) {
        this._animationClips = {};
        this._animationActions = {};
        this.objectGroup = new three.AnimationObjectGroup(object);
        this.mixer = new three.AnimationMixer(this.objectGroup);
        if (!animationClips)
            return;
        Object.entries(animationClips).forEach(([key, clip]) => {
            this.setAnimationClip(key, clip);
        });
    }
    get animationClips() {
        return Object.freeze(Object.assign({}, this._animationClips));
    }
    addObject(object) {
        this.objectGroup.add(object);
    }
    removeObject(object) {
        this.objectGroup.remove(object);
    }
    setAnimationClip(key, clip) {
        const action = this.mixer.clipAction(clip);
        this._animationClips[key] = clip;
        this._animationActions[key] = action;
    }
    removeAnimationClip(key) {
        const clip = this._animationClips[key];
        if (!clip)
            return;
        const action = this._animationActions[key];
        if (!action)
            return;
        action.stop();
        this.mixer.uncacheClip(clip);
        this.mixer.uncacheAction(clip, this.objectGroup);
        delete this._animationClips[key];
        delete this._animationActions[key];
    }
    fadeToAction(key, duration) {
        const action = this._animationActions[key];
        if (!action)
            return;
        if (action.isRunning())
            return;
        Object.values(this._animationActions).forEach(action => {
            action.fadeOut(duration);
        });
        action.reset(); // 새로운 액션을 처음부터 재생
        action.fadeIn(duration);
        action.play(); // 액션을 재생합니다.
    }
    update(delta) {
        this.mixer.update(delta);
    }
    dispose() {
        this.mixer.stopAllAction();
        this.mixer.uncacheRoot(this.objectGroup);
    }
}

const keyStates = {};
class KeyboardRotationControls extends PhysicsControls {
    constructor(object, domElement, worldObject, keyOptions, cameraOptions, animationOptions, physicsOptions) {
        super(object, domElement, worldObject, physicsOptions);
        this.camera = null;
        this.cameraPosOffset = null;
        this.cameraLookAtOffset = null;
        this._vector1 = new three.Vector3();
        this._direction = new three.Vector3();
        const { idle, forward, backward, jump, fall } = animationOptions || {};
        this._characters = new Characters(object, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (idle && { idle })), (forward && { forward })), (backward && { backward })), (jump && { jump })), (fall && { fall })));
        this.keyOptions = keyOptions;
        if (cameraOptions) {
            this.camera = cameraOptions.camera;
            this.cameraPosOffset = cameraOptions.posOffset;
            this.cameraLookAtOffset = cameraOptions.lookAtOffset;
        }
        this.jumpForce = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.jumpForce) || 15;
        this.groundMoveSpeed = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.groundMoveSpeed) || 25;
        this.floatMoveSpeed = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.floatMoveSpeed) || 8;
        this.rotateSpeed = (physicsOptions === null || physicsOptions === void 0 ? void 0 : physicsOptions.rotateSpeed) || 1;
        this.transitionTime = (animationOptions === null || animationOptions === void 0 ? void 0 : animationOptions.transitionTime) || 0.3;
        this.fallSpeedThreshold = (animationOptions === null || animationOptions === void 0 ? void 0 : animationOptions.fallSpeedThreshold) || 15;
        this.moveSpeedThreshold = (animationOptions === null || animationOptions === void 0 ? void 0 : animationOptions.moveSpeedThreshold) || 1;
        this._onKeyDown = onKeyDown.bind(this);
        this._onKeyUp = onKeyUp.bind(this);
        this.connect();
    }
    getForwardVector() {
        this.object.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        return this._direction;
    }
    getSideVector() {
        this.object.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        this._direction.cross(this.object.up);
        return this._direction;
    }
    updateControls(delta) {
        var _a, _b, _c, _d, _e;
        const speedDelta = delta * (this.isGrounded ? this.groundMoveSpeed : this.floatMoveSpeed);
        if ((_a = this.keyOptions.forward) === null || _a === void 0 ? void 0 : _a.some(key => keyStates[key])) {
            this.velocity.add(this.getForwardVector().multiplyScalar(speedDelta));
        }
        if ((_b = this.keyOptions.backward) === null || _b === void 0 ? void 0 : _b.some(key => keyStates[key])) {
            this.velocity.add(this.getForwardVector().multiplyScalar(-speedDelta));
        }
        if ((_c = this.keyOptions.leftTurn) === null || _c === void 0 ? void 0 : _c.some(key => keyStates[key])) {
            this.object.rotateY(delta * this.rotateSpeed);
        }
        if ((_d = this.keyOptions.rightTurn) === null || _d === void 0 ? void 0 : _d.some(key => keyStates[key])) {
            this.object.rotateY(delta * -this.rotateSpeed);
        }
        if (this.isGrounded && ((_e = this.keyOptions.jump) === null || _e === void 0 ? void 0 : _e.some(key => keyStates[key]))) {
            this.velocity.y = this.jumpForce;
        }
    }
    updateCamera() {
        if (this.camera && this.cameraPosOffset && this.cameraLookAtOffset) {
            this.object.updateMatrixWorld();
            const worldOffset = this.cameraPosOffset
                .clone()
                .applyMatrix4(this.object.matrixWorld);
            this.camera.position.copy(worldOffset);
            this.camera.lookAt(this.object
                .getWorldPosition(this._vector1)
                .add(this.cameraLookAtOffset));
        }
    }
    updateAnimation(delta) {
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
            this._characters.fadeToAction('jump', this.transitionTime);
        }
        else if (this.velocity.y < -this.fallSpeedThreshold) {
            this._characters.fadeToAction('fall', this.transitionTime);
        }
    }
    update(delta) {
        this.updateControls(delta);
        super.update(delta);
        this.updateCamera();
        this.updateAnimation(delta);
    }
    connect() {
        super.connect();
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
    }
    disconnect() {
        super.disconnect();
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
    }
}
function onKeyDown(event) {
    keyStates[event.key] = true;
}
function onKeyUp(event) {
    keyStates[event.key] = false;
}

class PhysicsControlsHelper extends three.Group {
    constructor(controls, color = 0xffffff) {
        super();
        this.type = 'PhysicsControlsHelper';
        this._position = new three.Vector3();
        const capsuleGeometry = new three.CapsuleGeometry(controls.radius, controls.height - 2 * controls.radius);
        this.capsuleHelper = new three.LineSegments(capsuleGeometry, new three.LineBasicMaterial({ color: color, toneMapped: false }));
        this.add(this.capsuleHelper);
        if (controls.boundary) {
            const width = controls.boundary.x[1] - controls.boundary.x[0];
            const height = controls.boundary.y[1] - controls.boundary.y[0];
            const depth = controls.boundary.z[1] - controls.boundary.z[0];
            const boxGeometry = new three.BoxGeometry(width, height, depth, width, height, depth);
            this.boundaryHelper = new three.LineSegments(boxGeometry, new three.LineBasicMaterial({ color: color, toneMapped: false }));
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

exports.KeyboardRotationControls = KeyboardRotationControls;
exports.PhysicsControlsHelper = PhysicsControlsHelper;
