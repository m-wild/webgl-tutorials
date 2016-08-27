/** GlAttribute class for managing WebGL attribues */
class GlAttribute {
    constructor(
        public index: number,
        public buffer: WebGLBuffer,
        public size: number
    ){}
    public normalized: boolean = false;
    public type: number = gl.FLOAT;
    public stride: number = 0;
    public offset: number = 0;
    public data: Float32Array;
    public usage: number = gl.STATIC_DRAW;
    public targetBuffer: number = gl.ARRAY_BUFFER;

    /** get a webgl attribute
     * @param  program  the webgl program
     * @param  name     the attribute name
     * @param  size     size of data in the attribute   
     */
    public static get(program: WebGLProgram, name: string, size: number) : GlAttribute {
        let p_attrib = gl.getAttribLocation(program, name);
        let buffer = gl.createBuffer();

        return new GlAttribute(p_attrib, buffer, size);
    }

    /** bind this attibute to targetBuffer */
    public bind(): void {
        gl.bindBuffer(this.targetBuffer, this.buffer);
        gl.enableVertexAttribArray(this.index);
        gl.vertexAttribPointer(this.index, this.size, this.type, this.normalized, this.stride, this.offset);
    }

    /** buffer this attribues data */
    public buff(): void {
        gl.bufferData(this.targetBuffer, this.data, this.usage)
    }

    /** bind this attibute to targetBuffer and buffer the data */
    public bindBuff(): void {
        this.bind();
        this.buff();
    }

}