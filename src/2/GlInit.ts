class GlInit {

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
    public static createGlContext(canvas: HTMLCanvasElement) : WebGLRenderingContext {
        let gl = <WebGLRenderingContext>canvas.getContext("webgl");
        if (!gl) {
            throw("No WebGL for you!");
        }

        return gl;
    }
}
