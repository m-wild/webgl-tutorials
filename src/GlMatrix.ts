class GlMatrix {



    public static translation(tx: number, ty: number): Float32Array {
        return new Float32Array([
            1, 0, 0,
            0, 1, 0,
            tx, ty, 0
        ]);
    }

    public static rotation(angle: number): Float32Array {
        let rad = angle * Math.PI / 180;
        let c = Math.cos(rad);
        let s = Math.sin(rad);
        return new Float32Array([
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        ]);
    }

    public static scale(sx: number, sy: number): Float32Array {
        return new Float32Array([
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1 
        ]);
    }


    public static matrixMultiply(a: Float32Array, b: Float32Array): Float32Array {
        let a00 = a[0*3+0];
        let a01 = a[0*3+1];
        let a02 = a[0*3+2];
        let a10 = a[1*3+0];
        let a11 = a[1*3+1];
        let a12 = a[1*3+2];
        let a20 = a[2*3+0];
        let a21 = a[2*3+1];
        let a22 = a[2*3+2];
        let b00 = b[0*3+0];
        let b01 = b[0*3+1];
        let b02 = b[0*3+2];
        let b10 = b[1*3+0];
        let b11 = b[1*3+1];
        let b12 = b[1*3+2];
        let b20 = b[2*3+0];
        let b21 = b[2*3+1];
        let b22 = b[2*3+2];
        return new Float32Array([a00 * b00 + a01 * b10 + a02 * b20,
                a00 * b01 + a01 * b11 + a02 * b21,
                a00 * b02 + a01 * b12 + a02 * b22,
                a10 * b00 + a11 * b10 + a12 * b20,
                a10 * b01 + a11 * b11 + a12 * b21,
                a10 * b02 + a11 * b12 + a12 * b22,
                a20 * b00 + a21 * b10 + a22 * b20,
                a20 * b01 + a21 * b11 + a22 * b21,
                a20 * b02 + a21 * b12 + a22 * b22]);
        }


    public static matrixMultiply3(a: Float32Array, b: Float32Array, c: Float32Array): Float32Array {
        return this.matrixMultiply(this.matrixMultiply(a, b), c);
    }

}