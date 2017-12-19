import * as vs from './vs.vert';
import * as fs from './fs.frag';

export class WavesEffect {
    constructor(gl: any) {
        this.gl = gl;
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
        this.time_uniform = this.gl.getUniformLocation(shaderProgram, "time");
    }

    set_time(time: number) {
        this.time = time;
    }

    enable() {
        this.gl.vertexAttribPointer(this.coord_attrib, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.coord_attrib);
        this.gl.uniform1f(this.time_uniform, this.time);
    }

    private time: number;
    private coord_attrib: any;
    private time_uniform: any;
    private gl: any;
}