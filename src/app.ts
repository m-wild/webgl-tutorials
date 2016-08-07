/// <reference path="glbp.ts" />


/*** region initialisation */
let gl = glbp.createGlContext("gl-canvas");
let program = glbp.createProgramFromScripts(gl, "gl-vertexShader", "gl-fragmentShader");
gl.useProgram(program);


let pa_position = gl.getAttribLocation(program, "a_position");

var uniformSetters = glbp.createUniformSetters(gl, program);

var uniforms = {
    u_resolution: [gl.canvas.width, gl.canvas.height],
    // u_color: [Math.random(), Math.random(), Math.random(), 1]
};

glbp.setUniforms(uniformSetters, uniforms);

// create a buffer
var positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);        

// some 2d points
var positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
];
// add them to the buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// enable attribute
gl.enableVertexAttribArray(pa_position);

// specify data format
var size = 2;           // 2 components per iteration
var type = gl.FLOAT;    // 32bit float
var normalize = false;  // dont normalize the data
var stride = 0;         // 0 = move forward size * sizeof(type) each iteration to get the next position
var offset = 0;         // start at beginning of the buffer
gl.vertexAttribPointer(pa_position, size, type, normalize, stride, offset);


// set the viewport
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);



// set resolution
// gl.uniform2f(pu_resolution, gl.canvas.width, gl.canvas.height);

// create a rectangle
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);

}

function randomInt(range) {
    return Math.floor(Math.random() * range);
}

// buffer 50 random rectangles in random colors
for (var ii = 0; ii < 50; ++ii) {
    // set up random rectangle
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    // set up random color
    // gl.uniform4f(pu_color, Math.random(), Math.random(), Math.random(), 1);

    glbp.setUniforms(uniformSetters, { u_color: [Math.random(), Math.random(), Math.random(), 1]})

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
