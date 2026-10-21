/* Pure map operations, shared by the browser and the test suite. */
(function (root) {
  'use strict';
  const DEFAULT_SIZE = 192;
  const MIN_SIZE = 8;
  const MAX_SIZE = 32767;
  const MAX_TOOL_SIZE = 512;
  // 游戏导出保留完整的已知楼层和原始 int16 Z 坐标。
  const MAX_LAYERS = 32768;
  const MIN_Z = -32768;
  const MAX_Z = 32767;
  const MAX_IMPORT_BYTES = 256 * 1024 * 1024;
  const CUSTOM_GROUPS = ['建筑', '设施', '区域', '功能', '地形'];
  const MAX_CUSTOM_TILES = 128;
  const DEFAULT_SETTINGS = Object.freeze({
    grid: true,
    labels: true,
    ghost: false,
    symbols: true,
    brushSize: 1,
  });
  const TILES = [
    { id: 0, name: '未开掘岩层', short: '岩', color: '#f8fafc', ink: '#536170', symbol: '', group: '地形' },
    { id: 1, name: '开掘 / 地板', short: '地', color: '#e7eddf', ink: '#4d6044', symbol: '·', group: '地形' },
    { id: 2, name: '建造墙壁', short: '墙', color: '#57695d', ink: '#ffffff', symbol: '', group: '地形' },
    { id: 3, name: '水域', short: '水', color: '#bfdeee', ink: '#22566f', symbol: '≈', group: '地形' },
    { id: 4, name: '上行楼梯', short: '上', color: '#efe1b9', ink: '#705016', symbol: '<', group: '连接' },
    { id: 5, name: '下行楼梯', short: '下', color: '#efe1b9', ink: '#705016', symbol: '>', group: '连接' },
    { id: 6, name: '双向楼梯', short: '梯', color: '#eddaa4', ink: '#644613', symbol: '↕', group: '连接' },
    { id: 7, name: '斜坡', short: '坡', color: '#dfdfcc', ink: '#5a5b32', symbol: '▲', group: '连接' },
    { id: 8, name: '门', short: '门', color: '#d8c6aa', ink: '#594324', symbol: '▥', group: '设施' },
    { id: 9, name: '床铺', short: '床', color: '#dcd5e7', ink: '#60437e', symbol: '╤', group: '设施' },
    { id: 10, name: '餐桌', short: '桌', color: '#e8dbc2', ink: '#655125', symbol: '╬', group: '设施' },
    { id: 11, name: '工坊', short: '工', color: '#ecd2bc', ink: '#854923', symbol: '⚒', group: '分区' },
    { id: 12, name: '储物区', short: '储', color: '#d7ddc2', ink: '#4b5e2c', symbol: '▪', group: '分区' },
    { id: 13, name: '农田', short: '田', color: '#c8dfc2', ink: '#395e30', symbol: '÷', group: '分区' },
    { id: 14, name: '空洞', short: '空', color: '#dcdeda', ink: '#4b5646', symbol: '˙', group: '地形' },
  ];
  function validateSize(width, height) {
    if (
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < MIN_SIZE ||
      height < MIN_SIZE ||
      width > MAX_SIZE ||
      height > MAX_SIZE
    )
      throw new Error(`地图宽高必须是 ${MIN_SIZE}–${MAX_SIZE} 之间的整数。`);
  }
  function createProject(name = '未命名要塞', width = DEFAULT_SIZE, height = DEFAULT_SIZE) {
    validateSize(width, height);
    return {
      version: 1,
      name,
      width,
      height,
      activeZ: 0,
      customTiles: [],
      nextTileId: 100,
      settings: { ...DEFAULT_SETTINGS },
      layers: [makeLayer(0, '地表', width, height)],
    };
  }
  function allTiles(p) {
    return [...TILES, ...(p.customTiles || [])];
  }
  function getTile(p, id) {
    if (!Number.isSafeInteger(id) || id < 0) return undefined;
    return TILES[id] || (p.customTiles || []).find((t) => t.id === id);
  }
  function validateCustomTile(t) {
    if (!t || !Number.isSafeInteger(t.id) || t.id < 100 || t.id >= Number.MAX_SAFE_INTEGER)
      throw new Error('自定义素材 ID 无效。');
    if (typeof t.name !== 'string' || !t.name.trim() || t.name.length > 40)
      throw new Error('素材名称需要 1–40 个字符。');
    if (!CUSTOM_GROUPS.includes(t.group)) throw new Error('素材分类无效。');
    if (![t.color, t.ink].every((c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)))
      throw new Error('素材颜色必须是六位十六进制色值。');
    if (typeof t.symbol !== 'string' || [...t.symbol].length > 2 || /[\u0000-\u001f\u007f]/.test(t.symbol))
      throw new Error('素材符号最多 2 个字符，不能包含控制字符。');
    if (typeof t.description !== 'string' || t.description.length > 240)
      throw new Error('功能说明最多 240 个字符。');
    if (!['brush', 'rectangle', 'fill', 'stamp'].includes(t.tool)) throw new Error('默认绘制方式无效。');
    if (![t.width, t.height].every((n) => Number.isInteger(n) && n >= 1 && n <= 32))
      throw new Error('模板宽高必须是 1–32 之间的整数。');
    if (!['solid', 'outline'].includes(t.shape)) throw new Error('模板形状无效。');
    return {
      id: t.id,
      name: t.name.trim(),
      short: [...t.name.trim()][0],
      group: t.group,
      color: t.color.toLowerCase(),
      ink: t.ink.toLowerCase(),
      symbol: t.symbol,
      description: t.description.trim(),
      tool: t.tool,
      width: t.width,
      height: t.height,
      shape: t.shape,
    };
  }
  function validateSettings(raw = {}) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('编辑器设置无效。');
    const settings = { ...DEFAULT_SETTINGS };
    for (const key of ['grid', 'labels', 'ghost', 'symbols']) {
      if (raw[key] !== undefined && typeof raw[key] !== 'boolean') throw new Error('显示设置必须为开关值。');
      if (raw[key] !== undefined) settings[key] = raw[key];
    }
    if (raw.brushSize !== undefined) {
      if (![1, 2, 3, 5].includes(raw.brushSize)) throw new Error('笔刷尺寸无效。');
      settings.brushSize = raw.brushSize;
    }
    return settings;
  }
  function saveCustomTile(p, raw, editingId = null) {
    const tiles = p.customTiles || [];
    if (editingId === null && tiles.length >= MAX_CUSTOM_TILES)
      throw new Error(`最多创建 ${MAX_CUSTOM_TILES} 个自定义素材。`);
    if (editingId !== null && !tiles.some((t) => t.id === editingId))
      throw new Error('找不到要编辑的自定义素材。');
    const id = editingId ?? Math.max(p.nextTileId || 100, ...tiles.map((t) => t.id + 1));
    const tile = validateCustomTile({ ...raw, id });
    if (tiles.some((t) => t.id !== id && t.name === tile.name))
      throw new Error('已有同名自定义素材，请使用其他名称。');
    p.customTiles = editingId === null ? [...tiles, tile] : tiles.map((t) => (t.id === id ? tile : t));
    p.nextTileId = Math.max(p.nextTileId || 100, id + 1);
    return tile;
  }
  function tileUsage(p, id) {
    return p.layers.reduce((n, l) => n + l.cells.reduce((sum, c) => sum + (c === id ? 1 : 0), 0), 0);
  }
  function deleteCustomTile(p, id, replacement) {
    if (!(p.customTiles || []).some((t) => t.id === id)) throw new Error('只能删除自定义素材。');
    if (replacement === id || !getTile(p, replacement)) throw new Error('请选择有效的替换素材。');
    for (const l of p.layers) {
      l.cells = l.cells.map((c) => (c === id ? replacement : c));
      l.buildings = (l.buildings || [])
        .filter((b) => b.tile !== id || replacement !== 0)
        .map((b) => (b.tile === id ? { ...b, tile: replacement } : b));
    }
    p.customTiles = p.customTiles.filter((t) => t.id !== id);
  }
  function stamp(p, levels, x, y, id, rotated = false) {
    const t = getTile(p, id);
    if (!t) throw new Error('模板素材不存在。');
    const w = (rotated ? t.height : t.width) || 1,
      h = (rotated ? t.width : t.height) || 1;
    if (!inside(p, x, y) || !inside(p, x + w - 1, y + h - 1))
      throw new Error('模板超出地图边界，请向内移动后放置。');
    if (!levels.length || levels.some((z) => !layerAt(p, z))) throw new Error('请选择有效的目标楼层。');
    for (const z of new Set(levels))
      placeBuilding(p, z, { tile: id, x, y, width: w, height: h, shape: t.shape || 'solid' });
  }
  // Each template placement owns its footprint, independently of adjacent placements
  // of the same material. Geometry is stored at placement time, not read from the palette.
  function buildingPoints(b) {
    return rectangle(b.x, b.y, b.x + b.width - 1, b.y + b.height - 1, b.shape === 'outline');
  }
  function buildingContains(b, x, y) {
    return (
      x >= b.x &&
      y >= b.y &&
      x < b.x + b.width &&
      y < b.y + b.height &&
      (b.shape !== 'outline' || x === b.x || y === b.y || x === b.x + b.width - 1 || y === b.y + b.height - 1)
    );
  }
  function buildingAt(p, z, x, y) {
    return (layerAt(p, z)?.buildings || []).find((b) => buildingContains(b, x, y));
  }
  function buildingCells(p, l) {
    const cells = new Set();
    for (const b of l.buildings || []) for (const [x, y] of buildingPoints(b)) cells.add(y * p.width + x);
    return cells;
  }
  function removeBuilding(p, l, b) {
    for (const [x, y] of buildingPoints(b)) l.cells[y * p.width + x] = 0;
    l.buildings = l.buildings.filter((entry) => entry !== b);
  }
  function validateBuilding(p, b) {
    if (
      !b ||
      !getTile(p, b.tile) ||
      b.tile === 0 ||
      ![b.width, b.height].every((n) => Number.isInteger(n) && n >= 1 && n <= 32) ||
      !['solid', 'outline'].includes(b.shape) ||
      !inside(p, b.x, b.y) ||
      !inside(p, b.x + b.width - 1, b.y + b.height - 1)
    )
      throw new Error('建筑占地数据无效或超出地图边界。');
    return { tile: b.tile, x: b.x, y: b.y, width: b.width, height: b.height, shape: b.shape };
  }
  function placeBuilding(p, z, raw) {
    const b = validateBuilding(p, raw),
      l = layerAt(p, z);
    if (!l) throw new Error('请选择有效的目标楼层。');
    const points = buildingPoints(b);
    const overlaps = new Set(points.map(([x, y]) => buildingAt(p, z, x, y)).filter(Boolean));
    for (const old of overlaps) removeBuilding(p, l, old);
    for (const [x, y] of points) l.cells[y * p.width + x] = b.tile;
    if (b.width * b.height > 1) (l.buildings ||= []).push(b);
  }
  function croppedBuildings(l, width, height) {
    return (l.buildings || []).filter((b) => b.x + b.width > width || b.y + b.height > height);
  }
  function cropImpact(p, width, height) {
    validateSize(width, height);
    let cells = 0,
      labels = 0;
    for (const l of p.layers) {
      const removed = new Set();
      for (const b of croppedBuildings(l, width, height))
        for (const [x, y] of buildingPoints(b)) removed.add(y * p.width + x);
      for (let y = 0; y < p.height; y++)
        for (let x = 0; x < p.width; x++)
          if ((x >= width || y >= height) && l.cells[y * p.width + x] !== 0) removed.add(y * p.width + x);
      cells += removed.size;
      labels += l.labels.filter((a) => a.x >= width || a.y >= height).length;
    }
    return { cells, labels };
  }
  function resizeProject(p, width, height, allowCrop = false) {
    const impact = cropImpact(p, width, height);
    if (!allowCrop && (impact.cells || impact.labels))
      throw new Error(`缩小会裁掉 ${impact.cells} 个已规划格和 ${impact.labels} 个标注，请先确认。`);
    const layers = p.layers.map((l) => {
      const next = makeLayer(l.z, l.name, width, height);
      for (let y = 0; y < Math.min(p.height, height); y++)
        for (let x = 0; x < Math.min(p.width, width); x++)
          next.cells[y * width + x] = l.cells[y * p.width + x];
      const removed = new Set(croppedBuildings(l, width, height));
      for (const b of removed)
        for (const [x, y] of buildingPoints(b)) if (x < width && y < height) next.cells[y * width + x] = 0;
      next.buildings = (l.buildings || []).filter((b) => !removed.has(b)).map((b) => ({ ...b }));
      next.labels = l.labels.filter((a) => a.x < width && a.y < height).map((a) => ({ ...a }));
      return next;
    });
    return { ...p, width, height, layers };
  }
  function makeLayer(z, name, width, height) {
    return { z, name, cells: Array(width * height).fill(0), labels: [], buildings: [] };
  }
  function layerAt(p, z) {
    return p.layers.find((l) => l.z === z);
  }
  function inside(p, x, y) {
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < p.width && y < p.height;
  }
  function setTile(p, z, x, y, tile) {
    const l = layerAt(p, z);
    if (!l || !inside(p, x, y) || l.cells[y * p.width + x] === tile) return;
    const b = buildingAt(p, z, x, y);
    if (b) removeBuilding(p, l, b);
    l.cells[y * p.width + x] = tile;
  }
  function line(x0, y0, x1, y1) {
    const result = [],
      dx = Math.abs(x1 - x0),
      sx = x0 < x1 ? 1 : -1,
      dy = -Math.abs(y1 - y0),
      sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      result.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      const e = 2 * err;
      if (e >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e <= dx) {
        err += dx;
        y0 += sy;
      }
    }
    return result;
  }
  function curve(x0, y0, x1, y1, verticalFirst = false) {
    // A curve is an orthogonal, single-elbow path; include the shared corner only once.
    const cx = verticalFirst ? x0 : x1,
      cy = verticalFirst ? y1 : y0;
    return [...line(x0, y0, cx, cy), ...line(cx, cy, x1, y1).slice(1)];
  }
  function circle(cx, cy, diameter, width, cols, rows) {
    if (!Number.isInteger(diameter) || diameter < 0 || diameter > MAX_TOOL_SIZE)
      throw new Error(`圆环内径必须是 0–${MAX_TOOL_SIZE} 之间的整数。`);
    if (!Number.isInteger(width) || width < 1 || width > MAX_TOOL_SIZE)
      throw new Error(`圆环宽度必须是 1–${MAX_TOOL_SIZE} 之间的整数。`);
    if (
      ![cx, cy, cols, rows].every(Number.isInteger) ||
      cols < 1 ||
      rows < 1 ||
      cols > MAX_SIZE ||
      rows > MAX_SIZE ||
      cx < 0 ||
      cy < 0 ||
      cx >= cols ||
      cy >= rows
    )
      throw new Error('圆心或绘制范围无效。');
    const inner = diameter / 2,
      outer = inner + width,
      left = Math.max(0, Math.ceil(cx - outer)),
      right = Math.min(cols - 1, Math.floor(cx + outer)),
      top = Math.max(0, Math.ceil(cy - outer)),
      bottom = Math.min(rows - 1, Math.floor(cy + outer)),
      stride = right - left + 1,
      mask = new Uint8Array(stride * (bottom - top + 1)),
      points = [],
      bridges = [];
    const index = (x, y) => (y - top) * stride + x - left,
      distanceSquared = (x, y) => (x - cx) ** 2 + (y - cy) ** 2;
    // Sample at cell centers. The inner disk stays untouched; thickness grows outward.
    // Clip the iteration bounds as well as the result, even for circles larger than the map.
    for (let y = top; y <= bottom; y++)
      for (let x = left; x <= right; x++) {
        const distance = distanceSquared(x, y);
        if (distance >= inner ** 2 && distance < outer ** 2) mask[index(x, y)] = 1;
      }
    // Corner-only contact is not a usable connection on the grid. Join each diagonal
    // pair with an outward L elbow, never by filling the inner disk. Read the original
    // mask throughout so the result stays symmetric and independent of scan order.
    function bridge(x0, y0, x1, y1) {
      const d0 = distanceSquared(x0, y0),
        d1 = distanceSquared(x1, y1);
      if (d0 >= d1) bridges.push(index(x0, y0));
      if (d1 >= d0) bridges.push(index(x1, y1));
    }
    for (let y = top; y < bottom; y++)
      for (let x = left; x < right; x++) {
        const i = index(x, y),
          a = mask[i],
          b = mask[i + 1],
          c = mask[i + stride],
          d = mask[i + stride + 1];
        if (a && d && !b && !c) bridge(x + 1, y, x, y + 1);
        if (b && c && !a && !d) bridge(x, y, x + 1, y + 1);
      }
    for (const i of bridges) mask[i] = 1;
    for (let y = top; y <= bottom; y++)
      for (let x = left; x <= right; x++) if (mask[index(x, y)]) points.push([x, y]);
    return points;
  }
  function rectangle(x0, y0, x1, y1, outline = false) {
    const cells = [],
      left = Math.min(x0, x1),
      top = Math.min(y0, y1),
      right = Math.max(x0, x1),
      bottom = Math.max(y0, y1);
    for (let y = top; y <= bottom; y++)
      for (let x = left; x <= right; x++)
        if (!outline || x === left || x === right || y === top || y === bottom) cells.push([x, y]);
    return cells;
  }
  function paint(p, levels, points, tile, size = 1) {
    const offset = Math.floor((size - 1) / 2);
    for (const z of levels)
      for (const [x, y] of points)
        for (let dy = 0; dy < size; dy++)
          for (let dx = 0; dx < size; dx++) setTile(p, z, x + dx - offset, y + dy - offset, tile);
  }
  function floodFill(p, z, x, y, tile) {
    if (!inside(p, x, y)) return;
    const l = layerAt(p, z);
    if (!l) return;
    const source = l.cells[y * p.width + x];
    if (source === tile) return;
    // Collect first: removing a whole building must not change flood traversal.
    const stack = [[x, y]],
      seen = new Set([y * p.width + x]);
    const points = [];
    while (stack.length) {
      const [cx, cy] = stack.pop();
      points.push([cx, cy]);
      for (const [nx, ny] of [
        [cx - 1, cy],
        [cx + 1, cy],
        [cx, cy - 1],
        [cx, cy + 1],
      ]) {
        if (inside(p, nx, ny) && !seen.has(ny * p.width + nx) && l.cells[ny * p.width + nx] === source) {
          seen.add(ny * p.width + nx);
          stack.push([nx, ny]);
        }
      }
    }
    paint(p, [z], points, tile);
  }
  function stairs(p, x, y, from, to) {
    const low = Math.min(from, to),
      high = Math.max(from, to);
    for (let z = low; z <= high; z++) if (!layerAt(p, z)) throw new Error(`缺少 Z ${z} 楼层，请先添加。`);
    for (let z = low; z <= high; z++)
      setTile(p, z, x, y, low === high ? 6 : z === low ? 4 : z === high ? 5 : 6);
  }
  function migrateBuildings(p, l) {
    // Legacy files only have material IDs. Recover complete fixed-size templates;
    // leave incomplete footprints and freely painted regions untouched.
    const used = new Set(),
      buildings = [];
    const templates = new Map(
      p.customTiles.filter((t) => t.tool === 'stamp' && t.width * t.height > 1).map((t) => [t.id, t])
    );
    for (let y = 0; y < p.height; y++)
      for (let x = 0; x < p.width; x++) {
        const index = y * p.width + x,
          t = templates.get(l.cells[index]);
        if (!t || used.has(index)) continue;
        for (const [width, height] of [
          [t.width, t.height],
          [t.height, t.width],
        ]) {
          if (!inside(p, x + width - 1, y + height - 1)) continue;
          const b = { tile: t.id, x, y, width, height, shape: t.shape };
          const indices = buildingPoints(b).map(([bx, by]) => by * p.width + bx);
          if (!indices.every((i) => !used.has(i) && l.cells[i] === t.id)) continue;
          buildings.push(b);
          for (const i of indices) used.add(i);
          break;
        }
      }
    return buildings;
  }
  // cellsRle 为按行排列的 [素材 ID, 连续格数, ...]，兼容原有 cells 数组。
  function readLayerCells(layer, count, tileIds) {
    if (layer.cells !== undefined) {
      if (
        layer.cellsRle !== undefined ||
        !Array.isArray(layer.cells) ||
        layer.cells.length !== count ||
        layer.cells.some((cell) => !Number.isInteger(cell) || !tileIds.has(cell))
      )
        throw new Error('地图格子数据无效。');
      return layer.cells.slice();
    }
    const runs = layer.cellsRle;
    if (!Array.isArray(runs) || !runs.length || runs.length % 2 || runs.length > count * 2)
      throw new Error('地图压缩格子数据无效。');
    let total = 0;
    for (let i = 0; i < runs.length; i += 2) {
      const tile = runs[i],
        length = runs[i + 1];
      if (!Number.isInteger(tile) || !tileIds.has(tile) || !Number.isInteger(length) || length <= 0)
        throw new Error('地图压缩格子数据无效。');
      total += length;
      if (total > count) throw new Error('地图压缩格子数量超出尺寸。');
    }
    if (total !== count) throw new Error('地图压缩格子数量与尺寸不符。');
    const cells = Array(count);
    let offset = 0;
    for (let i = 0; i < runs.length; i += 2) {
      cells.fill(runs[i], offset, offset + runs[i + 1]);
      offset += runs[i + 1];
    }
    return cells;
  }
  // 保存、撤销和导出共用无损编码，避免整张地图的重复格子占满文件与本地缓存。
  function serializeProject(project) {
    const layers = project.layers.map((layer) => {
      const { cells, ...fields } = layer,
        runs = [];
      for (let start = 0; start < cells.length; ) {
        let end = start + 1;
        while (end < cells.length && cells[end] === cells[start]) end++;
        runs.push(cells[start], end - start);
        if (runs.length >= cells.length) return layer;
        start = end;
      }
      return { ...fields, cellsRle: runs };
    });
    return JSON.stringify({ ...project, layers });
  }
  function validateProject(raw) {
    if (!raw || raw.version !== 1) throw new Error('不支持的地图文件版本。');
    validateSize(raw.width, raw.height);
    if (!Array.isArray(raw.layers) || raw.layers.length < 1 || raw.layers.length > MAX_LAYERS)
      throw new Error(`地图需包含 1–${MAX_LAYERS} 个楼层。`);
    if (
      raw.customTiles !== undefined &&
      (!Array.isArray(raw.customTiles) || raw.customTiles.length > MAX_CUSTOM_TILES)
    )
      throw new Error('自定义素材列表无效。');
    const customTiles = (raw.customTiles || []).map(validateCustomTile);
    if (
      new Set(customTiles.map((t) => t.id)).size !== customTiles.length ||
      new Set(customTiles.map((t) => t.name)).size !== customTiles.length
    )
      throw new Error('自定义素材 ID 或名称重复。');
    const minNextId = Math.max(100, ...customTiles.map((t) => t.id + 1));
    const nextTileId = raw.nextTileId ?? minNextId;
    if (!Number.isSafeInteger(nextTileId) || nextTileId < minNextId) throw new Error('下一个素材 ID 无效。');
    const settings = validateSettings(raw.settings);
    const tileIds = new Set([...TILES, ...customTiles].map((t) => t.id));
    const zs = new Set();
    const layers = raw.layers.map((l) => {
      if (!l || !Number.isInteger(l.z) || l.z < MIN_Z || l.z > MAX_Z || zs.has(l.z))
        throw new Error('Z 坐标无效或重复。');
      zs.add(l.z);
      const cells = readLayerCells(l, raw.width * raw.height, tileIds);
      if (l.labels !== undefined && (!Array.isArray(l.labels) || l.labels.length > 500))
        throw new Error('标注数据无效。');
      const labels = (l.labels || []).map((a) => {
        if (!a || !inside(raw, a.x, a.y) || typeof a.text !== 'string') throw new Error('标注数据无效。');
        return { x: a.x, y: a.y, text: a.text.slice(0, 40) };
      });
      if (
        l.buildings !== undefined &&
        (!Array.isArray(l.buildings) || l.buildings.length > raw.width * raw.height)
      )
        throw new Error('建筑列表无效。');
      const geometry = { width: raw.width, height: raw.height, customTiles };
      const buildings =
        l.buildings === undefined
          ? migrateBuildings(geometry, { ...l, cells })
          : l.buildings.map((b) => validateBuilding(geometry, b));
      const occupied = new Set();
      for (const b of buildings)
        for (const [x, y] of buildingPoints(b)) {
          const index = y * raw.width + x;
          if (occupied.has(index) || cells[index] !== b.tile)
            throw new Error('建筑占地重叠或与地图格子不一致。');
          occupied.add(index);
        }
      return {
        z: l.z,
        name: String(l.name || `楼层 ${l.z}`).slice(0, 40),
        cells,
        labels,
        buildings,
      };
    });
    return {
      version: 1,
      name: String(raw.name || '未命名要塞').slice(0, 60),
      width: raw.width,
      height: raw.height,
      activeZ: zs.has(raw.activeZ) ? raw.activeZ : layers[0].z,
      customTiles,
      nextTileId,
      settings,
      layers,
    };
  }
  function demoProject() {
    const p = createProject('要塞');
    p.activeZ = -1;
    p.layers = [
      makeLayer(0, '地表 · 要塞入口', p.width, p.height),
      makeLayer(-1, '主厅与工坊', p.width, p.height),
      makeLayer(-2, '居住与生活', p.width, p.height),
      makeLayer(-3, '生产与仓储', p.width, p.height),
      makeLayer(-4, '矿道勘探', p.width, p.height),
    ];
    const offsetX = Math.floor((p.width - 64) / 2),
      offsetY = Math.floor((p.height - 48) / 2);
    const rect = (z, x, y, w, h, t) =>
      paint(p, [z], rectangle(x + offsetX, y + offsetY, x + offsetX + w - 1, y + offsetY + h - 1), t);
    const tile = (z, x, y, t) => setTile(p, z, x + offsetX, y + offsetY, t);
    const room = (z, x, y, w, h, t = 1) => {
      rect(z, x, y, w, h, 2);
      rect(z, x + 1, y + 1, w - 2, h - 2, t);
    };
    for (const l of p.layers) {
      const z = l.z;
      if (z >= -1)
        for (let y = 0; y < p.height; y++) {
          const x = offsetX + 7 + Math.round(2 * Math.sin((y - offsetY) / 7) + (y - offsetY) / 14);
          paint(p, [z], rectangle(x, y, x + 2, y), 3);
        }
      if (z === 0) {
        room(z, 26, 6, 15, 15);
        rect(z, 32, 0, 3, 8, 1);
        rect(z, 32, 6, 3, 1, 8);
        room(z, 19, 25, 11, 10, 13);
        room(z, 37, 25, 11, 10, 13);
        rect(z, 32, 20, 3, 16, 1);
        rect(z, 29, 29, 9, 3, 1);
        l.labels = [
          { x: 33, y: 12, text: '地表门楼' },
          { x: 24, y: 29, text: '地表农场' },
          { x: 42, y: 29, text: '牧场' },
        ];
      } else if (z === -1) {
        room(z, 29, 3, 9, 7);
        rect(z, 32, 0, 3, 4, 1);
        rect(z, 32, 3, 3, 1, 8);
        rect(z, 32, 9, 3, 5, 1);
        room(z, 17, 12, 12, 10, 12);
        room(z, 38, 12, 12, 10, 12);
        room(z, 29, 13, 9, 9);
        rect(z, 28, 16, 11, 3, 1);
        room(z, 22, 24, 23, 13);
        rect(z, 32, 21, 3, 4, 1);
        rect(z, 32, 24, 3, 1, 8);
        for (const x of [26, 30, 36, 40]) for (const y of [28, 31, 34]) tile(z, x, y, 10);
        room(z, 13, 25, 8, 8, 11);
        room(z, 46, 25, 8, 8, 11);
        rect(z, 20, 28, 3, 2, 1);
        rect(z, 44, 28, 3, 2, 1);
        room(z, 16, 37, 12, 7, 13);
        room(z, 39, 37, 12, 7, 12);
        rect(z, 28, 39, 11, 2, 1);
        rect(z, 32, 36, 3, 5, 1);
        for (const [x, y] of [
          [28, 17],
          [38, 17],
          [20, 29],
          [46, 29],
          [27, 40],
          [39, 40],
        ])
          tile(z, x, y, 8);
        l.labels = [
          { x: 33, y: 6, text: '要塞入口' },
          { x: 22, y: 16, text: '食物储藏' },
          { x: 43, y: 16, text: '原料仓库' },
          { x: 33, y: 26, text: '要塞大厅' },
          { x: 16, y: 28, text: '木工坊' },
          { x: 49, y: 28, text: '石工坊' },
          { x: 21, y: 39, text: '地下农田' },
          { x: 44, y: 39, text: '成品仓储' },
        ];
      } else if (z === -2) {
        rect(z, 31, 8, 5, 32, 1);
        for (let y = 10; y < 36; y += 7)
          for (const x of [21, 36]) {
            room(z, x, y, 10, 6);
            tile(z, x + 3, y + 2, 9);
            tile(z, x + 6, y + 2, 9);
            tile(z, x === 21 ? 30 : 36, y + 3, 8);
          }
        room(z, 26, 39, 15, 6, 10);
        l.labels = [
          { x: 33, y: 7, text: '矮人居住区' },
          { x: 33, y: 42, text: '公共餐厅' },
        ];
      } else if (z === -3) {
        rect(z, 31, 9, 5, 32, 1);
        for (const y of [12, 27]) {
          room(z, 16, y, 15, 11, y === 12 ? 11 : 12);
          room(z, 36, y, 15, 11, y === 12 ? 11 : 12);
          rect(z, 30, y + 4, 7, 3, 1);
        }
        l.labels = [
          { x: 23, y: 16, text: '冶炼工坊' },
          { x: 43, y: 16, text: '锻造工坊' },
          { x: 23, y: 31, text: '矿石仓库' },
          { x: 43, y: 31, text: '金属仓库' },
        ];
      } else {
        rect(z, 32, 10, 3, 32, 1);
        for (let y = 13; y <= 37; y += 6) {
          rect(z, 17, y, 16, 2, 1);
          rect(z, 34, y, 18, 2, 1);
        }
        l.labels = [{ x: 33, y: 8, text: '探索矿脉' }];
      }
      rect(z, 32, 17, 3, 3, z === 0 ? 5 : z === -4 ? 4 : 6);
      l.labels = l.labels.map((a) => ({ ...a, x: a.x + offsetX, y: a.y + offsetY }));
    }
    return p;
  }
  const api = {
    CUSTOM_GROUPS,
    MAX_CUSTOM_TILES,
    DEFAULT_SETTINGS,
    allTiles,
    getTile,
    validateCustomTile,
    validateSettings,
    saveCustomTile,
    deleteCustomTile,
    tileUsage,
    stamp,
    buildingPoints,
    buildingContains,
    buildingAt,
    buildingCells,
    validateBuilding,
    placeBuilding,
    DEFAULT_SIZE,
    MIN_SIZE,
    MAX_SIZE,
    MAX_TOOL_SIZE,
    MAX_LAYERS,
    MIN_Z,
    MAX_Z,
    MAX_IMPORT_BYTES,
    TILES,
    createProject,
    serializeProject,
    validateSize,
    cropImpact,
    resizeProject,
    makeLayer,
    layerAt,
    inside,
    setTile,
    line,
    curve,
    circle,
    rectangle,
    paint,
    floodFill,
    stairs,
    validateProject,
    demoProject,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DFModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
