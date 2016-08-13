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

// get attributes
let a_position = GlAttribute.get(program, "a_position", 2);

// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);





function setGeometry() {
    return new Float32Array([
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
}

function drawScene() {
    // bind the position attribute to gl.ARRAY_BUFFER
    a_position.bind();

    // set up the scene
    a_position.data = setGeometry();
    a_position.buff();


    gl.drawArrays(gl.TRIANGLES, 0, (a_position.data.length / a_position.size));

}



let tx = 0;
let tx_input = <HTMLInputElement> document.getElementById("gl-x");
tx_input.value = String(tx);

let ty = 0;
let ty_input = <HTMLInputElement> document.getElementById("gl-y");
ty_input.value = String(ty);

let r = 0;
let r_input = <HTMLInputElement> document.getElementById("gl-r");
r_input.value = String(r);

let sx = 1;
let sx_input = <HTMLInputElement> document.getElementById("gl-sx");
sx_input.value = String(sx);

let sy = 1;
let sy_input = <HTMLInputElement> document.getElementById("gl-sy");
sy_input.value = String(sy);

function update() {
    tx = Number(tx_input.value);
    ty = Number(ty_input.value);

    let translation = GlMatrix.translation(tx, ty);
    
    r = Number(r_input.value);
    let rotation = GlMatrix.rotation(r);

    sx = Number(sx_input.value);
    sy = Number(sy_input.value);
    let scale = GlMatrix.scale(sx, sy);

    let mat = GlMatrix.matrixMultiply3(scale, rotation, translation);
    
    gl.uniformMatrix3fv(u_matrix, false, mat);

    drawScene();
}


function newColor() {
    gl.uniform4f(u_color, Math.random(), Math.random(), Math.random(), 1);
    update();
}

// set up random color
gl.uniform4f(u_color, Math.random(), Math.random(), Math.random(), 1);

update();

