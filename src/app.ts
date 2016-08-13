/// <reference path="GlInit.ts" />
/// <reference path="util.ts" />
/// <reference path="GlAttribute.ts" />


// --- initialization

let gl = GlInit.createGlContext("gl-canvas");
let program = GlInit.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// get uniforms
let u_resolution = gl.getUniformLocation(program, "u_resolution");
let u_color = gl.getUniformLocation(program, "u_color");
let u_translation = gl.getUniformLocation(program, "u_translation");

// get attributes
let a_position = GlAttribute.get(program, "a_position", 2);

// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);


let x = 0;
let x_input = <HTMLInputElement> document.getElementById("gl-x");
x_input.value = String(x);

let y = 0;
let y_input = <HTMLInputElement> document.getElementById("gl-y");
y_input.value = String(y);





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


function update() {
    x = Number(x_input.value);
    y = Number(y_input.value);

    gl.uniform2f(u_translation, x, y);

    drawScene(); 
}

// set up random color
gl.uniform4f(u_color, Math.random(), Math.random(), Math.random(), 1);

update();
