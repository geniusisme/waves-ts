export class DetailedSquare {
    constructor(width: number, details: number) {

        let atom = width / details;
        this.details = details;

        this.vertices = new Float32Array((details + 1) * (details + 1) * 3);
        for (let row = 0; row <= details; ++row) {
            for (let col = 0; col <= details; ++col) {
                let x = col * atom;
                let y = row * atom;
                let z = 0;
                let idx = this.index(row, col) * 3;
                this.vertices[idx + 0] = x;
                this.vertices[idx + 1] = y;
                this.vertices[idx + 2] = z;
            }
        }

        this.indices = new Uint16Array(details * details * 6);

        let idx_out = 0;

        for (let row = 0; row < details; ++row) {
            for (let col = 0; col < details; ++col) {
                let idx_tl = this.index(row, col);
                let idx_tr = idx_tl + 1;
                let idx_bl = this.index(row + 1, col);
                let idx_br = idx_bl + 1;

                this.indices[idx_out + 0] = idx_tl;
                this.indices[idx_out + 1] = idx_bl;
                this.indices[idx_out + 2] = idx_tr;

                this.indices[idx_out + 3] = idx_tr;
                this.indices[idx_out + 4] = idx_bl;
                this.indices[idx_out + 5] = idx_br;

                idx_out += 6;
            }
        }
    }

    vertices: Float32Array;
    indices: Uint16Array;

    private index(row: number, col: number): number {
        return col + row * (this.details + 1);
    }

    private details: number;
}