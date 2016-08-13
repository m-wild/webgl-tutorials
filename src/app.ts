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

// get attributes
let a_position = GlAttribute.get(program, "a_position", 2);


// set resolution
gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);





// create a rectangle
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    return new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]);
}

// bind the position attribute to gl.ARRAY_BUFFER
a_position.bind();

// buffer 50 random rectangles in random colors
for (var ii = 0; ii < 50; ++ii) {


    // set up random rectangle
    a_position.data = setRectangle(gl, util.randomInt(300), util.randomInt(300), util.randomInt(300), util.randomInt(300));
    a_position.buff();

    // set up random color
    gl.uniform4f(u_color, Math.random(), Math.random(), Math.random(), 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
