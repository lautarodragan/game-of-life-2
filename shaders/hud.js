export const fragmentShaderSource = `# version 300 es
  precision highp float;
  precision highp sampler2DArray;
  
  uniform sampler2DArray uSampler;
  
  in vec2 vTextureCoord;
  out vec4 fragColor;

  void main() {
    fragColor = texture(uSampler, vec3(vTextureCoord, 0));
  }
`

export const vertexShaderSource = `# version 300 es
  precision highp float;
  
  uniform vec2 uResolution;
  
  in vec2 aVertexPosition;
  in vec2 aTextureCoord;
  
  out vec2 vTextureCoord;
  
  void main() {
    vec2 clipSpace = aVertexPosition / uResolution * 2.0 - 1.0;
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`
