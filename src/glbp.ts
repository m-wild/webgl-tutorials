class glbp {

    /** Compiles shader source code */
    public static compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number): WebGLShader {
        let shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            throw(`could not compile shader: ${gl.getShaderInfoLog(shader)}`);
        }

        return shader;
    }

    /** Creates a WebGL program from 2 shaders */
    public static createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram {
        let program = gl.createProgram();
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        let success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!success) {
            throw(`program failed to link: ${gl.getProgramInfoLog(program)}`);
        }

        return program;
    }


    /** Creates a shader from the content of a script tag */
    public static createShaderFromScript(gl: WebGLRenderingContext, scriptId: string, opt_shaderType: number) : WebGLShader {
        let shaderScript = <HTMLScriptElement> document.getElementById(scriptId);
        if (!shaderScript) {
            throw(`Error: unknown script element ${scriptId}`);
        }

        let shaderSource = shaderScript.text;

        if (!opt_shaderType) {
            if (shaderScript.type === "x-shader/x-vertex")
                opt_shaderType = gl.VERTEX_SHADER;
            else if (shaderScript.type === "x-shader/x-fragment")
                opt_shaderType = gl.FRAGMENT_SHADER;
            else 
                throw("Error: shader type not set");
        }
        
        return this.compileShader(gl, shaderSource, opt_shaderType);
    }


    /** Create a WebGLProgram from 2 script tags */
    public static createProgramFromScripts(gl: WebGLRenderingContext, vertexShaderId: string, fragmentShaderId: string) : WebGLProgram {
        let vertexShader = this.createShaderFromScript(gl, vertexShaderId, gl.VERTEX_SHADER);
        let fragmentShader = this.createShaderFromScript(gl, fragmentShaderId, gl.FRAGMENT_SHADER);
        
        return this.createProgram(gl, vertexShader, fragmentShader);
    }


    /** Creates a WebGLRenderingContext from a canvas tag */
    public static createGlContext(canvasId: string) : WebGLRenderingContext {
        let canvas = <HTMLCanvasElement>document.getElementById(canvasId);
        let gl = <WebGLRenderingContext>canvas.getContext("webgl");
        if (!gl) {
            throw("No WebGL for you!");
        }

        return gl;
    }


    /** Creates a uniform setter function for the provided uniformInfo */
    private static createUniformSetter(program: WebGLProgram, uniformInfo: WebGLActiveInfo) 
        : (any) => void {
        let location = gl.getUniformLocation(program, uniformInfo.name);
        let type = uniformInfo.type;

        let isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");

        switch (type) {

            // float
            case gl.FLOAT:
                return (isArray)
                    ? (v: Float32Array) => gl.uniform1fv(location, v)
                    : (v: number) => gl.uniform1f(location, v);
            case gl.FLOAT_VEC2:
                return (v: Float32Array) => gl.uniform2fv(location, v);
            case gl.FLOAT_VEC3:
                return (v: Float32Array) => gl.uniform3fv(location, v);
            case gl.FLOAT_VEC4:
                return (v: Float32Array) => gl.uniform4fv(location, v);
            
            // int
            case gl.INT:
                return (isArray)
                    ? (v: Float32Array) => gl.uniform1fv(location, v)
                    : (v: number) => gl.uniform1f(location, v);
            case gl.INT_VEC2:
                return (v: Float32Array) => gl.uniform2iv(location, v);
            case gl.INT_VEC3:
                return (v: Float32Array) => gl.uniform3iv(location, v);
            case gl.INT_VEC4:
                return (v: Float32Array) => gl.uniform4iv(location, v);

            // bool
            case gl.BOOL:
                return (v: Int32Array) => gl.uniform1iv(location, v);
            case gl.BOOL_VEC2:
                return (v: Int32Array) => gl.uniform2iv(location, v);
            case gl.BOOL_VEC3:
                return (v: Int32Array) => gl.uniform3iv(location, v);
            case gl.BOOL_VEC4:
                return (v: Int32Array) => gl.uniform4iv(location, v);

            // float matrix
            case gl.FLOAT_MAT2:
                return (v: Float32Array) => gl.uniformMatrix2fv(location, false, v);
            case gl.FLOAT_MAT3:
                return (v: Float32Array) => gl.uniformMatrix3fv(location, false, v);
            case gl.FLOAT_MAT4:
                return (v: Float32Array) => gl.uniformMatrix4fv(location, false, v);

            default:
                throw(`unknown type: 0x ${type.toString(16)}`); // should never happen
        }
    }


    public static createUniformSetters(gl: WebGLRenderingContext, program: WebGLProgram) 
            : ((v:any) => void)[] {
        var uniformSetters = new Array<((v: any) => void)>();
        let numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (var i = 0; i < numUniforms; i++) {
            let uniformInfo = gl.getActiveUniform(program, i);
            if (!uniformInfo) {
                break;
            }

            var name = uniformInfo.name;
            if (uniformInfo.name.substr(-3) === "[0]") {
                name = name.substr(0, name.length - 3);
            }
            
            let setter = this.createUniformSetter(program, uniformInfo);
            uniformSetters[name] = setter;
        }

        return uniformSetters;
    }

    /** Set uniforms using uniformSetters and the values to set them to */
    public static setUniforms(setters: ((v: any) => void)[], values: any) : void {
        Object.keys(values).forEach(name => {
            let setter = setters[name];
            if (setter)
                setter(values[name]);
        });
    }


}

