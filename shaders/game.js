export const shaderSource = `
struct Uniforms {
  resolution: vec2f,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec3f,
};

@vertex
fn vs_main(
  @location(0) position: vec2f,
  @location(1) color: vec3f,
) -> VSOut {
  let clip = position / u.resolution * 2.0 - 1.0;
  var out: VSOut;
  out.pos = vec4f(clip, 0.0, 1.0);
  out.color = color;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}
`
