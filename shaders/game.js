export const shaderSource = `
struct Camera {
  pos: vec2f,
  size: vec2f,
  zoom: f32,
  mode: u32,
  gridSize: vec2f,
  _pad1: vec2f,
  color: vec4f,
};

@group(0) @binding(0) var<uniform> cam: Camera;
@group(0) @binding(1) var<storage, read> cells: array<vec4u>;

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) color: vec3f,
  @location(1) uv: vec2f,
};

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
    out.uv = vec2f(0.0);
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

  var rgb: vec3f;
  if (life == 255u) {
    rgb = cam.color.xyz;
  } else {
    rgb = vec3f(cell.yzw) / 255.0;
  }
  // Gamma the linear life ramp into a curve that's perceptually closer to
  // v1's exponential framebuffer fade.
  let lifeF = pow(f32(life) / 255.0, 2.2);

  out.pos = vec4f(clip, 0.0, 1.0);
  out.color = rgb * lifeF;
  out.uv = corner;
  return out;
}

@vertex
fn vs_lines_main(
  @builtin(vertex_index) vi: u32,
  @builtin(instance_index) ii: u32,
) -> VSOut {
  let W = u32(cam.gridSize.x);
  let H = u32(cam.gridSize.y);
  let cellIdx = ii / 8u;
  let dirIdx = ii % 8u;

  var out: VSOut;
  out.uv = vec2f(0.0);

  let cx = cellIdx % W;
  let cy = cellIdx / W;

  let cell = cells[cellIdx];
  if (cell.x == 0u) {
    out.pos = vec4f(2.0, 2.0, 0.0, 1.0);
    out.color = vec3f(0.0);
    return out;
  }

  var dirs = array<vec2i, 8>(
    vec2i(-1, -1), vec2i(0, -1), vec2i(1, -1),
    vec2i(-1,  0),                vec2i(1,  0),
    vec2i(-1,  1), vec2i(0,  1), vec2i(1,  1),
  );
  let dir = dirs[dirIdx];
  let nx = i32(cx) + dir.x;
  let ny = i32(cy) + dir.y;

  if (nx < 0 || ny < 0 || nx >= i32(W) || ny >= i32(H)) {
    out.pos = vec4f(2.0, 2.0, 0.0, 1.0);
    out.color = vec3f(0.0);
    return out;
  }

  let neighbour = cells[u32(nx) + u32(ny) * W];
  if (neighbour.x == 0u) {
    out.pos = vec4f(2.0, 2.0, 0.0, 1.0);
    out.color = vec3f(0.0);
    return out;
  }

  // Position depends on which vertex of the line we are.
  var endpointX: u32;
  var endpointY: u32;
  if (vi == 0u) {
    endpointX = cx;
    endpointY = cy;
  } else {
    endpointX = u32(nx);
    endpointY = u32(ny);
  }

  // Color/brightness is the same for both vertices — picked from whichever
  // endpoint is more alive. This keeps the line a single uniform color so the
  // rasterizer doesn't interpolate a gradient across it.
  var dominant: vec4u;
  if (cell.x >= neighbour.x) { dominant = cell; } else { dominant = neighbour; }
  let dominantLife = dominant.x;
  var rgb: vec3f;
  if (dominantLife == 255u) {
    rgb = cam.color.xyz;
  } else {
    rgb = vec3f(dominant.yzw) / 255.0;
  }
  let lifeF = pow(f32(dominantLife) / 255.0, 2.2);

  let z = cam.zoom;
  let endpointCellX = f32(endpointX) + 0.5;
  let endpointCellY = f32(endpointY) + 0.5;
  let screenX = endpointCellX * z - cam.pos.x + cam.size.x * 0.5 - cam.gridSize.x * 0.5 * z;
  let screenY = endpointCellY * z - cam.pos.y + cam.size.y * 0.5 - cam.gridSize.y * 0.5 * z;
  let clip = vec2f(screenX, screenY) / cam.size * 2.0 - 1.0;

  out.pos = vec4f(clip, 0.0, 1.0);
  out.color = rgb * lifeF;
  return out;
}

@fragment
fn fs_main(in: VSOut) -> @location(0) vec4f {
  if (cam.mode == 1u) {
    let d = distance(in.uv, vec2f(0.5, 0.5));
    // One-pixel smoothstep across the circle edge. fwidth(d) gives the
    // screen-space change in d per pixel, so the AA band auto-scales with zoom.
    let aa = fwidth(d);
    let alpha = 1.0 - smoothstep(0.49 - aa, 0.49, d);
    if (alpha <= 0.0) { discard; }
    return vec4f(in.color, alpha);
  }
  return vec4f(in.color, 1.0);
}
`
