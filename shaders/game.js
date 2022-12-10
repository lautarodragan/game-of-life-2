export const fragmentShaderSource = `# version 300 es
  precision highp float;
  
  in vec3 fColor;
  out vec4 fragColor;
  
  // uniform sampler2D uSampler;
  // uniform vec4 uColor;
  // uniform bool bAlter;

  void main() {
    // vec4 original = texture(uSampler, vTextureCoord);
    // fragColor = vec4(1, 0, 0, 1);
    // fragColor = uColor;
    fragColor = vec4(fColor, 1.0);
    // fragColor = fColor;
  }
`

export const vertexShaderSource = `# version 300 es
  precision highp float;
  
  uniform vec2 uResolution;
  
  in vec2 aVertexPosition;
  in vec3 vColor;
  
  out vec3 fColor;
  
  void main() {
    // vec2 translated = aVertexPosition + uResolution / 2.0;
    vec2 translated = aVertexPosition;
    vec2 clipSpace = translated / uResolution * 2.0 - 1.0;
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    fColor = vColor;
  }
`
