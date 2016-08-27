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
    GlMatrix3D.matrixMultiply = function (a, b) {
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
            a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33]);
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
    return util;
}());
/// <reference path="GlInit.ts" />
/// <reference path="util.ts" />
/// <reference path="GlAttribute.ts" />
/// <reference path="GlMatrix2D.ts" />
// --- constants
var x = 0, y = 1, z = 2;
// --- initialization
var canvas = document.getElementById("gl-canvas");
var gl = GlInit.createGlContext(canvas);
var program = GlInit.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
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
var translation = [150, 150, 0];
var rotation = [20, 10, 340];
var scale = [1, 1, 1];
// initialize inputs
var tx_input = document.getElementById("gl-tx");
var ty_input = document.getElementById("gl-ty");
var tz_input = document.getElementById("gl-tz");
var rx_input = document.getElementById("gl-rx");
var ry_input = document.getElementById("gl-ry");
var rz_input = document.getElementById("gl-rz");
var sx_input = document.getElementById("gl-sx");
var sy_input = document.getElementById("gl-sy");
var sz_input = document.getElementById("gl-sz");
tx_input.value = String(translation[x]);
ty_input.value = String(translation[y]);
tz_input.value = String(translation[z]);
rx_input.value = String(rotation[x]);
ry_input.value = String(rotation[y]);
rz_input.value = String(rotation[z]);
sx_input.value = String(scale[x]);
sy_input.value = String(scale[y]);
sz_input.value = String(scale[z]);
drawScene();
function drawScene() {
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // compute matrices
    var mat_p = GlMatrix3D.projection(canvas.clientWidth, canvas.clientHeight, 400);
    var mat_t = GlMatrix3D.translation(translation[x], translation[y], translation[z]);
    var mat_rx = GlMatrix3D.rotationX(rotation[x]);
    var mat_ry = GlMatrix3D.rotationY(rotation[y]);
    var mat_rz = GlMatrix3D.rotationZ(rotation[z]);
    var mat_s = GlMatrix3D.scale(scale[x], scale[y], scale[z]);
    // move origin to centre
    var mat = GlMatrix3D.translation(-50, -75, 0);
    // multiply matrices
    mat = GlMatrix3D.matrixMultiply(mat, mat_s);
    mat = GlMatrix3D.matrixMultiply(mat, mat_rx);
    mat = GlMatrix3D.matrixMultiply(mat, mat_ry);
    mat = GlMatrix3D.matrixMultiply(mat, mat_rz);
    mat = GlMatrix3D.matrixMultiply(mat, mat_t);
    mat = GlMatrix3D.matrixMultiply(mat, mat_p);
    gl.uniformMatrix4fv(u_matrix, false, mat);
    gl.drawArrays(gl.TRIANGLES, 0, (a_position.data.length / a_position.size));
}
function update() {
    translation[x] = Number(tx_input.value);
    translation[y] = Number(ty_input.value);
    translation[z] = Number(tz_input.value);
    rotation[x] = Number(rx_input.value);
    rotation[y] = Number(ry_input.value);
    rotation[z] = Number(rz_input.value);
    scale[x] = Number(sx_input.value);
    scale[y] = Number(sy_input.value);
    scale[z] = Number(sz_input.value);
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
    a_position.data = new Float32Array([
        // left column front
        0, 0, 0,
        30, 0, 0,
        0, 150, 0,
        0, 150, 0,
        30, 0, 0,
        30, 150, 0,
        // top rung front
        30, 0, 0,
        100, 0, 0,
        30, 30, 0,
        30, 30, 0,
        100, 0, 0,
        100, 30, 0,
        // middle rung front
        30, 60, 0,
        67, 60, 0,
        30, 90, 0,
        30, 90, 0,
        67, 60, 0,
        67, 90, 0,
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
        30, 30, 30,
        30, 60, 30,
        30, 30, 0,
        30, 60, 30,
        30, 60, 0,
        // top of middle rung
        30, 60, 0,
        30, 60, 30,
        67, 60, 30,
        30, 60, 0,
        67, 60, 30,
        67, 60, 0,
        // right of middle rung
        67, 60, 0,
        67, 60, 30,
        67, 90, 30,
        67, 60, 0,
        67, 90, 30,
        67, 90, 0,
        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,
        // right of bottom
        30, 90, 0,
        30, 90, 30,
        30, 150, 30,
        30, 90, 0,
        30, 150, 30,
        30, 150, 0,
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
        0, 150, 0]);
    a_position.bindBuff();
}
// nightmare fuel
function newColor() {
    a_color.data = new Uint8Array([
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // top rung front
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // middle rung front
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // left column back
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // top rung back
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // middle rung back
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // top
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // top rung right
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // under top rung
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // between top rung and middle
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // top of middle rung
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // right of middle rung
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // bottom of middle rung.
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // right of bottom
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // bottom
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        // left side
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255,
        Math.random() * 255, Math.random() * 255, Math.random() * 255]);
    a_color.bindBuff();
    update();
}
//# sourceMappingURL=index.js.map