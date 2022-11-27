export const fragmentShaderSource = `# version 300 es
  precision highp float;
  
  in vec2 vTextureCoord;
  out vec4 fragColor;
  
  // uniform sampler2D uSampler;
  // uniform vec4 uColorShift;
  // uniform bool bAlter;

  void main() {
    // vec4 original = texture(uSampler, vTextureCoord);
    fragColor = vec4(1, 0, 0, 1);
  }
`

export const vertexShaderSource = `# version 300 es
  in vec2 aVertexPosition;
  in vec2 aTextureCoord;

  out vec2 vTextureCoord;

  uniform vec2 uResolution;
  // uniform vec2 uZoomOrigin;
  
  void main() {
    vec2 translated = aVertexPosition + uResolution / 2.0;
    vec2 clipSpace = translated / uResolution * 2.0 - 1.0;
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`
