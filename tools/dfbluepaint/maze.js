/* Grid-native magic-wand selection and width-aware maze generation. No DOM or mutation in previews. */
(function (root) {
  'use strict';
  const M = typeof module !== 'undefined' && module.exports ? require('./model.js') : root.DFModel;
  function neighbors(i, width, height) {
    const x = i % width,
      y = Math.floor(i / width),
      result = [];
    if (x > 0) result.push(i - 1);
    if (x + 1 < width) result.push(i + 1);
    if (y > 0) result.push(i - width);
    if (y + 1 < height) result.push(i + width);
    return result;
  }
  function selectBlankRegion(p, z, x, y) {
    const l = M.layerAt(p, z);
    if (!l || !M.inside(p, x, y) || l.cells[y * p.width + x] !== 0)
      throw new Error('请点击空白的未开掘岩层，已有素材不能作为迷宫选区。');
    const mask = new Uint8Array(p.width * p.height),
      indices = [y * p.width + x];
    mask[indices[0]] = 1;
    const bounds = { minX: x, maxX: x, minY: y, maxY: y };
    for (let head = 0; head < indices.length; head++) {
      const i = indices[head],
        cx = i % p.width,
        cy = Math.floor(i / p.width);
      bounds.minX = Math.min(bounds.minX, cx);
      bounds.maxX = Math.max(bounds.maxX, cx);
      bounds.minY = Math.min(bounds.minY, cy);
      bounds.maxY = Math.max(bounds.maxY, cy);
      for (const n of neighbors(i, p.width, p.height))
        if (!mask[n] && l.cells[n] === 0) {
          mask[n] = 1;
          indices.push(n);
        }
    }
    return { width: p.width, height: p.height, z, mask, indices, bounds };
  }
  function generateMaze(region, start, end, pathWidth = 1, seed = 1) {
    const { width: w, height: h, mask, bounds } = region,
      n = w * h;
    if (!Number.isInteger(pathWidth) || pathWidth < 1 || pathWidth > M.MAX_SIZE)
      throw new Error('通道宽度必须是 1–512 之间的整数。');
    for (const point of [start, end])
      if (!point || !M.inside(region, point.x, point.y) || !mask[point.y * w + point.x])
        throw new Error('起点和终点必须位于同一个空白选区内。');
    if (start.x === end.x && start.y === end.y) throw new Error('起点和终点不能是同一格。');
    const size = pathWidth,
      stride = w + 1;
    // Summed-area table: a valid anchor represents a full size × size corridor footprint.
    const sums = new Int32Array(stride * (h + 1)),
      valid = new Uint8Array(n);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const a = (y + 1) * stride + x + 1;
        sums[a] = mask[y * w + x] + sums[a - 1] + sums[a - stride] - sums[a - stride - 1];
      }
    let validCount = 0;
    for (let y = 0; y + size <= h; y++)
      for (let x = 0; x + size <= w; x++) {
        const a = y * stride + x;
        if (
          sums[a + size * stride + size] - sums[a + size * stride] - sums[a + size] + sums[a] ===
          size * size
        ) {
          valid[y * w + x] = 1;
          validCount++;
        }
      }
    function anchorFor(point) {
      let best = -1,
        distance = Infinity;
      for (let y = Math.max(0, point.y - size + 1); y <= point.y; y++)
        for (let x = Math.max(0, point.x - size + 1); x <= point.x; x++) {
          const i = y * w + x,
            d = (x + (size - 1) / 2 - point.x) ** 2 + (y + (size - 1) / 2 - point.y) ** 2;
          if (valid[i] && d < distance) {
            best = i;
            distance = d;
          }
        }
      if (best < 0) throw new Error('起点或终点附近放不下指定宽度的通道，请减小宽度或重新选点。');
      return best;
    }
    const first = anchorFor(start),
      last = anchorFor(end);
    // Reject bottlenecks rather than silently narrowing a corridor or dropping an entire lobe.
    const reachable = new Uint8Array(n),
      queue = new Int32Array(n);
    let head = 0,
      tail = 1;
    queue[0] = first;
    reachable[first] = 1;
    while (head < tail)
      for (const j of neighbors(queue[head++], w, h))
        if (valid[j] && !reachable[j]) {
          reachable[j] = 1;
          queue[tail++] = j;
        }
    if (tail !== validCount)
      throw new Error('选区存在无法容纳此通道宽度的瓶颈，不能填满并连通所有区域，请减小宽度。');
    // Pack regular rooms, then add rooms in off-grid branches and curved boundary pockets.
    // The one-cell gap creates walls. Endpoints are genuine corridor footprints, never snapped away.
    const seeds = [],
      blocked = new Uint8Array(n);
    function addSeed(i) {
      seeds.push(i);
      const x = i % w,
        y = Math.floor(i / w);
      for (let yy = Math.max(0, y - size); yy <= Math.min(h - 1, y + size); yy++)
        for (let xx = Math.max(0, x - size); xx <= Math.min(w - 1, x + size); xx++) blocked[yy * w + xx] = 1;
    }
    addSeed(first);
    if (last !== first) addSeed(last);
    for (let y = bounds.minY + 1; y <= bounds.maxY; y += size + 1)
      for (let x = bounds.minX + 1; x <= bounds.maxX; x += size + 1) {
        const i = y * w + x;
        if (valid[i] && !blocked[i]) addSeed(i);
      }
    for (let i = 0; i < n; i++) if (valid[i] && !blocked[i]) addSeed(i);
    // Multi-source BFS builds a room adjacency graph through the eroded (width-safe) region.
    const owner = new Int32Array(n).fill(-1),
      parent = new Int32Array(n).fill(-1);
    head = 0;
    tail = 0;
    seeds.forEach((i, id) => {
      owner[i] = id;
      queue[tail++] = i;
    });
    const graph = seeds.map(() => []),
      edges = new Set();
    while (head < tail) {
      const i = queue[head++];
      for (const j of neighbors(i, w, h)) {
        if (!valid[j]) continue;
        if (owner[j] < 0) {
          owner[j] = owner[i];
          parent[j] = i;
          queue[tail++] = j;
        } else if (owner[i] !== owner[j]) {
          const a = owner[i],
            b = owner[j],
            key = Math.min(a, b) * seeds.length + Math.max(a, b);
          if (!edges.has(key)) {
            edges.add(key);
            graph[a].push({ to: b, i, j });
            graph[b].push({ to: a, i: j, j: i });
          }
        }
      }
    }
    let randomState = Number(seed) >>> 0;
    const random = () => {
      randomState = (randomState + 0x6d2b79f5) >>> 0;
      let t = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const finishRoom = first === last ? 0 : 1;
    const attempts = seeds.length < 12 ? 1 : n >= 131072 ? 8 : 16;
    let best = null,
      bestScore = -Infinity;
    // A DFS rooted at the entrance puts its largest unexplored subtree near the exit.
    // Instead, choose a winding spine from independently rooted trees, then regrow
    // the remaining rooms from all four quarters of that spine with equal turns.
    for (let attempt = 0; attempt < attempts; attempt++) {
      for (const list of graph)
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }
      const root = Math.floor(random() * seeds.length),
        treeParent = new Int32Array(seeds.length).fill(-1),
        treeEdge = Array(seeds.length),
        depth = new Int32Array(seeds.length),
        cursor = new Int32Array(seeds.length),
        stack = [root];
      treeParent[root] = root;
      while (stack.length) {
        const id = stack.at(-1),
          edge = graph[id][cursor[id]++];
        if (!edge) {
          stack.pop();
          continue;
        }
        if (treeParent[edge.to] !== -1) continue;
        treeParent[edge.to] = id;
        treeEdge[edge.to] = edge;
        depth[edge.to] = depth[id] + 1;
        stack.push(edge.to);
      }
      const left = [],
        right = [],
        chosen = [];
      let a = 0,
        b = finishRoom;
      while (a !== b) {
        if (depth[a] >= depth[b]) {
          left.push(a);
          chosen.push(treeEdge[a]);
          a = treeParent[a];
        } else {
          right.push(b);
          chosen.push(treeEdge[b]);
          b = treeParent[b];
        }
      }
      const spine = [...left, a, ...right.reverse()],
        visited = new Uint8Array(seeds.length);
      const branches = Array.from({ length: 4 }, () => ({ roots: [], stack: [] }));
      spine.forEach((id, index) => {
        visited[id] = 1;
        branches[Math.min(3, Math.floor((index * 4) / spine.length))].roots.push(id);
      });
      for (const branch of branches)
        for (let i = branch.roots.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [branch.roots[i], branch.roots[j]] = [branch.roots[j], branch.roots[i]];
        }
      // One long-running DFS per quarter, round-robin, rather than a single DFS
      // consuming every free room from the last available junction near the goal.
      cursor.fill(0);
      const quantum = Math.max(2, Math.ceil(Math.sqrt(seeds.length) / 4));
      let active = true;
      const offset = Math.floor(random() * 4);
      while (active) {
        active = false;
        for (let k = 0; k < 4; k++) {
          const branch = branches[(k + offset) % 4];
          let budget = quantum;
          while (budget && (branch.stack.length || branch.roots.length)) {
            active = true;
            if (!branch.stack.length) branch.stack.push(branch.roots.pop());
            const id = branch.stack.at(-1),
              edge = graph[id][cursor[id]++];
            if (!edge) {
              branch.stack.pop();
              continue;
            }
            if (visited[edge.to]) continue;
            visited[edge.to] = 1;
            chosen.push(edge);
            branch.stack.push(edge.to);
            budget--;
          }
        }
      }
      const carved = new Uint8Array(n);
      for (const i of seeds) carved[i] = 1;
      function carveBranch(i) {
        while (i >= 0 && !carved[i]) {
          carved[i] = 1;
          i = parent[i];
        }
      }
      for (const edge of chosen) {
        carveBranch(edge.i);
        carveBranch(edge.j);
      }
      // Rasterize full-width footprints before evaluating: the room graph alone
      // misses shortcuts caused by touching corridors at irregular boundaries.
      const diff = new Int32Array(stride * (h + 1)),
        cells = new Uint8Array(n);
      for (let i = 0; i < n; i++)
        if (carved[i]) {
          const a = Math.floor(i / w) * stride + (i % w);
          diff[a]++;
          diff[a + size]--;
          diff[a + size * stride]--;
          diff[a + size * stride + size]++;
        }
      let passageCount = 0;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const a = y * stride + x,
            i = y * w + x;
          if (x) diff[a] += diff[a - 1];
          if (y) diff[a] += diff[a - stride];
          if (x && y) diff[a] -= diff[a - stride - 1];
          if (mask[i]) {
            cells[i] = diff[a] > 0 ? 1 : 2;
            if (cells[i] === 1) passageCount++;
          }
        }
      const quality = measureQuality(cells, w, h, start, end, size, passageCount);
      const direct = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
      const target = Math.max(direct * 3, Math.sqrt(seeds.length) * (size + 1) * 7);
      const route = quality.solutionLength / target;
      const score =
        (Math.min(route, 1) + 0.1 * Math.log1p(route)) *
        (0.3 + 0.4 * quality.coverage + 0.3 * quality.balance);
      if (score > bestScore) {
        bestScore = score;
        best = {
          cells,
          start: { ...start },
          end: { ...end },
          pathWidth,
          seed,
          passageCount,
          roomCount: seeds.length,
          solutionLength: quality.solutionLength,
        };
      }
    }
    return best;
  }
  function measureQuality(cells, w, h, start, end, size, passageCount) {
    const n = cells.length,
      first = start.y * w + start.x,
      last = end.y * w + end.x;
    const parent = new Int32Array(n).fill(-1),
      queue = new Int32Array(n);
    let head = 0,
      tail = 1;
    queue[0] = first;
    parent[first] = first;
    while (head < tail && parent[last] < 0) {
      const i = queue[head++];
      for (const j of neighbors(i, w, h))
        if (cells[j] === 1 && parent[j] < 0) {
          parent[j] = i;
          queue[tail++] = j;
        }
    }
    if (parent[last] < 0) throw new Error('迷宫通道未连通，请重新生成。');
    const path = [last];
    while (path.at(-1) !== first) path.push(parent[path.at(-1)]);
    path.reverse();
    const distance = new Int32Array(n).fill(-1),
      quarter = new Uint8Array(n);
    const depths = [0, 0, 0, 0],
      mass = [0, 0, 0, 0];
    head = 0;
    tail = 0;
    path.forEach((i, k) => {
      distance[i] = 0;
      quarter[i] = Math.min(3, Math.floor((k * 4) / path.length));
      queue[tail++] = i;
    });
    while (head < tail) {
      const i = queue[head++],
        q = quarter[i];
      depths[q] = Math.max(depths[q], distance[i]);
      if (distance[i] >= size * 3) mass[q]++;
      for (const j of neighbors(i, w, h))
        if (cells[j] === 1 && distance[j] < 0) {
          distance[j] = distance[i] + 1;
          quarter[j] = q;
          queue[tail++] = j;
        }
    }
    const threshold = Math.max(size * 3, Math.sqrt(passageCount) * 0.3),
      total = mass.reduce((a, b) => a + b, 0);
    return {
      solutionLength: path.length - 1,
      coverage: depths.filter((d) => d >= threshold).length / 4,
      balance: total ? (1 - Math.max(...mass) / total) / 0.75 : 0,
    };
  }

  function applyMaze(p, region, maze) {
    const l = M.layerAt(p, region.z);
    if (
      !l ||
      region.width !== p.width ||
      region.height !== p.height ||
      region.indices.some((i) => l.cells[i] !== 0)
    )
      throw new Error('选区内容已改变，请重新选择空白区域。');
    if (l.labels.length > 498)
      throw new Error('起终点需要 2 个标注名额，当前层最多 500 个标注，请删除一些标注后重试。');
    for (const i of region.indices) l.cells[i] = maze.cells[i];
    l.labels.push({ ...maze.start, text: '迷宫起点' }, { ...maze.end, text: '迷宫终点' });
  }
  const api = { selectBlankRegion, generateMaze, applyMaze };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DFMaze = api;
})(typeof window !== 'undefined' ? window : globalThis);
