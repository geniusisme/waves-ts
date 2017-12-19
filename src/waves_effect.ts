import * as vs from './vs.vert'
import * as fs from './fs.frag'

const max_ripples = 8

export class WavesEffect {
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl
        this.setup_program()
        this.setup_initial_ripples()
    }

    setup_program() {
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

        this.program = program
    }

    setup_initial_ripples() {
        this.amplitudes = new Float32Array(max_ripples)
        this.centers = new Float32Array(max_ripples * 3)
        this.starts = new Float32Array(max_ripples)

        this.amplitudes[0] = 1.0
        this.starts[0] = 0.0
        this.centers[0] = 0.55
        this.centers[1] = 0.55
        this.centers[2] = 0.00
    }

    set_time(time: number) {
        this.time = time
    }

    enable() {
        this.gl.useProgram(this.program)
        this.gl.vertexAttribPointer(this.coord_attrib, 3, this.gl.FLOAT, false, 0, 0)
        this.gl.enableVertexAttribArray(this.coord_attrib)
        this.gl.uniform1f(this.time_uniform, this.time)
        this.gl.uniform1fv(this.amplitudes_uniform, this.amplitudes)
        this.gl.uniform3fv(this.centers_uniform, this.centers)
        this.gl.uniform1fv(this.starts_uniform, this.starts)
    }

    private time: number
    private coord_attrib: GLuint
    private time_uniform: WebGLUniformLocation
    private amplitudes_uniform: WebGLUniformLocation
    private centers_uniform: WebGLUniformLocation
    private starts_uniform: WebGLUniformLocation
    private program: WebGLProgram
    private gl: WebGLRenderingContext

    private amplitudes: Float32Array
    private centers: Float32Array
    private starts: Float32Array
}
