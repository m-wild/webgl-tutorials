/** GlAttribute class for managing WebGL attribues */
var GlAttribute = (function () {
    function GlAttribute(index, buffer, size) {
        this.index = index;
        this.buffer = buffer;
        this.size = size;
        this.normalized = false;
        this.type = gl.FLOAT;
        this.stride = 0;
        this.offset = 0;
        this.usage = gl.STATIC_DRAW;
        this.targetBuffer = gl.ARRAY_BUFFER;
    }
    /** get a webgl attribute
     * @param  program  the webgl program
     * @param  name     the attribute name
     * @param  size     size of data in the attribute
     */
    GlAttribute.get = function (program, name, size) {
        var p_attrib = gl.getAttribLocation(program, name);
        var buffer = gl.createBuffer();
        return new GlAttribute(p_attrib, buffer, size);
    };
    /** bind this attibute to targetBuffer */
    GlAttribute.prototype.bind = function () {
        gl.bindBuffer(this.targetBuffer, this.buffer);
        gl.enableVertexAttribArray(this.index);
        gl.vertexAttribPointer(this.index, this.size, this.type, this.normalized, this.stride, this.offset);
    };
    /** buffer this attribues data */
    GlAttribute.prototype.buff = function () {
        gl.bufferData(this.targetBuffer, this.data, this.usage);
    };
    /** bind this attibute to targetBuffer and buffer the data */
    GlAttribute.prototype.bindBuff = function () {
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
    GlInit.createGlContext = function (canvasId) {
        var canvas = document.getElementById(canvasId);
        var gl = canvas.getContext("webgl");
        if (!gl) {
            throw ("No WebGL for you!");
        }
        return gl;
    };
    return GlInit;
}());
var GlMatrix = (function () {
    function GlMatrix() {
    }
    GlMatrix.identity = function () {
        return new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);
    };
    GlMatrix.translation = function (tx, ty) {
        return new Float32Array([
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1
        ]);
    };
    GlMatrix.rotation = function (angle) {
        var rad = angle * Math.PI / 180;
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        return new Float32Array([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]);
    };
    GlMatrix.scale = function (sx, sy) {
        return new Float32Array([
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ]);
    };
    GlMatrix.matrixMultiply = function (a, b) {
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
    GlMatrix.matrixMultiply3 = function (a, b, c) {
        return this.matrixMultiply(this.matrixMultiply(a, b), c);
    };
    GlMatrix.matrixMultiply4 = function (a, b, c, d) {
        return this.matrixMultiply(this.matrixMultiply(this.matrixMultiply(a, b), c), d);
    };
    return GlMatrix;
}());
var util = (function () {
    function util() {
    }
    util.randomInt = function (range) {
        return Math.floor(Math.random() * range);
    };
    return util;
}());
/// <reference path="GlInit.ts" />
/// <reference path="util.ts" />
/// <reference path="GlAttribute.ts" />
/// <reference path="GlMatrix.ts" />
// --- initialization
var gl = GlInit.createGlContext("gl-canvas");
var program = GlInit.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// get uniforms
var u_resolution = gl.getUniformLocation(program, "u_resolution");
var u_color = gl.getUniformLocation(program, "u_color");
var u_matrix = gl.getUniformLocation(program, "u_matrix");
// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
// get attributes
var a_position = GlAttribute.get(program, "a_position", 2);
// set the geometry
setGeometry();
newColor(false);
var translation = [100, 100];
var rotation = 0;
var scale = [1, 1];
// initialize inputs
var tx_input = document.getElementById("gl-tx");
var ty_input = document.getElementById("gl-ty");
var r_input = document.getElementById("gl-r");
var sx_input = document.getElementById("gl-sx");
var sy_input = document.getElementById("gl-sy");
tx_input.value = String(translation[0]);
ty_input.value = String(translation[1]);
r_input.value = String(rotation);
sx_input.value = String(scale[0]);
sy_input.value = String(scale[1]);
drawScene();
function drawScene() {
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // compute matrices
    var mat_t = GlMatrix.translation(translation[0], translation[1]);
    var mat_r = GlMatrix.rotation(rotation);
    var mat_s = GlMatrix.scale(scale[0], scale[1]);
    // move origin to centre
    var mat = GlMatrix.translation(-50, -75);
    // multiply matrices
    mat = GlMatrix.matrixMultiply(mat, mat_s);
    mat = GlMatrix.matrixMultiply(mat, mat_r);
    mat = GlMatrix.matrixMultiply(mat, mat_t);
    gl.uniformMatrix3fv(u_matrix, false, mat);
    gl.drawArrays(gl.TRIANGLES, 0, (a_position.data.length / a_position.size));
}
function update() {
    translation[0] = Number(tx_input.value);
    translation[1] = Number(ty_input.value);
    rotation = Number(r_input.value);
    scale[0] = Number(sx_input.value);
    scale[1] = Number(sy_input.value);
    drawScene();
}
function newColor(doUpdate) {
    gl.uniform4f(u_color, Math.random(), Math.random(), Math.random(), 1);
    if (doUpdate)
        update();
}
function setGeometry() {
    // set up the scene
    a_position.data = new Float32Array([
        // left column
        0, 0,
        30, 0,
        0, 150,
        0, 150,
        30, 0,
        30, 150,
        // top rung
        30, 0,
        100, 0,
        30, 30,
        30, 30,
        100, 0,
        100, 30,
        // middle rung
        30, 60,
        67, 60,
        30, 90,
        30, 90,
        67, 60,
        67, 90
    ]);
    a_position.bindBuff();
}
//# sourceMappingURL=index.js.map