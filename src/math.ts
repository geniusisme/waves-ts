export class Vector {
    constructor(x: number, y: number, z: number) {
        this.coords = [x, y, z]
    }

    coords: [number, number, number]

    get x(): number { return this.coords[0] }
    set x(val) { this.coords[0] = val }

    get y(): number { return this.coords[1] }
    set y(val) { this.coords[1] = val }

    get z(): number { return this.coords[2] }
    set z(val) { this.coords[2] = val }
}

export class Matrix {
    constructor(
        values: [
        number, number, number, number,
        number, number, number, number,
        number, number, number, number,
        number, number, number, number] =
        [0, 0, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0]) {

        this.values = Float32Array.from([
            values[ 0], values[ 1], values[ 2], values[ 3],
            values[ 4], values[ 5], values[ 6], values[ 7],
            values[ 8], values[ 9], values[10], values[11],
            values[12], values[13], values[14], values[15]
        ]);
    }

    at(row: number, col: number): number {
        return this.values[this.idx(row, col)]
    }

    put (row: number, col: number, value: number) {
        this.values[this.idx(row, col)] = value
    }

    mul(them: Matrix): Matrix {
        let res = new Matrix()
        for (let row = 0; row < 4; ++row) {
            for (let col = 0; col < 4; ++col) {
                let sum = 0
                for (let prod = 0; prod < 4; ++prod) {
                    sum += this.at(row, prod) * them.at(prod, col)
                }
                res.put(row, col, sum)
            }
        }
        return res
    }

    transpose(): Matrix {
        return new Matrix([
            this.values[0], this.values[4], this.values[8], this.values[12],
            this.values[1], this.values[5], this.values[9], this.values[13],
            this.values[2], this.values[6], this.values[10], this.values[14],
            this.values[3], this.values[7], this.values[11], this.values[15]
        ])
    }

    private idx(row: number, col: number): number {
        return col + row * 4
    }

    readonly values: Float32Array
}