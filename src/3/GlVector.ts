class GlVector {

    public static cross(a: Float32Array, b: Float32Array): Float32Array {
        return new Float32Array([
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ]);
    }

    public static subtract(a: Float32Array, b: Float32Array): Float32Array  {
        return new Float32Array([
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
        ]);
    }

    public static normalize(v: Float32Array): Float32Array {
        let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we dont divide by zero
        return (length < 0.00001)
            ? new Float32Array([0, 0, 0])
            : new Float32Array([
                v[0] / length,
                v[1] / length,
                v[2] / length
            ]);
    }

}