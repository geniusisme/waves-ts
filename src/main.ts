import {DetailedSquare} from "./detailed_square"
import {WavesEffect} from "./waves_effect"
import {Vector, Matrix} from "./math"



window.onload = () => {
    let app = new Application(document.getElementById('my_Canvas') as HTMLCanvasElement)
}

class Application {
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.water = new DetailedSquare(0.99, 255)
        this.setup_gl_resources()
        this.setup_matrix()
        this.setup_listeners()
        this.start_rendering()
    }

    private setup_matrix() {
        let to_center = -0.5
        let center_m = new Matrix([
            1, 0, 0, to_center,
            0, 1, 0, to_center,
            0, 0, 1,         0,
            0, 0, 0,         1,
        ])

        let tilt = Math.PI / 6.0
        let tilt_c = Math.cos(tilt)
        let tilt_s = Math.sin(tilt)
        let tilt_m = new Matrix([
            1,     0,       0, 0,
            0,tilt_c, -tilt_s, 0,
            0,tilt_s,  tilt_c, 0,
            0,     0,       0, 1,
        ])

        let max_fov = Math.PI / 6
        let tan_fov = Math.tan(max_fov/2)
        let dist_fit_x = 1 / 2 / tan_fov
        let y_size = 1 * Math.cos(tilt)
        let tiled_dist = 1 * Math.sin(tilt) / 2
        let dist_fit_y = y_size / 2 / tan_fov - tiled_dist
        let fit_x = dist_fit_x < dist_fit_y
        let camera_dist = fit_x? dist_fit_x: dist_fit_y
        let little_closer = -0.1
        camera_dist += little_closer

        let camera_m = new Matrix([
            1, 0, 0,            0,
            0, 1, 0,            0,
            0, 0, 1,  camera_dist,
            0, 0, 0,            1,
        ])


        let z_min = camera_dist - 0.5
        let z_max = camera_dist + 0.5

        let z_mat = (z_min + z_max) / (z_max - z_min) / z_min
        let zw_mat = - 2 * z_max
        let w_mat = 1 / z_min

        let fit_width = 1 / tan_fov / z_min
        let xy_ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight

        let x_mat = fit_x? fit_width: fit_width * xy_ratio
        let y_mat = fit_x? fit_width / xy_ratio: fit_width

        let proj_m = new Matrix ([
            x_mat,     0,     0,      0,
                0, y_mat,     0,      0,
                0,     0, z_mat, zw_mat,
                0,     0, w_mat,      0,
        ])

        this.matrix = proj_m.mul(camera_m).mul(tilt_m).mul(center_m)
    }

    private dist_to_fit_in_view(fov: number, size: number): number {
        return size / 2 / Math.tan(fov / 2);
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
            this.waves_effect.set_matrix(this.matrix.transpose())
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
        this.canvas.addEventListener("webglcontextlost", (event: Event) => {
            event.preventDefault()
            window.cancelAnimationFrame(this.frameRequest)
        }, false)

        this.canvas.addEventListener("webglcontextrestored", () => {
            this.setup_gl_resources()
            this.start_rendering()
        }, false)

        this.canvas.addEventListener("mousedown", () => {
            this.mouse_downed_at = performance.now()
        })

        this.canvas.addEventListener("mouseleave", () => {
            this.mouse_downed_at = undefined
        })

        this.canvas.addEventListener("mouseup", (event: Event) => {
            let m_event = event as MouseEvent;
            this.mouse_up(m_event.clientX, m_event.clientY);
        })
    }

    private mouse_up(x: number, y: number) {
        if (!this.mouse_downed_at) {
            return
        }
        let now = performance.now()
        let elapsed = now - this.mouse_downed_at
        this.mouse_downed_at = undefined
        this.waves_effect.add_ripple(
            this.time_to_wave_strengh(elapsed),
            this.mouse_to_world(x, y),
            now
        )
    }

    private time_to_wave_strengh(time: number) {
        let strength = time / 10000.0 + 0.02
        return strength > 0.05? 0.05: strength;
    }

    private mouse_to_world(x: number, y: number): [number, number, number] {
        let canvas_r = this.canvas.getBoundingClientRect()
        let canvas_x_y = [x - canvas_r.left, y - canvas_r.top]
        let screen_x_y = [
            canvas_x_y[0] * 2.0 / canvas_r.width - 1.0,
            canvas_x_y[1] * -2.0 / canvas_r.height + 1.0]

        return [screen_x_y[0], screen_x_y[1], 0]
    }

    private canvas: HTMLCanvasElement
    private vertex_buffer: WebGLBuffer
    private index_buffer: WebGLBuffer
    private gl: WebGLRenderingContext
    private frameRequest: number
    private water: DetailedSquare
    private waves_effect: WavesEffect
    private mouse_downed_at?: number
    private matrix: Matrix
}
