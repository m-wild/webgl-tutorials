/** GlAttribute class for managing WebGL attribues */
var GlAttribute = (function () {
    function GlAttribute(index, buffer) {
        this.index = index;
        this.buffer = buffer;
        this.size = 3;
        this.type = gl.FLOAT;
        this.normalized = false;
        this.stride = 0;
        this.offset = 0;
        this.usage = gl.STATIC_DRAW;
        this.targetBuffer = gl.ARRAY_BUFFER;
    }
    /** get a webgl attribute
     * @param  program     the webgl program
     * @param  name        the attribute name
     * @param  size        size of data in the attribute
     * @param  type        the type of data in the attribute
     * @param  normalized  is the data normalized?
     */
    GlAttribute.get = function (program, name, size, type, normalized) {
        var p_attrib = gl.getAttribLocation(program, name);
        var buffer = gl.createBuffer();
        var ret = new GlAttribute(p_attrib, buffer);
        if (size)
            ret.size = size;
        if (type)
            ret.type = type;
        if (normalized)
            ret.normalized = normalized;
        return ret;
    };
    /** bind this attibute to targetBuffer */
    GlAttribute.prototype.bind = function () {
        // this lets us get ready to send data to the target buffer      
        gl.bindBuffer(this.targetBuffer, this.buffer);
        gl.enableVertexAttribArray(this.index);
        gl.vertexAttribPointer(this.index, this.size, this.type, this.normalized, this.stride, this.offset);
    };
    /** buffer this attribues data */
    GlAttribute.prototype.buff = function () {
        // sends data to the target buffer
        // note that the target buffer is shared (e.g. gl.ARRAY_BUFFER)
        // so we need to bind it first (by calling this.bind()) 
        gl.bufferData(this.targetBuffer, this.data, this.usage);
    };
    /** bind this attibute to targetBuffer and buffer the data */
    GlAttribute.prototype.bindBuff = function () {
        // this just helps us to bind the buffer and then immediately
        // buffer data without accidentally un-binding the buffer 
        this.bind();
        this.buff();
    };
    return GlAttribute;
}());
var GlVector = (function () {
    function GlVector() {
    }
    GlVector.cross = function (a, b) {
        return new Float32Array([
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ]);
    };
    GlVector.subtract = function (a, b) {
        return new Float32Array([
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
        ]);
    };
    GlVector.normalize = function (v) {
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we dont divide by zero
        return (length < 0.00001)
            ? new Float32Array([0, 0, 0])
            : new Float32Array([
                v[0] / length,
                v[1] / length,
                v[2] / length
            ]);
    };
    return GlVector;
}());
/// <reference path="GlVector.ts" />
var GlCamera = (function () {
    function GlCamera() {
    }
    GlCamera.lookAt = function (cameraPosition, target, up) {
        var zAxis = GlVector.normalize(GlVector.subtract(new Float32Array(cameraPosition), new Float32Array(target)));
        var xAxis = GlVector.cross(new Float32Array(up), zAxis);
        var yAxis = GlVector.cross(zAxis, xAxis);
        return new Float32Array([
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0], cameraPosition[1], cameraPosition[2], 1
        ]);
    };
    return GlCamera;
}());
var GlInit = (function () {
    function GlInit() {
    }
    /** Compiles shader source code */
    GlInit.compileShader = function (gl, shaderSource, shaderType) {
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            throw ("could not compile shader: " + gl.getShaderInfoLog(shader));
        }
        return shader;
    };
    /** Creates a WebGL program from 2 shaders */
    GlInit.createProgram = function (gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw ("program failed to link: " + gl.getProgramInfoLog(program));
        }
        return program;
    };
    /** Creates a shader from the content of a script tag */
    GlInit.createShaderFromScript = function (gl, scriptId, opt_shaderType) {
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw ("Error: unknown script element " + scriptId);
        }
        var shaderSource = shaderScript.text;
        if (!opt_shaderType) {
            if (shaderScript.type === "x-shader/x-vertex")
                opt_shaderType = gl.VERTEX_SHADER;
            else if (shaderScript.type === "x-shader/x-fragment")
                opt_shaderType = gl.FRAGMENT_SHADER;
            else
                throw ("Error: shader type not set");
        }
        return this.compileShader(gl, shaderSource, opt_shaderType);
    };
    /** Create a WebGLProgram from 2 script tags */
    GlInit.createProgramFromScripts = function (gl, vertexShaderId, fragmentShaderId) {
        var vertexShader = this.createShaderFromScript(gl, vertexShaderId, gl.VERTEX_SHADER);
        var fragmentShader = this.createShaderFromScript(gl, fragmentShaderId, gl.FRAGMENT_SHADER);
        return this.createProgram(gl, vertexShader, fragmentShader);
    };
    /** Creates a WebGLRenderingContext from a canvas tag */
    GlInit.createGlContext = function (canvas) {
        var gl = canvas.getContext("webgl");
        if (!gl) {
            throw ("No WebGL for you!");
        }
        return gl;
    };
    return GlInit;
}());
var GlMatrix2D = (function () {
    function GlMatrix2D() {
    }
    GlMatrix2D.identity = function () {
        return new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
    };
    // return a projection matrix
    // note that this flips the Y axis so that 0 is at the top
    GlMatrix2D.projection = function (width, height) {
        return new Float32Array([
            2 / width, 0, 0,
            0, -2 / height, 0,
            -1, 1, 1
        ]);
    };
    GlMatrix2D.translation = function (tx, ty) {
        return new Float32Array([
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1
        ]);
    };
    GlMatrix2D.rotation = function (angle) {
        var rad = angle * Math.PI / 180;
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return new Float32Array([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]);
    };
    GlMatrix2D.scale = function (sx, sy) {
        return new Float32Array([
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ]);
    };
    GlMatrix2D.matrixMultiply = function (a, b) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
        return new Float32Array([a00 * b00 + a01 * b10 + a02 * b20,
            a00 * b01 + a01 * b11 + a02 * b21,
            a00 * b02 + a01 * b12 + a02 * b22,
            a10 * b00 + a11 * b10 + a12 * b20,
            a10 * b01 + a11 * b11 + a12 * b21,
            a10 * b02 + a11 * b12 + a12 * b22,
            a20 * b00 + a21 * b10 + a22 * b20,
            a20 * b01 + a21 * b11 + a22 * b21,
            a20 * b02 + a21 * b12 + a22 * b22]);
    };
    return GlMatrix2D;
}());
var GlMatrix3D = (function () {
    function GlMatrix3D() {
    }
    GlMatrix3D.identity = function () {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    };
    // return a projection matrix
    // note that this flips the Y axis so that 0 is at the top
    GlMatrix3D.projection = function (width, height, depth) {
        return new Float32Array([
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1
        ]);
    };
    GlMatrix3D.perspective = function (fov, aspect, near, far) {
        var fovRad = fov * Math.PI / 180;
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad);
        var rangeInv = 1.0 / (near - far);
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    };
    GlMatrix3D.translation = function (tx, ty, tz) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ]);
    };
    GlMatrix3D.rotationX = function (angle) {
        var rad = angle * Math.PI / 180;
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return new Float32Array([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    };
    GlMatrix3D.rotationY = function (angle) {
        var rad = angle * Math.PI / 180;
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return new Float32Array([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
    };
    GlMatrix3D.rotationZ = function (angle) {
        var rad = angle * Math.PI / 180;
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return new Float32Array([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    };
    GlMatrix3D.scale = function (sx, sy, sz) {
        return new Float32Array([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ]);
    };
    GlMatrix3D.multiply = function (a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return new Float32Array([a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
            a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
            a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
            a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
            a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
            a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
            a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
            a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
            a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
            a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
            a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
            a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
            a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
            a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
            a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
            a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33
        ]);
    };
    GlMatrix3D.inverse = function (m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;
        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return new Float32Array([
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ]);
    };
    return GlMatrix3D;
}());
var util = (function () {
    function util() {
    }
    util.randomInt = function (range) {
        return Math.floor(Math.random() * range);
    };
    util.randomColor = function (doUpdate) {
        return new Uint8Array([Math.random(), Math.random(), Math.random(), 1]);
    };
    util.radToDeg = function (r) {
        return r * 180 / Math.PI;
    };
    util.degToRad = function (d) {
        return d * Math.PI / 180;
    };
    return util;
}());
/// <reference path="GlInit.ts" />
/// <reference path="util.ts" />
/// <reference path="GlAttribute.ts" />
/// <reference path="GlCamera.ts" />
// --- constants
var x = 0, y = 1, z = 2;
// --- initialization
var canvas = document.getElementById("gl-canvas");
var gl = GlInit.createGlContext(canvas);
var program = GlInit.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
// get uniforms
var u_resolution = gl.getUniformLocation(program, "u_resolution");
var u_matrix = gl.getUniformLocation(program, "u_matrix");
// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
// get attributes
var a_position = GlAttribute.get(program, "a_position");
var a_color = GlAttribute.get(program, "a_color", 3, gl.UNSIGNED_BYTE, true); // RGB bytes
// set the geometry
setGeometry();
// set colors
setColors();
// perspective
var fov = 60; // we can edit fov, but the others will stay static
var zNear = 1;
var zFar = 2000;
var aspect = canvas.clientWidth / canvas.clientHeight;
// camera
var cameraAngle = 0;
var lockedOn = true;
// initialize inputs
var cameraAngle_input = document.getElementById("gl-cameraAngle");
var lockedOn_input = document.getElementById("gl-lockedOn");
cameraAngle_input.value = String(cameraAngle);
lockedOn_input.checked = lockedOn;
drawScene();
function drawScene() {
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var fCount = 5;
    var radius = 200;
    // compute projection matrix
    var mat_projection = GlMatrix3D.perspective(fov, aspect, zNear, zFar);
    // compute the camera's matrix
    var mat_camera = GlMatrix3D.translation(0, 0, radius * 1.5);
    mat_camera = GlMatrix3D.multiply(mat_camera, GlMatrix3D.rotationY(cameraAngle));
    if (lockedOn) {
        // extract the camera's position from the matrix
        var cameraPosition = [mat_camera[12], mat_camera[13], mat_camera[14]];
        // compute the position of the first 'F'
        var fPosition = [radius, 0, 0];
        var up = [0, 1, 0];
        // make the camera look at the first 'F'
        mat_camera = GlCamera.lookAt(cameraPosition, fPosition, up);
    }
    // make a view matrix from the inverse of the camera
    var mat_view = GlMatrix3D.inverse(mat_camera);
    for (var i = 0; i < fCount; i++) {
        var angle = i * Math.PI * 2 / fCount;
        var x_1 = Math.cos(angle) * radius;
        var z_1 = Math.sin(angle) * radius;
        var mat_translation = GlMatrix3D.translation(x_1, 0, z_1);
        // multiply the matrices
        var mat = mat_translation;
        mat = GlMatrix3D.multiply(mat, mat_view);
        mat = GlMatrix3D.multiply(mat, mat_projection);
        // set the matrix
        gl.uniformMatrix4fv(u_matrix, false, mat);
        // and draw the geometry
        gl.drawArrays(gl.TRIANGLES, 0, (a_position.data.length / a_position.size));
    }
}
function update() {
    cameraAngle = Number(cameraAngle_input.value);
    lockedOn = lockedOn_input.checked;
    drawScene();
}
function setColors() {
    a_color.data = new Uint8Array([
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        // top rung front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        // middle rung front
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        200, 70, 120,
        // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220]);
    a_color.bindBuff();
}
function setGeometry() {
    // set up the scene
    var positions = [
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,
        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,
        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,
        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,
        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,
        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,
        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,
        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,
        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,
        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,
        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,
        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,
        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,
        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,
        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,
        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0];
    // flip this so that +Y is up
    // we started in 2d where +Y was down..
    var mat = GlMatrix3D.translation(-50, -75, -15);
    mat = GlMatrix3D.multiply(mat, GlMatrix3D.rotationX(util.radToDeg(Math.PI)));
    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = matrixVectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], mat);
        positions[ii + 0] = vector[0];
        positions[ii + 1] = vector[1];
        positions[ii + 2] = vector[2];
    }
    a_position.data = new Float32Array(positions);
    a_position.bindBuff();
}
function matrixVectorMultiply(v, m) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
        dst[i] = 0.0;
        for (var j = 0; j < 4; ++j)
            dst[i] += v[j] * m[j * 4 + i];
    }
    return dst;
}
;
//# sourceMappingURL=index.js.map