/// <reference path="GlInit.ts" />
/// <reference path="util.ts" />
/// <reference path="GlAttribute.ts" />
/// <reference path="GlMatrix2D.ts" />

// --- constants
const x = 0, y = 1, z = 2;

// --- initialization
let canvas = <HTMLCanvasElement>document.getElementById("gl-canvas");
let gl = GlInit.createGlContext(canvas);
let program = GlInit.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

// get uniforms
let u_resolution = gl.getUniformLocation(program, "u_resolution");
let u_matrix = gl.getUniformLocation(program, "u_matrix");

// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);


// get attributes
let a_position = GlAttribute.get(program, "a_position");
let a_color = GlAttribute.get(program, "a_color", 3, gl.UNSIGNED_BYTE, true); // RGB bytes

// set the geometry
setGeometry();

// set colors
setColors();

let translation = [150, 150, 0];
let rotation = [20, 10, 340];
let scale = [1, 1, 1];
let fudgeFactor = 1;


// initialize inputs
let tx_input = <HTMLInputElement> document.getElementById("gl-tx");
let ty_input = <HTMLInputElement> document.getElementById("gl-ty");
let tz_input = <HTMLInputElement> document.getElementById("gl-tz");
let rx_input = <HTMLInputElement> document.getElementById("gl-rx");
let ry_input = <HTMLInputElement> document.getElementById("gl-ry");
let rz_input = <HTMLInputElement> document.getElementById("gl-rz");
let sx_input = <HTMLInputElement> document.getElementById("gl-sx");
let sy_input = <HTMLInputElement> document.getElementById("gl-sy");
let sz_input = <HTMLInputElement> document.getElementById("gl-sz");
let ff_input = <HTMLInputElement> document.getElementById("gl-ff");

tx_input.value = String(translation[x]);
ty_input.value = String(translation[y]);
tz_input.value = String(translation[z]);
rx_input.value = String(rotation[x]);
ry_input.value = String(rotation[y]);
rz_input.value = String(rotation[z]);
sx_input.value = String(scale[x]);
sy_input.value = String(scale[y]);
sz_input.value = String(scale[z]);
ff_input.value = String(fudgeFactor);


drawScene();

function drawScene() {
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // compute matrices
    let mat_p = GlMatrix3D.projection(canvas.clientWidth, canvas.clientHeight, 400);
    let mat_z2w = GlMatrix3D.zToWMatrix(fudgeFactor);
    let mat_t = GlMatrix3D.translation(translation[x], translation[y], translation[z]);
    let mat_rx = GlMatrix3D.rotationX(rotation[x]);
    let mat_ry = GlMatrix3D.rotationY(rotation[y]);
    let mat_rz = GlMatrix3D.rotationZ(rotation[z]);
    let mat_s = GlMatrix3D.scale(scale[x], scale[y], scale[z]);

    // move origin to centre
    var mat = GlMatrix3D.translation(-50, -75, 0);
    
    // multiply matrices
    mat = GlMatrix3D.matrixMultiply(mat, mat_s)
    mat = GlMatrix3D.matrixMultiply(mat, mat_rx);
    mat = GlMatrix3D.matrixMultiply(mat, mat_ry);
    mat = GlMatrix3D.matrixMultiply(mat, mat_rz);
    mat = GlMatrix3D.matrixMultiply(mat, mat_t);
    mat = GlMatrix3D.matrixMultiply(mat, mat_p);

    // perspective
    mat = GlMatrix3D.matrixMultiply(mat, mat_z2w);

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

    fudgeFactor = Number(ff_input.value);

    drawScene();
}

function setColors() {
    a_color.data = new Uint8Array([   // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // middle rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

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
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0]);

    a_position.bindBuff();
}

