export const fragmentShaderSource = `# version 300 es
  precision highp float;
  
  // in vec2 vTextureCoord;
  out vec4 fragColor;
  
  // uniform sampler2D uSampler;
  uniform vec4 uColor;
  // uniform bool bAlter;

  void main() {
    // vec4 original = texture(uSampler, vTextureCoord);
    // fragColor = vec4(1, 0, 0, 1);
    fragColor = uColor;
  }
`

export const vertexShaderSource = `# version 300 es
  in vec2 aVertexPosition;

  uniform vec2 uResolution;
  // uniform vec2 uZoomOrigin;
  
  void main() {
    // vec2 translated = aVertexPosition + uResolution / 2.0;
    // vec2 clipSpace = translated / uResolution * 2.0 - 1.0;
    vec2 clipSpace = aVertexPosition / uResolution;
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
  }
`
