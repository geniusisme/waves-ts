import {DetailedSquare} from "./detailed_square";

import * as vs from './vs.glsl';
import * as fs from './fs.glsl';

class Context {
    canvas: any;
    plane: DetailedSquare;
    vertex_buffer: any;
    index_buffer: any;
    coord_attrib: any;
}

function main() {
    let context = new Context();

    context.canvas = document.getElementById('my_Canvas');
    let gl = context.canvas.getContext('experimental-webgl');

    context.plane = new DetailedSquare(0.3, 100);

    context.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, context.vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, context.plane.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    context.index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, context.plane.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vs);
    gl.compileShader(vertShader);

    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fs);
    gl.compileShader(fragShader);

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    context.coord_attrib = gl.getAttribLocation(shaderProgram, "coordinates");

    gl.viewport(0,0,context.canvas.width,context.canvas.height);

    start_animation(gl, context);
}

window.onload = main;

function start_animation(gl: any, context: Context) {

    function draw_frame() {
        gl.bindBuffer(gl.ARRAY_BUFFER, context.vertex_buffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, context.index_buffer);
        gl.vertexAttribPointer(context.coord_attrib, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(context.coord_attrib);
        gl.clearColor(0.1, 0.5, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawElements(gl.TRIANGLES, context.plane.indices.length, gl.UNSIGNED_SHORT,0);

        requestAnimationFrame(draw_frame);
    }

    draw_frame();
}