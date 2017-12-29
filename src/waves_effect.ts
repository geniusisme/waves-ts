import {Vector, Matrix} from './math'

import * as vs from './vs.vert'
import * as fs from './fs.frag'

const max_ripples = 8

export class WavesEffect {
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
        this.setup_program()
        this.setup_initial_ripples()
    }

    private setup_program() {
        let vertShader = this.gl.createShader(this.gl.VERTEX_SHADER)
        this.gl.shaderSource(vertShader, vs)
        this.gl.compileShader(vertShader)

        let fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
        this.gl.shaderSource(fragShader, fs)
        this.gl.compileShader(fragShader)

        let program = this.gl.createProgram()!
        this.gl.attachShader(program, vertShader)
        this.gl.attachShader(program, fragShader)
        this.gl.linkProgram(program)

        this.coord_attrib = this.gl.getAttribLocation(program, "coordinates")
        this.time_uniform = this.gl.getUniformLocation(program, "time")!
        this.amplitudes_uniform = this.gl.getUniformLocation(program, "amplitudes")!
        this.centers_uniform = this.gl.getUniformLocation(program, "centers")!
        this.starts_uniform = this.gl.getUniformLocation(program, "starts")!
        this.matrix_uniform = this.gl.getUniformLocation(program, "matrix")!

        this.program = program
    }

    private setup_initial_ripples() {
        //this.add_ripple(0.03, new Vector(0.5, 0.5, 0.0), 0.0)
    }

    set_time(time: number) {
        this.time = time
    }

    set_matrix(matrix: Matrix) {
        this.matrix = matrix
    }

    add_ripple(amplitude: number, center: Vector, start: number) {
        let next = this.next_ripple
        this.amplitudes[next] = amplitude
        let [x, y, z] = center.coords
        this.centers[next * 3 + 0] = x
        this.centers[next * 3 + 1] = y
        this.centers[next * 3 + 2] = z
        this.starts[next] = start

        this.next_ripple = (next + 1) % max_ripples
    }

    enable() {
        this.gl.useProgram(this.program)
        this.gl.vertexAttribPointer(this.coord_attrib, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.coord_attrib)
        this.gl.uniform1f(this.time_uniform, this.time)
        this.gl.uniform1fv(this.amplitudes_uniform, this.amplitudes)
        this.gl.uniform3fv(this.centers_uniform, this.centers)
        this.gl.uniform1fv(this.starts_uniform, this.starts)
        this.gl.uniformMatrix4fv(this.matrix_uniform, false, this.matrix.values)
    }

    private time: number
    private matrix: Matrix
    private coord_attrib: GLuint
    private time_uniform: WebGLUniformLocation
    private amplitudes_uniform: WebGLUniformLocation
    private centers_uniform: WebGLUniformLocation
    private starts_uniform: WebGLUniformLocation
    private matrix_uniform: WebGLUniformLocation
    private program: WebGLProgram
    private gl: WebGLRenderingContext

    private amplitudes = new Float32Array(max_ripples)
    private centers = new Float32Array(max_ripples * 3)
    private starts = new Float32Array(max_ripples)
    private next_ripple = 0;
}
