import {DetailedSquare} from "./detailed_square"
import {WavesEffect} from "./waves_effect"
import {Vector, Matrix} from "./math"

const square_size = 1

window.onload = () => {
    let app = new Application(document.getElementById('my_Canvas') as HTMLCanvasElement)
}

class Application {
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.water = new DetailedSquare(square_size, 255)
        this.setup_gl_resources()
        this.setup_matrix()
        this.setup_listeners()
        this.start_rendering()
    }

    private setup_matrix() {
        let to_center = -0.5 * square_size
        let center_m = new Matrix([
            1, 0, 0, to_center,
            0, 1, 0, to_center,
            0, 0, 1,         0,
            0, 0, 0,         1,
        ])

        let center_inv = new Matrix([
            1, 0, 0, -to_center,
            0, 1, 0, -to_center,
            0, 0, 1,          0,
            0, 0, 0,          1,
        ])

        let tilt = Math.PI / 6
        let tilt_c = Math.cos(tilt)
        let tilt_s = Math.sin(tilt)
        let tilt_m = new Matrix([
            1,     0,       0, 0,
            0,tilt_c, -tilt_s, 0,
            0,tilt_s,  tilt_c, 0,
            0,     0,       0, 1,
        ])

        let tilt_inv = new Matrix([
            1,      0,      0, 0,
            0, tilt_c, tilt_s, 0,
            0,-tilt_s, tilt_c, 0,
            0,      0,      0, 1,
        ])

        let max_fov = Math.PI / 6
        let tan_fov = Math.tan(max_fov / 2)
        let tan_fov_x = tan_fov
        let tan_fov_y = tan_fov
        let xy_ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight
        if (xy_ratio < 1) {
            tan_fov_x = tan_fov_x * xy_ratio
        } else {
            tan_fov_y = tan_fov_y / xy_ratio
        }

        let y_proj = square_size * Math.cos(tilt)
        let z_proj = square_size * Math.sin(tilt)

        let dist_fit_x = 0.5 * (square_size / tan_fov_x - z_proj)
        let dist_fit_y = 0.5 * (y_proj / tan_fov_y - z_proj)

        let fit_x = dist_fit_x < dist_fit_y
        let camera_dist = fit_x? dist_fit_x: dist_fit_y

        let little_closer = -0.1
        //camera_dist -= little_closer

        let camera_m = new Matrix([
            1, 0, 0,            0,
            0, 1, 0,            0,
            0, 0, 1,  camera_dist,
            0, 0, 0,            1,
        ])

        let camera_inv = new Matrix([
            1, 0, 0,            0,
            0, 1, 0,            0,
            0, 0, 1, -camera_dist,
            0, 0, 0,            1,
        ])

        let z_min = camera_dist * 0.99 - 0.5 * z_proj
        let z_max = camera_dist * 1.01 + 0.5 * z_proj

        let z_mat = (z_min + z_max) / (z_max - z_min) / z_min
        let zw_mat = - 2 * z_max / (z_max - z_min)
        let w_mat = 1 / z_min

        let x_mat = 1 / tan_fov_x / z_min
        let y_mat = 1 / tan_fov_y / z_min

        let proj_m = new Matrix ([
            x_mat,     0,     0,      0,
                0, y_mat,     0,      0,
                0,     0, z_mat, zw_mat,
                0,     0, w_mat,      0,
        ])

        let proj_inv = new Matrix ([
            1/x_mat,       0,        0,                   0,
                  0, 1/y_mat,        0,                   0,
                  0,       0,        0,             1/w_mat,
                  0,       0, 1/zw_mat, -z_mat/w_mat/zw_mat,
        ])

        this.matrix = proj_m.mul(camera_m).mul(tilt_m).mul(center_m)
        this.inv_matrix = center_inv.mul(tilt_inv).mul(camera_inv).mul(proj_inv)
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

    private mouse_to_world(x: number, y: number): Vector {
        let canvas_r = this.canvas.getBoundingClientRect()
        let canvas_x_y = [x - canvas_r.left, y - canvas_r.top]
        let screen_x_y = [
            canvas_x_y[0] * 2.0 / canvas_r.width - 1.0,
            canvas_x_y[1] * -2.0 / canvas_r.height + 1.0]

        let on_screen = new Vector(screen_x_y[0], screen_x_y[1], -1)
        let in_screen = new Vector(screen_x_y[0], screen_x_y[1], 0)
        let on_scr_world = this.inv_matrix.transform(on_screen)
        let in_scr_world = this.inv_matrix.transform(in_screen)
        let shift = in_scr_world.sub(on_scr_world)
        let factor = -on_scr_world.z / shift.z
        return on_scr_world.add(shift.mul(factor))
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
    private inv_matrix: Matrix;
}
