import {DetailedSquare} from "./detailed_square"
import {WavesEffect} from "./waves_effect"



window.onload = () => {
    let app = new Application(<HTMLCanvasElement> document.getElementById('my_Canvas'))
}

class Application {
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.water = new DetailedSquare(0.3, 100)
        this.setup_gl_resources()
        this.start_rendering()
        this.setup_listeners()
    }

    private setup_gl_resources() {
        this.gl = this.canvas.getContext('webgl')!

        this.vertex_buffer = this.gl.createBuffer()!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.water.vertices, this.gl.DYNAMIC_DRAW)

        this.index_buffer = this.gl.createBuffer()!
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.water.indices, this.gl.STATIC_DRAW)

        this.waves_effect = new WavesEffect(this.gl)

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
    }

    private start_rendering() {
        let render = (time: number) => {

            this.waves_effect.set_time(time)
            this.waves_effect.enable()

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer)
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer)

            this.gl.clearColor(0.3, 0.1, 0.1, 1.0)
            this.gl.clear(this.gl.COLOR_BUFFER_BIT)

            this.gl.drawElements(this.gl.TRIANGLES, this.water.indices.length, this.gl.UNSIGNED_SHORT, 0)

            this.frameRequest = requestAnimationFrame(render)
        }
        render(performance.now())
    }

    private setup_listeners() {
        this.canvas.addEventListener("webglcontextlost", (event: any) => {
            event.preventDefault()
            window.cancelAnimationFrame(this.frameRequest)
        }, false)

        this.canvas.addEventListener("webglcontextrestored", (event: any) => {
            this.setup_gl_resources()
            this.start_rendering()
        }, false)
    }

    private canvas: HTMLCanvasElement
    private vertex_buffer: WebGLBuffer
    private index_buffer: WebGLBuffer
    private gl: WebGLRenderingContext
    private frameRequest: number
    private water: DetailedSquare
    private waves_effect: WavesEffect
}
