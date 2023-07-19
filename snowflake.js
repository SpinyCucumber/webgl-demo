"use strict";

let canvas;
let gl;

const vertices = [
    vec2(0.0, 0.5),
    vec2(0.63, -0.63),
    vec2(-0.63, -0.63)
]

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    // Resize canvas
    resizeCanvas(800, 800);

    // Create WebGL context
    gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) { alert("WebGL 2.0 isn't available"); }

    // Configure WebGL
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load vertex data
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Retrieve variable locations and point to vertex data
    const positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    // Initial render
    render();
};

function resizeCanvas(width, height) {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
}

function render() {
    // Draw vertex data
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, vertices.length);
}

function capture() {
    render();
    canvas.toBlob((blob) => {
        saveAs(blob, "capture.png");
    });
}