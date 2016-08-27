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


// perspective
let fov = 60; // we can edit fov, but the others will stay static
const zNear = 1;
const zFar = 2000;
const aspect = canvas.clientWidth / canvas.clientHeight;

// camera
let cameraAngle = 0;

// initialize inputs
let cameraAngle_input = <HTMLInputElement> document.getElementById("gl-cameraAngle");
cameraAngle_input.value = String(cameraAngle);



drawScene();

function drawScene() {
    // clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let fCount = 5;
    let radius = 200;

    // compute projection matrix
    let mat_projection = GlMatrix3D.perspective(fov, aspect, zNear, zFar);
    
    // compute the camera's matrix
    let mat_camera = GlMatrix3D.translation(0, 0, radius * 1.5);
    mat_camera = GlMatrix3D.multiply(mat_camera, GlMatrix3D.rotationY(cameraAngle));

    // make a view matrix from the inverse of the camera
    let mat_view = GlMatrix3D.inverse(mat_camera);
    
    for (let i = 0; i < fCount; i++) {
        let angle = i * Math.PI * 2 / fCount;

        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;
        let mat_translation = GlMatrix3D.translation(x, 0, z);
        
        // multiply the matrices
        let mat = mat_translation;
        mat = GlMatrix3D.multiply(mat, mat_view)
        mat = GlMatrix3D.multiply(mat, mat_projection);

        // set the matrix
        gl.uniformMatrix4fv(u_matrix, false, mat);

        // and draw the geometry
        gl.drawArrays(gl.TRIANGLES, 0, (a_position.data.length / a_position.size))
    }
  
}

function update() {
    cameraAngle = Number(cameraAngle_input.value);

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
    let positions = [
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
          0, 150,   0];

    // flip this so that +Y is up
    // we started in 2d where +Y was down..
    let mat = GlMatrix3D.translation(-50, -75, -15);
    mat = GlMatrix3D.multiply(mat, GlMatrix3D.rotationX(util.radToDeg(Math.PI)));

    for (let ii = 0; ii < positions.length; ii += 3) {
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
};