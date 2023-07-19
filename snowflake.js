/**
 * CS435 Elijah Hilty Project #1
 * Draws the Koch Snowflake to an HTML canvas using WebGL.
 * First generates the vertex data recursively using an initial set of vertices,
 * then renders the vertex buffer.
 * 
 * The fragment shader and vertex shader are stored in separate files so this project
 * should be accessed using a web server.
 * 
 * Defines global constants to configure the render such as numTimesToSubdivide and the initial vertices.
 */

"use strict";

let canvas;
let gl;

let positions = [];
let translateLoc;
let positionLoc;

const numTimesToSubdivide = 0;
const rotationMat = rotation(-2*Math.PI/6);
const translation = vec4(0, 0, 0, 0);
const alwaysDrawLine = false;
const vertices = [
    vec2(0.0, 0.8),
    vec2(-0.692820323027551, -0.4),
    vec2(0.6928203230275507, -0.4)
]

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    // Create WebGL context
    gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    // Generate data to render Koch Snowflake
    //

    // Divide each edge of the original triangle
    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i];
        const b = vertices[(i+1) % vertices.length];
        divideEdge(a, b, numTimesToSubdivide);
    }

    // Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load vertex data
    let bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    // Retrieve variable locations and point to vertex data
    positionLoc = gl.getAttribLocation( program, "aPosition" );
    translateLoc = gl.getUniformLocation(program, "uTranslate");
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    render();
};

/**
 * Generates a 2D rotation matrix from an angle
 */
function rotation(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return mat2(cos, -sin, sin, cos);
}

/**
 * Appends vertices to draw a line from a to b to the vertex buffer
 */
function line(a, b) {
    positions.push(a, b);
}

/**
 * Recursively divides an edge to generate vertex data for the Koch snowflake
 */
function divideEdge(a, b, numDivisions) {
    // Draw line if maximum recursion depth reached or "alwaysDrawLine" enabled
    if (alwaysDrawLine || numDivisions === 0) {
        line(a, b);
    }
    if (numDivisions > 0) {
        // Trisect the edge
        // c is closer to a, d is closer to b
        const c = mix(a, b, 1/3);
        const d = mix(a, b, 2/3);
        // Construct equalateral triangle using c and d as base
        const e = add(c, mult(rotationMat, subtract(d, c)));
        // Recurse to new edges
        numDivisions--;
        divideEdge(a, c, numDivisions);
        divideEdge(c, e, numDivisions);
        divideEdge(e, d, numDivisions);
        divideEdge(d, b, numDivisions);
    }
}

function render()
{
    // Set translation and draw vertex data
    gl.uniform4fv(translateLoc, translation);
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, positions.length );
}

function capture() {
    render();
    canvas.toBlob((blob) => {
        saveAs(blob, "capture.png");
    });
}