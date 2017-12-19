import * as vs from './vs.vert';
import * as fs from './fs.frag';

export class WavesEffect {
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        let vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertShader, vs);
        this.gl.compileShader(vertShader);

        let fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragShader, fs);
        this.gl.compileShader(fragShader);

        let program = this.gl.createProgram()!;
        this.gl.attachShader(program, vertShader);
        this.gl.attachShader(program, fragShader);
        this.gl.linkProgram(program);

        this.coord_attrib = this.gl.getAttribLocation(program, "coordinates");
        this.time_uniform = this.gl.getUniformLocation(program, "time")!;

        this.program = program;
    }

    set_time(time: number) {
        this.time = time;
    }

    enable() {
        this.gl.useProgram(this.program);
        this.gl.vertexAttribPointer(this.coord_attrib, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.coord_attrib);
        this.gl.uniform1f(this.time_uniform, this.time);
    }

    private time: number;
    private coord_attrib: GLuint;
    private time_uniform: WebGLUniformLocation;
    private program: WebGLProgram;
    private gl: WebGLRenderingContext;
}
