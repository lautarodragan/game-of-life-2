export const shaderSource = `
struct StepUniforms {
  gridSize: vec2u,
  decay: u32,
  _pad: u32,
  color: vec4u,   // current frame color rgb in 0..255 (use .xyz)
};

@group(0) @binding(0) var<uniform> u: StepUniforms;
@group(0) @binding(1) var<storage, read> stateIn: array<vec4u>;
@group(0) @binding(2) var<storage, read_write> stateOut: array<vec4u>;

@compute @workgroup_size(8, 8)
fn step_main(@builtin(global_invocation_id) gid: vec3u) {
  let W = u.gridSize.x;
  let H = u.gridSize.y;
  let x = gid.x;
  let y = gid.y;
  if (x >= W || y >= H) { return; }

  let i = x + y * W;
  let cell = stateIn[i];
  let life = cell.x;
  let prevColor = cell.yzw;

  var neighbours: u32 = 0u;
  for (var dy: i32 = -1; dy <= 1; dy = dy + 1) {
    for (var dx: i32 = -1; dx <= 1; dx = dx + 1) {
      if (dx == 0 && dy == 0) { continue; }
      let nx = i32(x) + dx;
      let ny = i32(y) + dy;
      if (nx < 0 || ny < 0 || nx >= i32(W) || ny >= i32(H)) { continue; }
      let n = stateIn[u32(nx) + u32(ny) * W].x;
      if (n == 255u) { neighbours = neighbours + 1u; }
    }
  }

  var newLife: u32 = life;

  if (life == 255u) {
    if (neighbours < 2u || neighbours > 3u) {
      newLife = select(0u, life - u.decay, life > u.decay);
    } else {
      newLife = 255u;
    }
  } else {
    if (neighbours == 3u) {
      newLife = 255u;
    } else {
      newLife = select(0u, life - u.decay, life > u.decay);
    }
  }

  // Snapshot the current frame color when a cell transitions from fully
  // alive to decaying — it sticks to that color while it fades.
  var newColor = prevColor;
  if (life == 255u && newLife < 255u) {
    newColor = u.color.xyz;
  }

  stateOut[i] = vec4u(newLife, newColor.x, newColor.y, newColor.z);
}
`
