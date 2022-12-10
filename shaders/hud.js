export const fragmentShaderSource = `# version 300 es
  precision highp float;
  
  out vec4 fragColor;
  
  uniform sampler2D uSampler;

  void main() {
    vec4 original = texture(uSampler, vTextureCoord);
    fragColor = original;
  }
`

export const vertexShaderSource = `# version 300 es
  in vec2 aVertexPosition;

  uniform vec2 uResolution;
  
  out vec3 fColor;
  
  void main() {
    vec2 translated = aVertexPosition;
    vec2 clipSpace = translated / uResolution * 2.0 - 1.0;
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    fColor = vColor;
  }
`
