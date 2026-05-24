export const shaderSource = `
struct Camera {
  pos: vec2f,
  size: vec2f,
  zoom: f32,
  _pad0: f32,
  gridSize: vec2f,
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<storage, read> cells: array<vec2u>;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec3f,
};

// Simple integer hash → 3 channels in [0, 1].
fn hash3(p: vec3u) -> vec3f {
  var h: vec3u = p * vec3u(73856093u, 19349663u, 83492791u);
  h.x = h.x ^ (h.y >> 13u);
  h.y = h.y ^ (h.z >> 17u);
  h.z = h.z ^ (h.x >> 5u);
  h = h * 2654435761u;
  h.x = h.x ^ (h.x >> 15u);
  h.y = h.y ^ (h.y >> 15u);
  h.z = h.z ^ (h.z >> 15u);
  return vec3f(
    f32(h.x & 0xffffu),
    f32(h.y & 0xffffu),
    f32(h.z & 0xffffu),
  ) / 65535.0;
}

@vertex
fn vs_main(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  let W = u32(cam.gridSize.x);
  let cell = cells[ii];
  let life = cell.x;

  var out: VSOut;

  if (life == 0u) {
    out.pos = vec4f(2.0, 2.0, 0.0, 1.0);
    out.color = vec3f(0.0);
    return out;
  }

  let cx = ii % W;
  let cy = ii / W;

  var corners = array<vec2f, 6>(
    vec2f(0.0, 1.0),
    vec2f(1.0, 1.0),
    vec2f(0.0, 0.0),
    vec2f(1.0, 0.0),
    vec2f(0.0, 0.0),
    vec2f(1.0, 1.0),
  );
  let corner = corners[vi];

  let z = cam.zoom;
  let baseX = f32(cx) * z - cam.pos.x + cam.size.x * 0.5 - cam.gridSize.x * 0.5 * z;
  let baseY = f32(cy) * z - cam.pos.y + cam.size.y * 0.5 - cam.gridSize.y * 0.5 * z;

  let screen = vec2f(baseX + corner.x * z, baseY + corner.y * z);
  let clip = screen / cam.size * 2.0 - 1.0;

  let birth = cell.y;
  let rgb = hash3(vec3u(cx, cy, birth));
  let lifeF = f32(life) / 255.0;

  out.pos = vec4f(clip, 0.0, 1.0);
  out.color = rgb * lifeF;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  return vec4f(in.color, 1.0);
}
`
