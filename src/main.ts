import {DetailedSquare} from "./detailed_square";

import * as vs from './vs.glsl';
import * as fs from './fs.glsl';

window.onload = () => {
    let app = new Application(document.getElementById('my_Canvas'));
}

class Application {
    constructor(canvas: any) {
        this.canvas = canvas;
        this.water = new DetailedSquare(0.3, 100);
        this.setup_gl_resources();
        this.start_rendering();
        this.setup_listeners();
    }

    private setup_gl_resources() {
        this.gl = this.canvas.getContext('webgl');

        this.vertex_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.water.vertices, this.gl.DYNAMIC_DRAW);

        this.index_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.water.indices, this.gl.STATIC_DRAW);

        let vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertShader, vs);
        this.gl.compileShader(vertShader);

        let fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragShader, fs);
        this.gl.compileShader(fragShader);

        let shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertShader);
        this.gl.attachShader(shaderProgram, fragShader);
        this.gl.linkProgram(shaderProgram);
        this.gl.useProgram(shaderProgram);

        this.coord_attrib = this.gl.getAttribLocation(shaderProgram, "coordinates");

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }

    private start_rendering() {
        let render = () => {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
            this.gl.vertexAttribPointer(this.coord_attrib, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.coord_attrib);
            this.gl.clearColor(0.3, 0.1, 0.1, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.gl.drawElements(this.gl.TRIANGLES, this.water.indices.length, this.gl.UNSIGNED_SHORT, 0);

            this.frameRequest = requestAnimationFrame(render);
        }
        render();
    }

    private setup_listeners() {
        this.canvas.addEventListener("webglcontextlost", (event: any) => {
            event.preventDefault();
            window.cancelAnimationFrame(this.frameRequest);
        }, false);

        this.canvas.addEventListener("webglcontextrestored", (event: any) => {
            this.setup_gl_resources();
            this.start_rendering();
        }, false);
    }

    private canvas: any;
    private vertex_buffer: any;
    private index_buffer: any;
    private coord_attrib: any;
    private gl: any;
    private frameRequest: number;
    private water: DetailedSquare;
}
