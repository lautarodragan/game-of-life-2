export const fragmentShaderSource = `# version 300 es
  precision highp float;
  
  uniform sampler2D uSampler;
  
  in vec2 vTextureCoord;
  out vec4 fragColor;

  void main() {
    vec4 original = texture(uSampler, vTextureCoord);
    fragColor = original;
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
