export const shaderSource = `
struct Uniforms {
  resolution: vec2f,
};

@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d_array<f32>;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) @interpolate(flat) layer: u32,
};

@vertex
fn vs_main(
  @location(0) position: vec2f,
  @location(1) uv: vec2f,
  @location(2) layer: u32,
) -> VSOut {
  let clip = position / u.resolution * 2.0 - 1.0;
  var out: VSOut;
  out.pos = vec4f(clip, 0.0, 1.0);
  out.uv = uv;
  out.layer = layer;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  return textureSample(tex, samp, in.uv, i32(in.layer));
}
`
