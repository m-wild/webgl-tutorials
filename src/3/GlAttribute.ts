/** GlAttribute class for managing WebGL attribues */
class GlAttribute {
    
    constructor(
        public index: number,
        public buffer: WebGLBuffer
    ){}
    
    public size: number = 3;
    public type: number = gl.FLOAT;
    public normalized: boolean = false;
    public stride: number = 0;
    public offset: number = 0;
    public data: any; // data type is determined by this.type, so we have to accept <any>
    public usage: number = gl.STATIC_DRAW;
    public targetBuffer: number = gl.ARRAY_BUFFER;

    /** get a webgl attribute
     * @param  program     the webgl program
     * @param  name        the attribute name
     * @param  size        size of data in the attribute
     * @param  type        the type of data in the attribute
     * @param  normalized  is the data normalized?
     */
    public static get(
            program: WebGLProgram, 
            name: string, 
            size?: number, 
            type?: number,
            normalized?: boolean
        ): GlAttribute 
    {
        let p_attrib = gl.getAttribLocation(program, name);
        let buffer = gl.createBuffer();

        let ret = new GlAttribute(p_attrib, buffer);
        if (size) ret.size = size;
        if (type) ret.type = type;
        if (normalized) ret.normalized = normalized;

        return ret;
    }

    /** bind this attibute to targetBuffer */
    public bind(): void {
        // this lets us get ready to send data to the target buffer      
        gl.bindBuffer(this.targetBuffer, this.buffer);
        gl.enableVertexAttribArray(this.index);
        gl.vertexAttribPointer(this.index, this.size, this.type, this.normalized, this.stride, this.offset);
    }

    /** buffer this attribues data */
    public buff(): void {
        // sends data to the target buffer
        // note that the target buffer is shared (e.g. gl.ARRAY_BUFFER)
        // so we need to bind it first (by calling this.bind()) 
        gl.bufferData(this.targetBuffer, this.data, this.usage)
    }

    /** bind this attibute to targetBuffer and buffer the data */
    public bindBuff(): void {
        // this just helps us to bind the buffer and then immediately
        // buffer data without accidentally un-binding the buffer 
        this.bind();
        this.buff();
    }

}