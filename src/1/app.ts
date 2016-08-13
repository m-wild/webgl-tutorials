/// <reference path="GlInit.ts" />
/// <reference path="util.ts" />
/// <reference path="GlAttribute.ts" />
/// <reference path="GlMatrix.ts" />


// --- initialization

let gl = GlInit.createGlContext("gl-canvas");
let program = GlInit.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// get uniforms
let u_resolution = gl.getUniformLocation(program, "u_resolution");
let u_color = gl.getUniformLocation(program, "u_color");
let u_matrix = gl.getUniformLocation(program, "u_matrix");

// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);


// get attributes
let a_position = GlAttribute.get(program, "a_position", 2);

// set the geometry
setGeometry();

newColor(false);

let translation = [100, 100];
let rotation = 0;
let scale = [1, 1];

// initialize inputs
let tx_input = <HTMLInputElement> document.getElementById("gl-tx");
let ty_input = <HTMLInputElement> document.getElementById("gl-ty");
let r_input = <HTMLInputElement> document.getElementById("gl-r");
let sx_input = <HTMLInputElement> document.getElementById("gl-sx");
let sy_input = <HTMLInputElement> document.getElementById("gl-sy");

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
    let mat_t = GlMatrix.translation(translation[0], translation[1]);
    let mat_r = GlMatrix.rotation(rotation);
    let mat_s = GlMatrix.scale(scale[0], scale[1]);

    // move origin to centre
    var mat = GlMatrix.translation(-50, -75);
    
    // multiply matrices
    mat = GlMatrix.matrixMultiply(mat, mat_s)
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

function newColor(doUpdate: boolean): void {
    gl.uniform4f(u_color, Math.random(), Math.random(), Math.random(), 1);
    if (doUpdate) update();
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