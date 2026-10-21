(() => {
  'use strict';
  const M = window.DFModel,
    Maze = window.DFMaze,
    $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const ICONS = {
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z"/><path d="M9 3v16M15 5v16"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5Z"/><path d="m2 12 10 5 10-5M2 16l10 5 10-5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 1 1 4.6 2.5c-1 .6-1.8 1-1.8 2.5M12 17h.01"/>',
    folder: '<path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v11H3V7Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    upload: '<path d="M12 15V3m-4 4 4-4 4 4M4 15v5h16v-5"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/>',
    'chevron-down': '<path d="m7 10 5 5 5-5"/>',
    brush: '<path d="m14 5 3-3 5 5-11 11-5-5 8-8Z"/><path d="M6 13c-5 0-1 6-4 8 5 1 9-1 9-4"/>',
    rectangle: '<rect x="4" y="4" width="16" height="16" rx="1"/>',
    line: '<path d="m5 19 14-14"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/>',
    curve: '<path d="M5 5h14v14"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/>',
    circle: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M10 12h4m-2-2v4"/>',
    fill: '<path d="m4 9 8-7 8 8-8 9-8-8V9Z"/><path d="m7 2 6 7M3 11h16M20 15c4 5 1 7 0 6s-3-1 0-6Z"/>',
    maze: '<path d="M3 3h18v18H3V7h10v6H7v4h10V7h-1M7 3v4M13 17v4"/>',
    eraser: '<path d="m15 3 7 7-11 11H7l-5-5L15 3Z"/><path d="m6 12 7 7M11 21h11"/>',
    select: '<path d="M4 8V4h4m8 0h4v4M4 16v4h4m8 0h4v-4M4 11v2m16-2v2M11 4h2m-2 16h2"/>',
    hand: '<path d="M8 13V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v7c0 5-2 8-6 8-3 0-4-1-6-3l-5-5a2 2 0 0 1 3-3l2 3Z"/>',
    tag: '<path d="M4 5h16M12 5v15M8 20h8"/>',
    undo: '<path d="M3 10h11a6 6 0 0 1 0 12M3 10l5-5M3 10l5 5" transform="translate(0 -2)"/>',
    redo: '<path d="M21 8H10a6 6 0 0 0 0 12M21 8l-5-5M21 8l-5 5"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    ghost: '<rect x="3" y="3" width="12" height="12" rx="1"/><path d="M9 15v6h12V9h-6M9 9h6v6H9Z"/>',
    maximize: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    keyboard:
      '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h1m4 0h1m4 0h1M6 12h1m4 0h1m4 0h1M7 16h10"/>',
    edit: '<path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="1"/><path d="M16 8V3H3v13h5"/>',
    trash: '<path d="M3 6h18M9 3h6M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    stairs: '<path d="M3 21h5v-6h5V9h5V3h3M3 15V3h12M3 3l8 8"/>',
    'arrow-up-right': '<path d="M5 19 19 5M8 5h11v11"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    file: '<path d="M14 2H4v20h16V8l-6-6Zm0 0v6h6M8 13h8m-8 4h6"/>',
    image:
      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.map}</svg>`;
  $$('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  const toolDefs = [
    ['brush', '画笔', 'B'],
    ['rectangle', '矩形', 'R'],
    ['line', '直线', 'L'],
    ['curve', '曲线', 'C'],
    ['circle', '圆环', 'O'],
    ['fill', '填充', 'U'],
    ['maze', '迷宫', 'M'],
    ['eraser', '橡皮', 'E'],
    ['select', '选区', 'V'],
    ['hand', '平移', 'H'],
    ['tag', '标注', 'T'],
  ];
  const SHAPE_TOOLS = ['rectangle', 'line', 'curve'];
  const STORAGE = 'fortress-blueprint-v1';
  let p,
    storageAvailable = true,
    loadError = '';
  try {
    const data = localStorage.getItem(STORAGE);
    p = data ? M.validateProject(JSON.parse(data)) : M.demoProject();
  } catch (error) {
    p = M.demoProject();
    storageAvailable = false;
    loadError = '本地数据暂不可用。可继续编辑并导出 JSON 备份，原缓存未覆盖。';
  }
  const state = {
    tool: 'brush',
    tile: 1,
    size: 1,
    category: 'all',
    search: '',
    stamping: false,
    rotated: false,
    view: 'plan',
    grid: true,
    labels: true,
    ghost: false,
    cross: false,
    from: 0,
    to: -4,
    stairs: false,
    sectionX: Math.floor(p.width / 2),
    zoom: 16,
    ox: 0,
    oy: 0,
    width: 0,
    height: 0,
    hover: null,
    drag: null,
    selection: null,
    maze: null,
    clipboard: null,
    pasting: false,
    space: false,
    undo: [],
    redo: [],
  };
  const canvas = $('#map-canvas'),
    ctx = canvas.getContext('2d'),
    drawingSize = $('#drawing-size'),
    mini = $('#minimap'),
    mc = mini.getContext('2d');
  let tileMap = new Map(M.allTiles(p).map((t) => [t.id, t]));
  const tileDef = (id) => tileMap.get(id) || M.TILES[0];
  const sorted = () => [...p.layers].sort((a, b) => b.z - a.z);
  const currentLayer = () => M.layerAt(p, p.activeZ);
  const zText = (z) => (z > 0 ? `+${z}` : z < 0 ? `−${Math.abs(z)}` : '0');
  const zPadded = (z) => `${z > 0 ? '+' : z < 0 ? '−' : ''}${String(Math.abs(z)).padStart(2, '0')}`;
  function escapeHTML(text) {
    return String(text).replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  }
  function getLevels() {
    return state.cross
      ? p.layers
          .filter((l) => l.z >= Math.min(state.from, state.to) && l.z <= Math.max(state.from, state.to))
          .map((l) => l.z)
      : [p.activeZ];
  }
  function shapeSize() {
    return state.view === 'plan'
      ? { cols: p.width, rows: p.height, cw: state.zoom, ch: state.zoom }
      : { cols: p.height, rows: p.layers.length, cw: state.zoom, ch: state.zoom * 3 };
  }
  function planeCell(u, v) {
    if (state.view === 'plan') return M.inside(p, u, v) ? { x: u, y: v, z: p.activeZ } : null;
    const l = sorted()[v];
    return l && u >= 0 && u < p.height ? { x: state.sectionX, y: u, z: l.z } : null;
  }
  function pointAt(e, clamp = false) {
    const r = canvas.getBoundingClientRect(),
      s = shapeSize();
    let u = Math.floor((e.clientX - r.left - state.ox) / s.cw),
      v = Math.floor((e.clientY - r.top - state.oy) / s.ch);
    if (clamp) {
      u = Math.max(0, Math.min(s.cols - 1, u));
      v = Math.max(0, Math.min(s.rows - 1, v));
    }
    const cell = planeCell(u, v);
    return cell ? { u, v, ...cell } : null;
  }
  function dragPoints(d) {
    const { start: a, end: b } = d;
    if (state.tool === 'line') return M.line(a.u, a.v, b.u, b.v);
    if (state.tool === 'curve') return M.curve(a.u, a.v, b.u, b.v, d.verticalFirst);
    return M.rectangle(a.u, a.v, b.u, b.v, d.outline);
  }
  function updateCurveDirection(verticalFirst) {
    const d = state.drag;
    if (!d || d.pan || state.tool !== 'curve' || d.verticalFirst === verticalFirst) return;
    d.verticalFirst = verticalFirst;
    draw();
  }
  function circleParameters() {
    const diameter = $('#circle-diameter'),
      width = $('#circle-width');
    return diameter.validity.valid && width.validity.valid
      ? { diameter: diameter.valueAsNumber, width: width.valueAsNumber }
      : null;
  }
  function circlePoints(a) {
    const options = circleParameters(),
      s = shapeSize();
    return options ? M.circle(a.u, a.v, options.diameter, options.width, s.cols, s.rows) : [];
  }
  $('#circle-options').addEventListener('input', () => {
    const options = circleParameters();
    for (const input of $$('#circle-options input'))
      input.setAttribute('aria-invalid', String(!input.validity.valid));
    $('#circle-summary').textContent = options
      ? `外径 ${options.diameter + options.width * 2} 格 · ${options.diameter === 0 ? '实心圆' : '向外绘制'}`
      : '请输入整数：内径 0–512，环宽 1–512';
    draw();
  });
  function updateMazeControls() {
    const q = state.maze,
      input = $('#maze-width');
    input.setAttribute('aria-invalid', String(!input.validity.valid));
    $('#maze-start').disabled = !q;
    $('#maze-end').disabled = !q?.start;
    $('#maze-shuffle').disabled = q?.step !== 'ready' || !q?.start || !q?.end || !input.validity.valid;
    $('#maze-apply').disabled = !q?.preview;
    $('#maze-start').setAttribute('aria-pressed', q?.step === 'start');
    $('#maze-end').setAttribute('aria-pressed', q?.step === 'end');
    const coord = (a) => (a ? `${a.x + 1}, ${a.y + 1}` : '未选');
    const status = !q
      ? '① 点击空白区域，自动选中连通区域'
      : `${q.region.indices.length.toLocaleString()} 格 · 起点 ${coord(q.start)} · 终点 ${coord(q.end)} · ` +
        (q.error ||
          (q.step === 'start'
            ? '② 点击选区内指定起点'
            : q.step === 'end'
              ? '③ 点击选区内指定终点'
              : '④ 预览已就绪，可调整宽度、换一个或生成迷宫'));
    $('#maze-status').textContent = status;
    $('#maze-status').classList.toggle('maze-error', Boolean(q?.error));
  }
  function previewMaze() {
    const q = state.maze;
    if (!q) {
      updateMazeControls();
      return;
    }
    q.preview = null;
    q.error = '';
    if (!$('#maze-width').validity.valid) q.error = '通道宽度请输入 1–512 之间的整数';
    else if (q.step === 'ready' && q.start && q.end) {
      try {
        q.preview = Maze.generateMaze(q.region, q.start, q.end, $('#maze-width').valueAsNumber, q.seed);
      } catch (error) {
        q.error = error.message;
      }
    }
    updateMazeControls();
    draw();
  }
  function mazeClick(a) {
    if (!state.maze) {
      try {
        state.maze = {
          region: Maze.selectBlankRegion(p, p.activeZ, a.x, a.y),
          start: null,
          end: null,
          step: 'start',
          seed: Math.floor(Math.random() * 4294967296),
          preview: null,
        };
      } catch (error) {
        toast(error.message, true);
        return;
      }
    } else {
      const q = state.maze;
      if (!q.region.mask[a.y * p.width + a.x]) {
        toast('请在高亮选区内指定起终点；切换区域请点击「重新选区」。', true);
        return;
      }
      if (q.step === 'ready') {
        toast('可点击「选起点」或「选终点」修改位置，或点击「生成迷宫」确认。');
        return;
      }
      const point = { x: a.x, y: a.y };
      if (q.step === 'start') {
        q.start = point;
        q.step = q.end ? 'ready' : 'end';
      } else {
        q.end = point;
        q.step = 'ready';
      }
    }
    previewMaze();
  }
  $('#maze-width').addEventListener('input', previewMaze);
  for (const point of ['start', 'end'])
    $('#maze-' + point).addEventListener('click', () => {
      if (!state.maze) return;
      state.maze.step = point;
      state.maze.preview = null;
      state.maze.error = '';
      updateMazeControls();
      draw();
    });
  $('#maze-shuffle').addEventListener('click', () => {
    if (state.maze) {
      state.maze.seed = (state.maze.seed + 1) >>> 0;
      previewMaze();
    }
  });
  $('#maze-reset').addEventListener('click', () => {
    state.maze = null;
    updateMazeControls();
    draw();
  });
  $('#maze-apply').addEventListener('click', () => {
    const q = state.maze;
    if (!q?.preview) return;
    try {
      change(() => Maze.applyMaze(p, q.region, q.preview));
      toast(
        `已填充 ${q.region.indices.length.toLocaleString()} 格迷宫，通道宽 ${q.preview.pathWidth} 格；可一次撤销。`
      );
    } catch (error) {
      toast(error.message, true);
    }
  });
  function updateDrawingSize(e) {
    const d = state.drag;
    drawingSize.hidden = !d || d.pan || !SHAPE_TOOLS.includes(state.tool);
    if (drawingSize.hidden) return;
    // Use the same inclusive, map-clamped endpoints as the drawing preview.
    drawingSize.textContent = `${Math.abs(d.end.u - d.start.u) + 1}*${Math.abs(d.end.v - d.start.v) + 1}`;
    const gap = 16,
      margin = 8,
      width = drawingSize.offsetWidth,
      height = drawingSize.offsetHeight;
    let x = e.clientX + gap,
      y = e.clientY + gap;
    if (x + width > window.innerWidth - margin) x = e.clientX - gap - width;
    if (y + height > window.innerHeight - margin) y = e.clientY - gap - height;
    drawingSize.style.left = `${Math.max(margin, Math.min(x, window.innerWidth - width - margin))}px`;
    drawingSize.style.top = `${Math.max(margin, Math.min(y, window.innerHeight - height - margin))}px`;
  }
  let toastTimer;
  function toast(message, error = false) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.toggle('error', error);
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3400);
  }
  let saveTimer;
  function saveNow() {
    if (state.drag && !state.drag.pan) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveNow, 250);
      return;
    }
    if (!storageAvailable) {
      $('#save-status').textContent = '请导出 JSON 保存';
      return;
    }
    try {
      localStorage.setItem(STORAGE, M.serializeProject(p));
      $('#save-status').textContent = '已自动保存到本地';
    } catch (e) {
      $('#save-status').textContent = '存储已满，请导出备份';
      toast('浏览器存储不可用，请导出 JSON 保存规划。', true);
    }
  }
  function save() {
    $('#save-status').textContent = storageAvailable ? '正在保存…' : '请导出 JSON 保存';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 250);
  }
  window.addEventListener('pagehide', () => {
    finishDrag();
    if (storageAvailable) saveNow();
  });
  function snapshot() {
    return M.serializeProject(p);
  }
  function commit(before) {
    if (before === snapshot()) return false;
    state.maze = null;
    state.undo.push(before);
    trimHistory(state.undo);
    state.redo = [];
    refresh();
    save();
    return true;
  }
  function trimHistory(stack) {
    // Large custom maps must not retain thirty full-size project snapshots.
    let bytes = stack.reduce((n, entry) => n + entry.length * 2, 0);
    while (stack.length > 1 && (stack.length > 30 || bytes > 32 * 1024 * 1024))
      bytes -= stack.shift().length * 2;
  }
  function change(fn) {
    const before = snapshot();
    fn();
    commit(before);
  }
  function history(dir) {
    const src = state[dir],
      dest = state[dir === 'undo' ? 'redo' : 'undo'];
    if (!src.length) return;
    dest.push(snapshot());
    trimHistory(dest);
    p = M.validateProject(JSON.parse(src.pop()));
    state.maze = null;
    state.selection = null;
    state.pasting = false;
    state.sectionX = Math.min(state.sectionX, p.width - 1);
    refresh();
    save();
    toast(dir === 'undo' ? '已撤销上一步操作' : '已重做');
  }
  function fit() {
    const s = shapeSize(),
      availableW = state.width - 78,
      availableH = state.height - (state.view === 'section' ? 155 : 108);
    state.zoom = Math.max(
      0.25,
      Math.min(28, availableW / s.cols, availableH / (s.rows * (state.view === 'section' ? 3 : 1)))
    );
    const d = shapeSize();
    state.ox = Math.round((state.width - d.cols * d.cw) / 2 + 9);
    state.oy = Math.round((state.height - d.rows * d.ch) / 2 + 9 + (state.view === 'section' ? 15 : 0));
    draw();
  }
  function zoom(factor, cx = state.width / 2, cy = state.height / 2) {
    const previous = state.zoom;
    state.zoom = Math.max(0.25, Math.min(48, previous * factor));
    const ratio = state.zoom / previous;
    state.ox = cx - (cx - state.ox) * ratio;
    state.oy = cy - (cy - state.oy) * ratio;
    draw();
  }
  function editingView() {
    fit();
    if (state.view === 'plan' && state.zoom < 12) zoom(12 / state.zoom);
  }
  function setTool(tool) {
    if (tool === 'maze' && state.view !== 'plan') setView('plan');
    state.tool = tool;
    state.maze = null;
    state.stamping = false;
    state.stairs = false;
    state.pasting = false;
    state.selection = null;
    updateTools();
    updateRange();
    updateSelection();
    draw();
  }
  function updateTools() {
    $$('.tool-button').forEach((b) => {
      b.classList.toggle('active', !state.stamping && b.dataset.tool === state.tool);
      b.setAttribute('aria-pressed', !state.stamping && b.dataset.tool === state.tool);
    });
    $('#stairs-btn').classList.toggle('active', state.stairs);
    $('#tool-status').textContent = state.stamping
      ? '放置模板'
      : state.stairs
        ? '垂直楼梯'
        : state.pasting
          ? '粘贴选区'
          : toolDefs.find((t) => t[0] === state.tool)[1];
    canvas.style.cursor =
      state.tool === 'hand' || state.space ? 'grab' : state.tool === 'tag' ? 'text' : 'crosshair';
    $('#brush-size').disabled = state.stamping || !['brush', 'eraser'].includes(state.tool);
    $('#circle-options').hidden = state.tool !== 'circle' || state.stamping || state.stairs || state.pasting;
    $('#maze-options').hidden = state.tool !== 'maze' || state.stamping || state.stairs || state.pasting;
    updateMazeControls();
    $('#rotate-stamp').hidden = !state.stamping;
    $('#stamp-material').classList.toggle('active', state.stamping);
    $('#canvas-hint').innerHTML = state.stamping
      ? '<kbd>点击</kbd> 放置模板 <span>·</span> <kbd>Q</kbd> 旋转 <span>·</span> <kbd>Esc</kbd> 取消'
      : state.stairs
        ? '<kbd>点击</kbd> 放置跨层楼梯 <span>·</span> <kbd>Esc</kbd> 取消'
        : state.pasting
          ? '<kbd>点击</kbd> 粘贴选区 <span>·</span> <kbd>Esc</kbd> 取消'
          : state.tool === 'maze'
            ? '<kbd>点击</kbd> 选空白区 → 起点 → 终点 <span>·</span> 上方预览并生成'
            : state.tool === 'rectangle'
              ? '<kbd>拖动</kbd> 绘制矩形 <span>·</span> <kbd>Shift</kbd> 仅边框'
              : state.tool === 'curve'
                ? '<kbd>拖动</kbd> L 形连接（先横后竖） <span>·</span> <kbd>Shift</kbd> 先竖后横'
                : state.tool === 'circle'
                  ? '<kbd>点击</kbd> 放置圆心，向外绘制圆环 <span>·</span> <kbd>右键</kbd> 擦除圆环'
                  : '<kbd>拖动</kbd> 绘制 <span>·</span> <kbd>空格 + 拖动</kbd> 平移 <span>·</span> <kbd>滚轮</kbd> 缩放';
  }
  $('#tools-grid').innerHTML = toolDefs
    .map(
      ([id, name, key]) =>
        `<button class="tool-button" data-tool="${id}" title="${name} (${key})" aria-label="${name}"><span>${icon(id)}</span>${name}<kbd>${key}</kbd></button>`
    )
    .join('');
  $('#tools-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tool]');
    if (b) setTool(b.dataset.tool);
  });
  function matchesCategory(t, category) {
    return (
      category === 'all' ||
      t.group === category ||
      (category === '地形' && t.group === '连接') ||
      (category === '分区' && t.group === '区域')
    );
  }
  function materialSwatch(t) {
    return `<span class="material-swatch" style="background:${t.color};color:${t.ink}">${escapeHTML(t.symbol || '▰')}</span>`;
  }
  function renderMaterials() {
    const items = M.allTiles(p).filter(
      (t) =>
        t.id !== 0 &&
        matchesCategory(t, state.category) &&
        `${t.name} ${t.description || ''}`.toLowerCase().includes(state.search.toLowerCase())
    );
    $('#materials').innerHTML =
      items
        .map(
          (t) =>
            `<button class="material-button ${t.id === state.tile ? 'active' : ''}" data-tile="${t.id}" title="${escapeHTML(t.name + (t.description ? ' · ' + t.description : ''))}" aria-label="${escapeHTML(t.name)}" aria-pressed="${t.id === state.tile}">${materialSwatch(t)}<span class="material-name">${escapeHTML(t.name === '开掘 / 地板' ? '开掘地板' : t.name === '建造墙壁' ? '墙壁' : t.name)}</span>${t.id >= 100 ? '<i class="custom-dot" aria-label="自定义"></i>' : ''}</button>`
        )
        .join('') || '<p class="palette-empty">暂无匹配素材，点击「自定义」添加。</p>';
    const t = tileDef(state.tile);
    $('#selected-swatch').style.background = t.color;
    $('#selected-swatch').style.color = t.ink;
    $('#selected-swatch').textContent = t.symbol || '▰';
    $('#selected-name').textContent = t.name;
    $('#selected-code').textContent = String(t.id).padStart(2, '0');
    $('#material-details').hidden = t.id < 100;
    $('#selected-description').textContent = t.description || '未填写功能说明';
    $('#stamp-material').textContent =
      `模板 ${state.rotated ? t.height : t.width} × ${state.rotated ? t.width : t.height}`;
    const used = new Set(currentLayer().cells);
    $('#custom-legend').innerHTML = p.customTiles
      .filter((v) => used.has(v.id))
      .map(
        (v) =>
          `<button type="button" data-legend-tile="${v.id}" title="${escapeHTML(v.name + (v.description ? ' · ' + v.description : ''))}">${materialSwatch(v)}<span>${escapeHTML(v.name)}</span></button>`
      )
      .join('');
  }
  $('#custom-legend').addEventListener('click', (e) => {
    const b = e.target.closest('[data-legend-tile]');
    if (b) {
      resetPaletteFilter();
      selectMaterial(Number(b.dataset.legendTile));
    }
  });
  function selectMaterial(id, useDefault = true) {
    if (!tileMap.has(id)) return;
    state.tile = id;
    state.rotated = false;
    state.stamping = false;
    const t = tileDef(id);
    if (useDefault && t.tool) {
      setTool(t.tool === 'stamp' ? 'brush' : t.tool);
      if (t.tool === 'stamp') startStamp();
    } else if (['eraser', 'select', 'hand', 'tag'].includes(state.tool)) setTool('brush');
    state.stairs = false;
    renderMaterials();
    updateTools();
    updateRange();
    draw();
  }
  function startStamp() {
    if (state.view !== 'plan') setView('plan');
    setTool('brush');
    state.stamping = true;
    updateTools();
    draw();
  }
  function rotateStamp() {
    state.rotated = !state.rotated;
    renderMaterials();
    draw();
  }
  $('#stamp-material').addEventListener('click', startStamp);
  $('#rotate-stamp').addEventListener('click', rotateStamp);
  $('#material-search').addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    renderMaterials();
  });
  $('#materials').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tile]');
    if (b) selectMaterial(Number(b.dataset.tile));
  });
  $$('.palette-tabs button').forEach((b) =>
    b.addEventListener('click', () => {
      state.category = b.dataset.category;
      $$('.palette-tabs button').forEach((t) => {
        t.classList.toggle('active', t === b);
        t.setAttribute('aria-selected', t === b);
      });
      renderMaterials();
    })
  );
  $('#brush-size').addEventListener('change', (e) => {
    change(() => {
      p.settings.brushSize = Number(e.target.value);
    });
  });
  function renderLayers() {
    const levels = sorted(),
      target = getLevels();
    $('#levels-list').innerHTML = levels
      .map(
        (l) =>
          `<button class="level-item ${l.z === p.activeZ ? 'active' : ''} ${state.cross && target.includes(l.z) ? 'range-selected' : ''}" data-z="${l.z}" aria-label="切换到 Z ${l.z} ${escapeHTML(l.name)}" aria-pressed="${l.z === p.activeZ}"><span class="level-z">Z ${zText(l.z)}</span><span class="level-name">${escapeHTML(l.name)}</span><span class="level-dot"></span></button>`
      )
      .join('');
    $('#layer-tabs').innerHTML = levels
      .map(
        (l) =>
          `<button class="layer-tab ${l.z === p.activeZ ? 'active' : ''}" data-z="${l.z}" title="${escapeHTML(l.name)}"><span>Z ${zText(l.z)}</span>${escapeHTML(l.name.split(' · ')[0])}</button>`
      )
      .join('');
    $('#level-count').textContent = p.layers.length;
    $('#project-layers').textContent = `${p.layers.length} 个 Z 层`;
    $('#delete-layer').disabled = p.layers.length <= 1;
    const opts = levels.map((l) => `<option value="${l.z}">Z ${zText(l.z)}</option>`).join('');
    if (!M.layerAt(p, state.from)) state.from = levels[0].z;
    if (!M.layerAt(p, state.to)) state.to = levels.at(-1).z;
    for (const id of ['from', 'to']) {
      $(`#range-${id}`).innerHTML = opts;
      $(`#range-${id}`).value = state[id];
    }
    updateRange();
  }
  function setLayer(z) {
    if (!M.layerAt(p, z)) return;
    finishDrag();
    state.maze = null;
    p.activeZ = z;
    state.selection = null;
    state.pasting = false;
    refresh();
    save();
  }
  for (const id of ['levels-list', 'layer-tabs'])
    $('#' + id).addEventListener('click', (e) => {
      const b = e.target.closest('[data-z]');
      if (b) setLayer(Number(b.dataset.z));
    });
  function updateRange() {
    const n = getLevels().length;
    $('#range-summary').textContent =
      state.tool === 'maze' && !state.stairs && !state.pasting
        ? '迷宫仅编辑当前楼层 · 不应用跨层同步'
        : state.view === 'section'
          ? '剖面直接编辑 · 跨层同步仅用于平面'
          : state.cross
            ? `同步编辑 ${n} 层 · Z ${zText(Math.max(state.from, state.to))} 至 ${zText(Math.min(state.from, state.to))}`
            : '仅编辑当前楼层';
    $('#cross-indicator').hidden =
      (!state.cross && !state.stairs) ||
      state.view === 'section' ||
      (state.tool === 'maze' && !state.stairs && !state.pasting);
    $('#cross-indicator-text').textContent = state.stairs
      ? `连接 Z ${zText(state.from)} → ${zText(state.to)}`
      : `跨层编辑中 · ${n} 个楼层`;
    $('#cross-toggle').checked = state.cross;
  }
  $('#cross-toggle').addEventListener('change', (e) => {
    state.cross = e.target.checked;
    renderLayers();
    draw();
    if (state.cross && state.view === 'section') toast('剖面视图直接编辑各 Z 层；跨层同步用于俯视平面。');
  });
  for (const id of ['from', 'to'])
    $(`#range-${id}`).addEventListener('change', (e) => {
      state[id] = Number(e.target.value);
      renderLayers();
      draw();
    });
  $('#stairs-btn').addEventListener('click', () => {
    if (state.view !== 'plan') setView('plan');
    state.stamping = false;
    state.maze = null;
    state.stairs = !state.stairs;
    state.selection = null;
    state.pasting = false;
    updateTools();
    updateRange();
    updateSelection();
    draw();
    if (state.stairs) toast('在地图上点击，即可连接选定起止层的楼梯。');
  });
  function updateSelection() {
    const s = state.selection;
    $('#selection-actions').hidden = !s;
    if (s) $('#selection-size').textContent = `${Math.abs(s.u1 - s.u0) + 1} × ${Math.abs(s.v1 - s.v0) + 1}`;
  }
  function refresh() {
    tileMap = new Map(M.allTiles(p).map((t) => [t.id, t]));
    if (!tileMap.has(state.tile)) {
      state.tile = 1;
      state.stamping = false;
    }
    if (
      state.clipboard &&
      state.clipboard.definitions.some(
        (t) => !tileMap.has(t.id) || JSON.stringify(tileDef(t.id)) !== JSON.stringify(t)
      )
    ) {
      state.clipboard = null;
      state.pasting = false;
      $('#paste-btn').disabled = true;
    }
    for (const key of ['grid', 'labels', 'ghost', 'symbols']) state[key] = p.settings[key];
    state.size = p.settings.brushSize;
    $('#brush-size').value = state.size;
    for (const key of ['grid', 'labels', 'ghost'])
      $('#' + key + '-btn').setAttribute('aria-pressed', state[key]);
    state.sectionX = Math.max(0, Math.min(state.sectionX, p.width - 1));
    $('#project-title').textContent = p.name;
    document.title = `${p.name} · 要塞蓝图`;
    $('#project-dimensions').textContent = `${p.width} × ${p.height} 格`;
    $('#canvas-subtitle').textContent =
      state.view === 'plan' ? `${p.width} × ${p.height} 格 · F 查看全图` : '横轴 Y · 纵轴 Z · 可直接绘制';
    $('#overview-scale').textContent = `${p.width} × ${p.height}`;
    $('#canvas-z').textContent = state.view === 'plan' ? `Z ${zPadded(p.activeZ)}` : 'Z AXIS';
    $('#canvas-layer-name').textContent = state.view === 'plan' ? currentLayer().name : '纵向剖面';
    $('#status-z').textContent = `Z ${zText(p.activeZ)}`;
    $('#section-column').max = p.width - 1;
    $('#section-column').value = state.sectionX;
    $('#section-column-value').textContent = `X ${state.sectionX + 1}`;
    $('#undo-btn').disabled = !state.undo.length;
    $('#redo-btn').disabled = !state.redo.length;
    renderLayers();
    renderMaterials();
    updateTools();
    updateSelection();
    draw();
  }
  function paintTile(context, tile, x, y, w, h, alpha = 1, symbols = true) {
    const t = tileDef(tile);
    context.globalAlpha = alpha;
    context.fillStyle = t.color;
    context.fillRect(x, y, w, h);
    if (tile === 2 && w >= 9) {
      context.strokeStyle = '#596e5c55';
      context.lineWidth = 0.5;
      context.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
      context.fillStyle = '#8b998833';
      context.fillRect(x + 2, y + 2, w - 4, 1);
    }
    if (symbols && state.symbols && w >= 10 && t.symbol) {
      context.fillStyle = t.ink;
      context.font = `${Math.min(17, Math.max(10, w * 0.8))}px ${tile === 11 ? 'sans-serif' : 'monospace'}`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(t.symbol, x + w / 2, y + h / 2 + 0.5, w - 2);
    }
    context.globalAlpha = 1;
  }
  function paintBuilding(context, b, x, y, cw, ch, alpha = 1) {
    const t = tileDef(b.tile),
      w = b.width * cw,
      h = b.height * ch;
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = t.color;
    const hollow = b.shape === 'outline' && b.width > 2 && b.height > 2;
    if (hollow) {
      context.fillRect(x, y, w, ch);
      context.fillRect(x, y + h - ch, w, ch);
      context.fillRect(x, y + ch, cw, h - ch * 2);
      context.fillRect(x + w - cw, y + ch, cw, h - ch * 2);
    } else context.fillRect(x, y, w, h);
    context.strokeStyle = t.ink + '80';
    context.lineWidth = 1;
    context.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), Math.max(0, h - 1));
    if (hollow) context.strokeRect(x + cw, y + ch, w - cw * 2, h - ch * 2);
    if (state.symbols && w >= 10 && h >= 10 && t.symbol) {
      context.fillStyle = t.ink;
      context.font = `${Math.min(24, Math.max(10, cw * 0.8), (hollow ? ch : h) * 0.8)}px monospace`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(t.symbol, x + w / 2, y + (hollow ? ch : h) / 2 + 0.5, w - 4);
    }
    context.restore();
  }
  function paintSectionBuilding(b, row, x0, y0, s, alpha = 1) {
    if (state.sectionX < b.x || state.sectionX >= b.x + b.width) return;
    const x = x0 + b.y * s.cw,
      y = y0 + row * s.ch;
    if (
      b.shape === 'outline' &&
      b.width > 2 &&
      b.height > 2 &&
      state.sectionX > b.x &&
      state.sectionX < b.x + b.width - 1
    ) {
      paintBuilding(ctx, { ...b, width: 1, height: 1, shape: 'solid' }, x, y, s.cw, s.ch, alpha);
      // A hollow footprint has two separate visible ends, but only one symbol.
      paintTile(ctx, b.tile, x + (b.height - 1) * s.cw, y, s.cw, s.ch, alpha, false);
    } else paintBuilding(ctx, { ...b, width: b.height, height: 1, shape: 'solid' }, x, y, s.cw, s.ch, alpha);
  }
  function draw() {
    if (!state.width) return;
    const { width: w, height: h } = state,
      s = shapeSize(),
      dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#eef1f4';
    ctx.fillRect(0, 0, w, h);
    // Quiet drafting-paper texture outside the map.
    ctx.fillStyle = '#d1d8e0';
    for (let y = 8; y < h; y += 20) for (let x = 8; x < w; x += 20) ctx.fillRect(x, y, 0.65, 0.65);
    const x0 = state.ox,
      y0 = state.oy,
      mw = s.cols * s.cw,
      mh = s.rows * s.ch;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x0, y0, mw, mh);
    const minU = Math.max(0, Math.floor(-x0 / s.cw)),
      maxU = Math.min(s.cols, Math.ceil((w - x0) / s.cw)),
      minV = Math.max(0, Math.floor(-y0 / s.ch)),
      maxV = Math.min(s.rows, Math.ceil((h - y0) / s.ch));
    const layers = sorted(),
      active = currentLayer(),
      lower = layers.find((l) => l.z < p.activeZ);
    const grouped = new Map(layers.map((l) => [l.z, M.buildingCells(p, l)]));
    for (let v = minV; v < maxV; v++)
      for (let u = minU; u < maxU; u++) {
        const l = state.view === 'plan' ? active : layers[v],
          index = state.view === 'plan' ? v * p.width + u : u * p.width + state.sectionX,
          tile = l.cells[index];
        if (tile)
          paintTile(ctx, tile, x0 + u * s.cw, y0 + v * s.ch, s.cw, s.ch, 1, !grouped.get(l.z).has(index));
        else if (state.ghost && state.view === 'plan' && lower && lower.cells[index])
          paintTile(
            ctx,
            lower.cells[index],
            x0 + u * s.cw,
            y0 + v * s.ch,
            s.cw,
            s.ch,
            0.23,
            !grouped.get(lower.z).has(index)
          );
        else if (state.view === 'plan' && s.cw > 10 && (u * 31 + v * 17) % 67 === 0) {
          ctx.fillStyle = '#b6c0ca';
          ctx.fillRect(x0 + (u + 0.4) * s.cw, y0 + (v + 0.45) * s.ch, 2, 1);
        }
      }
    if (state.grid && s.cw >= 2) {
      ctx.lineWidth = 0.5;
      for (let u = minU; u <= maxU; u++) {
        ctx.strokeStyle = u % 5 === 0 ? '#aebac6' : '#d0d7df';
        ctx.beginPath();
        ctx.moveTo(x0 + u * s.cw, Math.max(0, y0));
        ctx.lineTo(x0 + u * s.cw, Math.min(h, y0 + mh));
        ctx.stroke();
      }
      for (let v = minV; v <= maxV; v++) {
        ctx.strokeStyle = v % 5 === 0 || state.view === 'section' ? '#aebac6' : '#d0d7df';
        ctx.beginPath();
        ctx.moveTo(Math.max(0, x0), y0 + v * s.ch);
        ctx.lineTo(Math.min(w, x0 + mw), y0 + v * s.ch);
        ctx.stroke();
      }
    }
    // Draw each footprint once above the grid: no internal cell dividers or repeated symbols.
    if (state.view === 'plan') {
      if (state.ghost && lower)
        for (const b of lower.buildings) {
          ctx.save();
          ctx.beginPath();
          for (const [x, y] of M.buildingPoints(b))
            if (!active.cells[y * p.width + x]) ctx.rect(x0 + x * s.cw, y0 + y * s.ch, s.cw, s.ch);
          ctx.clip();
          // Reset the ghost background so the translucent footprint is not painted twice.
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(x0 + b.x * s.cw, y0 + b.y * s.ch, b.width * s.cw, b.height * s.ch);
          paintBuilding(ctx, b, x0 + b.x * s.cw, y0 + b.y * s.ch, s.cw, s.ch, 0.23);
          ctx.restore();
        }
      for (const b of active.buildings)
        if (b.x < maxU && b.x + b.width > minU && b.y < maxV && b.y + b.height > minV)
          paintBuilding(ctx, b, x0 + b.x * s.cw, y0 + b.y * s.ch, s.cw, s.ch);
    } else
      for (let row = minV; row < maxV; row++)
        for (const b of layers[row].buildings) paintSectionBuilding(b, row, x0, y0, s);
    ctx.strokeStyle = '#8998a8';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x0, y0, mw, mh);
    // Keep coordinate rulers on screen even when viewing only part of a large map.
    const headerY = Math.max(44, y0 - 19),
      headerX = Math.max(0, x0 - 29);
    ctx.fillStyle = '#e2e8ef';
    ctx.fillRect(x0, headerY, mw, 19);
    ctx.fillRect(headerX, y0, 29, mh);
    ctx.fillStyle = '#354457';
    ctx.font = '600 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const step = Math.max(1, Math.ceil(26 / s.cw));
    for (let u = minU; u < maxU; u++)
      if ((u % step === 0 && s.cols - 1 - u >= step) || u === s.cols - 1)
        ctx.fillText(String(u + 1), x0 + (u + 0.5) * s.cw, headerY + 10);
    const rowStep = Math.max(1, Math.ceil(12 / s.ch));
    for (let v = minV; v < maxV; v++)
      if (state.view === 'section' || (v % rowStep === 0 && s.rows - 1 - v >= rowStep) || v === s.rows - 1)
        ctx.fillText(
          state.view === 'plan' ? String(v + 1) : zText(layers[v].z),
          headerX + 14,
          y0 + (v + 0.5) * s.ch
        );
    if (state.view === 'section') {
      ctx.save();
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#354457';
      ctx.textAlign = 'left';
      for (let v = minV; v < maxV; v++) {
        ctx.fillText(layers[v].name, x0 + mw + 7, y0 + (v + 0.5) * s.ch);
      }
      ctx.restore();
    }
    if (state.labels && state.view === 'plan' && s.cw >= 7)
      for (const label of currentLayer().labels) {
        const x = x0 + (label.x + 0.5) * s.cw,
          y = y0 + (label.y + 0.5) * s.ch;
        ctx.font = `600 ${Math.min(16, Math.max(13, s.cw * 0.8))}px sans-serif`;
        const tw = ctx.measureText(label.text).width;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#819688';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.roundRect(x - tw / 2 - 7, y - 12, tw + 14, 24, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#233c2b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.text, x, y + 0.5);
      }
    if (state.selection) {
      const q = state.selection;
      drawBox(
        Math.min(q.u0, q.u1),
        Math.min(q.v0, q.v1),
        Math.abs(q.u1 - q.u0) + 1,
        Math.abs(q.v1 - q.v0) + 1,
        '#457449',
        true
      );
    }
    if (state.maze && state.view === 'plan') {
      const q = state.maze,
        mask = q.region.mask;
      ctx.save();
      ctx.beginPath();
      for (let v = minV; v < maxV; v++)
        for (let u = minU; u < maxU; u++) {
          const i = v * p.width + u;
          if (!mask[i]) continue;
          const x = x0 + u * s.cw,
            y = y0 + v * s.ch;
          ctx.fillStyle = q.preview ? (q.preview.cells[i] === 1 ? '#d5e8ba' : '#57695d') : '#238cbb';
          ctx.globalAlpha = q.preview ? 0.85 : 0.23;
          ctx.fillRect(x, y, s.cw, s.ch);
          if (u === 0 || !mask[i - 1]) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + s.ch);
          }
          if (u === p.width - 1 || !mask[i + 1]) {
            ctx.moveTo(x + s.cw, y);
            ctx.lineTo(x + s.cw, y + s.ch);
          }
          if (v === 0 || !mask[i - p.width]) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + s.cw, y);
          }
          if (v === p.height - 1 || !mask[i + p.width]) {
            ctx.moveTo(x, y + s.ch);
            ctx.lineTo(x + s.cw, y + s.ch);
          }
        }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#126c9b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const [point, text, color] of [
        [q.start, '起', '#246237'],
        [q.end, '终', '#a3332a'],
      ]) {
        if (!point) continue;
        const x = x0 + (point.x + 0.5) * s.cw,
          y = y0 + (point.y + 0.5) * s.ch;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(8, Math.min(12, s.cw * 0.7)), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
      }
      ctx.restore();
    }
    if (state.drag && !state.drag.pan && (SHAPE_TOOLS.includes(state.tool) || state.tool === 'select')) {
      const a = state.drag.start,
        b = state.drag.end;
      if (state.tool === 'select')
        drawBox(
          Math.min(a.u, b.u),
          Math.min(a.v, b.v),
          Math.abs(a.u - b.u) + 1,
          Math.abs(a.v - b.v) + 1,
          '#457449',
          true
        );
      else {
        const pts = dragPoints(state.drag);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle =
          state.tool === 'curve' ? (state.drag.erase ? '#ad443b' : '#587e43') : tileDef(state.tile).ink;
        for (const [u, v] of pts) {
          ctx.fillRect(x0 + u * s.cw, y0 + v * s.ch, s.cw, s.ch);
        }
        ctx.globalAlpha = 1;
      }
    }
    if (state.hover && !state.drag) {
      const a = state.hover;
      if (state.pasting && state.clipboard) {
        const clip = state.clipboard;
        const grouped = clipboardBuildingCells(clip);
        for (let v = 0; v < clip.height; v++)
          for (let u = 0; u < clip.width; u++) {
            if (planeCell(a.u + u, a.v + v))
              paintTile(
                ctx,
                clip.cells[v * clip.width + u],
                x0 + (a.u + u) * s.cw,
                y0 + (a.v + v) * s.ch,
                s.cw,
                s.ch,
                0.65,
                !grouped.has(v * clip.width + u)
              );
          }
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, y0, mw, mh);
        ctx.clip();
        for (const b of clip.buildings) {
          if (state.view === 'plan')
            paintBuilding(ctx, b, x0 + (a.u + b.x) * s.cw, y0 + (a.v + b.y) * s.ch, s.cw, s.ch, 0.65);
          else
            paintSectionBuilding(
              { ...b, x: state.sectionX + b.x, y: a.u + b.y },
              a.v + b.row,
              x0,
              y0,
              s,
              0.65
            );
        }
        ctx.restore();
        drawBox(a.u, a.v, clip.width, clip.height, '#577d40', true);
      } else if (state.stamping && !state.space) {
        const t = tileDef(state.tile),
          w = state.rotated ? t.height : t.width,
          h = state.rotated ? t.width : t.height;
        const valid = M.inside(p, a.x + w - 1, a.y + h - 1);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, y0, mw, mh);
        ctx.clip();
        paintBuilding(
          ctx,
          { tile: t.id, width: w, height: h, shape: t.shape },
          x0 + a.u * s.cw,
          y0 + a.v * s.ch,
          s.cw,
          s.ch,
          0.55
        );
        ctx.restore();
        drawBox(a.u, a.v, w, h, valid ? '#587e43' : '#ad443b', true);
      } else if (state.tool === 'circle' && !state.space) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#587e43';
        for (const [u, v] of circlePoints(a)) ctx.fillRect(x0 + u * s.cw, y0 + v * s.ch, s.cw, s.ch);
        ctx.restore();
        drawBox(a.u, a.v, 1, 1, '#587e43', false);
      } else if (state.tool !== 'hand' && !state.space) {
        const bs = state.stairs ? 1 : ['brush', 'eraser'].includes(state.tool) ? state.size : 1,
          off = Math.floor((bs - 1) / 2);
        drawBox(a.u - off, a.v - off, bs, bs, state.tool === 'eraser' ? '#b68676' : '#587e43', false);
        if (state.tool === 'eraser') {
          const hit = new Set();
          for (const [u, v] of M.rectangle(a.u - off, a.v - off, a.u - off + bs - 1, a.v - off + bs - 1)) {
            const c = planeCell(u, v),
              b = c && M.buildingAt(p, c.z, c.x, c.y);
            if (!b || hit.has(b)) continue;
            hit.add(b);
            if (state.view === 'plan') drawBox(b.x, b.y, b.width, b.height, '#b68676', true);
            else drawBox(b.y, v, b.height, 1, '#b68676', true);
          }
        }
      }
    }
    if (state.hover) {
      const a = state.hover;
      ctx.fillStyle = '#c9e0d0';
      ctx.fillRect(x0 + a.u * s.cw, headerY, s.cw, 19);
      ctx.fillRect(headerX, y0 + a.v * s.ch, 29, s.ch);
      ctx.fillStyle = '#1c4930';
      ctx.font = '600 11px monospace';
      ctx.fillText(String(a.u + 1), x0 + (a.u + 0.5) * s.cw, headerY + 10);
      ctx.fillText(state.view === 'plan' ? a.v + 1 : zText(a.z), headerX + 14, y0 + (a.v + 0.5) * s.ch);
    }
    $('#zoom-value').textContent = `${Math.round((state.zoom / 18) * 100)}%`;
    drawMinimap();
    const count = currentLayer().cells.filter(Boolean).length;
    $('#cell-count').textContent = `${count.toLocaleString()} 个已规划格`;
    $('#planned-percent').textContent = `${((count / (p.width * p.height)) * 100).toFixed(1)}%`;
  }
  function drawBox(u, v, cols, rows, color, dashed) {
    const s = shapeSize();
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '1a';
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([4, 3]);
    ctx.fillRect(state.ox + u * s.cw, state.oy + v * s.ch, cols * s.cw, rows * s.ch);
    ctx.strokeRect(state.ox + u * s.cw + 0.5, state.oy + v * s.ch + 0.5, cols * s.cw - 1, rows * s.ch - 1);
    ctx.restore();
  }
  function drawMinimap() {
    const w = mini.width,
      h = mini.height,
      scale = Math.min((w - 20) / p.width, (h - 14) / p.height),
      ox = (w - p.width * scale) / 2,
      oy = (h - p.height * scale) / 2;
    mc.clearRect(0, 0, w, h);
    mc.fillStyle = '#f0f3f6';
    mc.fillRect(0, 0, w, h);
    const l = currentLayer();
    for (let y = 0; y < p.height; y++)
      for (let x = 0; x < p.width; x++) {
        const t = l.cells[y * p.width + x];
        if (t) {
          mc.fillStyle = tileDef(t).color;
          mc.fillRect(ox + x * scale, oy + y * scale, scale, scale);
        }
      }
    mc.strokeStyle = '#95a4b5';
    mc.lineWidth = 1;
    mc.strokeRect(ox, oy, p.width * scale, p.height * scale);
    if (state.view === 'plan') {
      mc.save();
      mc.beginPath();
      mc.rect(ox, oy, p.width * scale, p.height * scale);
      mc.clip();
      mc.strokeStyle = '#375c45';
      mc.lineWidth = 1.5;
      mc.strokeRect(
        ox - (state.ox / state.zoom) * scale,
        oy - (state.oy / state.zoom) * scale,
        (state.width / state.zoom) * scale,
        (state.height / state.zoom) * scale
      );
      mc.restore();
    } else {
      mc.strokeStyle = '#825400';
      mc.lineWidth = 2;
      mc.beginPath();
      mc.moveTo(ox + (state.sectionX + 0.5) * scale, oy);
      mc.lineTo(ox + (state.sectionX + 0.5) * scale, oy + p.height * scale);
      mc.stroke();
    }
  }
  function applyPoints(points, tile = state.tool === 'eraser' ? 0 : state.tile, size = 1) {
    for (const [u, v] of points) {
      if (state.view === 'plan') M.paint(p, getLevels(), [[u, v]], tile, size);
      else {
        const off = Math.floor((size - 1) / 2);
        for (let dv = 0; dv < size; dv++)
          for (let du = 0; du < size; du++) {
            const c = planeCell(u + du - off, v + dv - off);
            if (c) M.setTile(p, c.z, c.x, c.y, tile);
          }
      }
    }
  }
  function floodSection(start, tile) {
    const source = M.layerAt(p, start.z).cells[start.y * p.width + start.x];
    if (source === tile) return;
    const seen = new Set(),
      stack = [[start.u, start.v]];
    while (stack.length) {
      const [u, v] = stack.pop(),
        c = planeCell(u, v),
        key = `${u},${v}`;
      if (!c || seen.has(key) || M.layerAt(p, c.z).cells[c.y * p.width + c.x] !== source) continue;
      seen.add(key);
      stack.push([u - 1, v], [u + 1, v], [u, v - 1], [u, v + 1]);
    }
    for (const key of seen) {
      const c = planeCell(...key.split(',').map(Number));
      M.setTile(p, c.z, c.x, c.y, tile);
    }
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    e.preventDefault();
    canvas.focus();
    if (state.drag) return;
    if (state.tool === 'hand' || state.space || e.button === 1) {
      state.drag = { pan: true, clientX: e.clientX, clientY: e.clientY, ox: state.ox, oy: state.oy };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
      return;
    }
    const a = pointAt(e);
    if (!a) return;
    if (e.altKey) {
      selectMaterial(M.layerAt(p, a.z).cells[a.y * p.width + a.x], false);
      toast(`已拾取：${tileDef(state.tile).name}`);
      return;
    }
    if (state.pasting && state.clipboard) {
      const clip = state.clipboard;
      try {
        const placements = clip.buildings.flatMap((b) => {
          const levels = state.view === 'plan' ? getLevels() : [sorted()[a.v + b.row]?.z];
          return levels.map((z) => {
            if (!M.layerAt(p, z)) throw new Error('建筑超出目标楼层范围，请向内移动后粘贴。');
            return {
              z,
              b: M.validateBuilding(p, {
                ...b,
                x: state.view === 'plan' ? a.x + b.x : state.sectionX + b.x,
                y: state.view === 'plan' ? a.y + b.y : a.u + b.y,
              }),
            };
          });
        });
        const grouped = clipboardBuildingCells(clip);
        change(() => {
          // Clear destination footprints before writing any clipboard content. Otherwise
          // removing a later-overlapped building could erase cells already pasted earlier.
          for (let v = 0; v < clip.height; v++)
            for (let u = 0; u < clip.width; u++) applyPoints([[a.u + u, a.v + v]], 0);
          for (let v = 0; v < clip.height; v++)
            for (let u = 0; u < clip.width; u++)
              if (!grouped.has(v * clip.width + u))
                applyPoints([[a.u + u, a.v + v]], clip.cells[v * clip.width + u]);
          for (const { z, b } of placements) M.placeBuilding(p, z, b);
        });
      } catch (error) {
        toast(error.message, true);
        return;
      }
      state.pasting = false;
      updateTools();
      draw();
      toast('已粘贴选区');
      return;
    }
    if (state.stairs) {
      try {
        change(() => M.stairs(p, a.x, a.y, state.from, state.to));
        toast(`已连接 Z ${zText(state.from)} 至 Z ${zText(state.to)} 的楼梯`);
      } catch (error) {
        toast(error.message, true);
      }
      return;
    }
    if (state.stamping) {
      try {
        change(() => M.stamp(p, getLevels(), a.x, a.y, state.tile, state.rotated));
      } catch (error) {
        toast(error.message, true);
      }
      return;
    }
    if (state.tool === 'maze') {
      if (e.button === 0) mazeClick(a);
      return;
    }
    if (state.tool === 'circle') {
      if (!circleParameters()) {
        $$('#circle-options input')
          .find((input) => !input.validity.valid)
          .reportValidity();
        return;
      }
      state.hover = a;
      change(() => applyPoints(circlePoints(a), e.button === 2 ? 0 : state.tile));
      draw();
      return;
    }
    if (state.tool === 'tag') {
      editLabel(a);
      return;
    }
    if (state.tool === 'fill') {
      change(() => {
        if (state.view === 'plan') for (const z of getLevels()) M.floodFill(p, z, a.x, a.y, state.tile);
        else floodSection(a, state.tile);
      });
      return;
    }
    state.drag = {
      start: a,
      end: a,
      last: a,
      before: snapshot(),
      outline: e.shiftKey,
      verticalFirst: e.shiftKey,
      erase: e.button === 2,
    };
    canvas.setPointerCapture(e.pointerId);
    if (['brush', 'eraser'].includes(state.tool)) {
      applyPoints([[a.u, a.v]], e.button === 2 ? 0 : state.tool === 'eraser' ? 0 : state.tile, state.size);
    }
    updateDrawingSize(e);
    draw();
  });
  canvas.addEventListener('pointermove', (e) => {
    const a = pointAt(e);
    state.hover = a;
    $('#coordinate').textContent = a
      ? `X ${String(a.x + 1).padStart(2, '0')}  Y ${String(a.y + 1).padStart(2, '0')}`
      : 'X —  Y —';
    $('#hover-material').textContent = a
      ? [
          tileDef(M.layerAt(p, a.z).cells[a.y * p.width + a.x]).name,
          tileDef(M.layerAt(p, a.z).cells[a.y * p.width + a.x]).description,
        ]
          .filter(Boolean)
          .join(' · ')
      : '就绪';
    if (a) $('#status-z').textContent = `Z ${zText(a.z)}`;
    const d = state.drag;
    if (d) {
      if (d.pan) {
        state.ox = d.ox + e.clientX - d.clientX;
        state.oy = d.oy + e.clientY - d.clientY;
      } else {
        const b = pointAt(e, true);
        d.end = b;
        d.outline = e.shiftKey;
        d.verticalFirst = e.shiftKey;
        if (['brush', 'eraser'].includes(state.tool))
          applyPoints(
            M.line(d.last.u, d.last.v, b.u, b.v),
            d.erase ? 0 : state.tool === 'eraser' ? 0 : state.tile,
            state.size
          );
        d.last = b;
      }
    }
    updateDrawingSize(e);
    draw();
  });
  function finishDrag(cancel = false) {
    drawingSize.hidden = true;
    const d = state.drag;
    if (!d) return;
    state.drag = null;
    canvas.style.cursor = state.tool === 'hand' || state.space ? 'grab' : 'crosshair';
    if (d.pan) return;
    if (cancel) {
      p = M.validateProject(JSON.parse(d.before));
      refresh();
      save();
      return;
    }
    if (state.tool === 'select') {
      state.selection = { u0: d.start.u, v0: d.start.v, u1: d.end.u, v1: d.end.v };
      updateSelection();
    } else {
      if (SHAPE_TOOLS.includes(state.tool)) applyPoints(dragPoints(d), d.erase ? 0 : state.tile);
      commit(d.before);
    }
    draw();
  }
  canvas.addEventListener('pointerup', () => finishDrag());
  canvas.addEventListener('pointercancel', () => finishDrag(true));
  canvas.addEventListener('lostpointercapture', () => finishDrag());
  canvas.addEventListener('pointerleave', () => {
    if (!state.drag) {
      state.hover = null;
      draw();
    }
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoom(e.deltaY > 0 ? 0.9 : 1.1, e.clientX - r.left, e.clientY - r.top);
    },
    { passive: false }
  );
  mini.addEventListener('pointerdown', (e) => {
    const r = mini.getBoundingClientRect(),
      w = mini.width,
      h = mini.height,
      scale = Math.min((w - 20) / p.width, (h - 14) / p.height),
      x = (((e.clientX - r.left) * w) / r.width - (w - p.width * scale) / 2) / scale,
      y = (((e.clientY - r.top) * h) / r.height - (h - p.height * scale) / 2) / scale;
    if (state.view === 'plan') {
      state.ox = state.width / 2 - x * state.zoom;
      state.oy = state.height / 2 - y * state.zoom;
      draw();
    } else {
      state.sectionX = Math.max(0, Math.min(p.width - 1, Math.floor(x)));
      refresh();
    }
  });
  function selectionPoints() {
    const s = state.selection;
    return s ? M.rectangle(s.u0, s.v0, s.u1, s.v1) : [];
  }
  function clipboardBuildingCells(clip) {
    const cells = new Set();
    for (const b of clip.buildings)
      for (const [x, y] of M.buildingPoints(b)) {
        if (clip.view === 'plan') cells.add(y * clip.width + x);
        else if (x === 0) cells.add(b.row * clip.width + y);
      }
    return cells;
  }
  function copySelection() {
    const s = state.selection;
    if (!s) {
      toast('先使用选区工具拖选一个区域。');
      return;
    }
    let left = Math.min(s.u0, s.u1),
      top = Math.min(s.v0, s.v1),
      right = Math.max(s.u0, s.u1),
      bottom = Math.max(s.v0, s.v1);
    const entries =
      state.view === 'plan'
        ? currentLayer().buildings.map((b) => ({ b, row: 0 }))
        : sorted().flatMap((l, row) => l.buildings.map((b) => ({ b, row })));
    const included = new Set();
    let expanded;
    do {
      expanded = false;
      for (const entry of entries) {
        if (included.has(entry)) continue;
        const { b, row } = entry;
        const intersects = M.buildingPoints(b).some(([x, y]) =>
          state.view === 'plan'
            ? x >= left && x <= right && y >= top && y <= bottom
            : x === state.sectionX && y >= left && y <= right && row >= top && row <= bottom
        );
        if (!intersects) continue;
        included.add(entry);
        if (state.view === 'plan') {
          left = Math.min(left, b.x);
          right = Math.max(right, b.x + b.width - 1);
          top = Math.min(top, b.y);
          bottom = Math.max(bottom, b.y + b.height - 1);
        } else {
          left = Math.min(left, b.y);
          right = Math.max(right, b.y + b.height - 1);
        }
        expanded = true;
      }
    } while (expanded);
    const width = right - left + 1,
      height = bottom - top + 1,
      cells = [];
    const buildings = [...included].map(({ b, row }) =>
      state.view === 'plan'
        ? { ...b, x: b.x - left, y: b.y - top }
        : { ...b, x: b.x - state.sectionX, y: b.y - left, row: row - top }
    );
    for (let v = 0; v < height; v++)
      for (let u = 0; u < width; u++) {
        const c = planeCell(left + u, top + v);
        cells.push(M.layerAt(p, c.z).cells[c.y * p.width + c.x]);
      }
    state.clipboard = {
      width,
      height,
      cells,
      buildings,
      view: state.view,
      definitions: [...new Set(cells)].map((id) => ({ ...tileDef(id) })),
    };
    state.selection = { u0: left, v0: top, u1: right, v1: bottom };
    updateSelection();
    draw();
    $('#paste-btn').disabled = false;
    toast(
      `已复制 ${width} × ${height} 格${buildings.length ? '（包含完整建筑）' : ''}，可切换 Z 层后 Ctrl+V 粘贴。`
    );
  }
  function startPaste() {
    if (!state.clipboard) {
      toast('请先复制一个选区。');
      return;
    }
    if (state.clipboard.view !== state.view) {
      toast('请在相同类型的视图中粘贴选区。');
      return;
    }
    state.selection = null;
    state.maze = null;
    state.stamping = false;
    state.pasting = true;
    state.stairs = false;
    updateTools();
    updateSelection();
    draw();
    toast('点击地图放置选区，Esc 取消。');
  }
  $('#paste-btn').addEventListener('click', startPaste);
  $('#copy-selection').addEventListener('click', copySelection);
  $('#fill-selection').addEventListener('click', () =>
    change(() => applyPoints(selectionPoints(), state.tile))
  );
  $('#delete-selection').addEventListener('click', () => change(() => applyPoints(selectionPoints(), 0)));
  $('#dismiss-selection').addEventListener('click', () => {
    state.selection = null;
    updateSelection();
    draw();
  });
  function setView(view) {
    finishDrag();
    state.maze = null;
    if (view === 'section' && state.tool === 'maze') state.tool = 'brush';
    state.stamping = false;
    state.view = view;
    state.selection = null;
    state.hover = null;
    state.stairs = false;
    state.pasting = false;
    $$('.view-tab').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
    $('#section-control').hidden = view !== 'section';
    $('#view-description').innerHTML =
      view === 'plan'
        ? '<i></i>俯视平面 <span>TOP VIEW</span>'
        : '<i></i>垂直剖面 <span>CROSS SECTION</span>';
    $('#canvas-subtitle').textContent =
      view === 'plan' ? '每一格，都是未来的可能' : '横轴 Y · 纵轴 Z · 可直接绘制';
    refresh();
    fit();
  }
  $$('.view-tab').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  $('#section-column').addEventListener('input', (e) => {
    state.sectionX = Number(e.target.value);
    refresh();
  });
  $('#undo-btn').addEventListener('click', () => history('undo'));
  $('#redo-btn').addEventListener('click', () => history('redo'));
  $('#zoom-in').addEventListener('click', () => zoom(1.2));
  $('#zoom-out').addEventListener('click', () => zoom(1 / 1.2));
  $('#zoom-value').addEventListener('click', () => zoom(18 / state.zoom));
  $('#fit-btn').addEventListener('click', fit);
  for (const [id, property] of [
    ['grid-btn', 'grid'],
    ['labels-btn', 'labels'],
    ['ghost-btn', 'ghost'],
  ])
    $('#' + id).addEventListener('click', () => {
      change(() => {
        p.settings[property] = !p.settings[property];
      });
      if (property === 'ghost' && state[property]) toast('透视开启：下一个较低楼层以淡色显示。');
    });
  // Dialogs use a single native focus-trapped modal.
  let dialogSubmit = null;
  function openDialog(title, content, onSubmit, confirm = '确认') {
    $('#dialog').classList.remove('wide-dialog');
    $('#dialog-title').textContent = title;
    $('#dialog-content').innerHTML =
      content + '<p id="dialog-error" class="dialog-error" role="alert" hidden></p>';
    $('#dialog-actions').hidden = !onSubmit;
    $('#confirm-dialog').textContent = confirm;
    dialogSubmit = onSubmit;
    $('#dialog').showModal();
    const input = $('#dialog-content input');
    if (input) {
      input.focus();
      if (input.type === 'text') input.select();
    }
  }
  function closeDialog() {
    $('#dialog').close();
    dialogSubmit = null;
  }
  $('#close-dialog').addEventListener('click', closeDialog);
  $('#cancel-dialog').addEventListener('click', closeDialog);
  $('#dialog-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (dialogSubmit) {
      try {
        if (dialogSubmit() !== false) closeDialog();
      } catch (error) {
        $('#dialog-error').hidden = false;
        $('#dialog-error').textContent = error.message;
        toast(error.message, true);
      }
    }
  });
  $('#dialog').addEventListener('click', (e) => {
    if (e.target === $('#dialog')) {
      const r = $('#dialog').getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
        closeDialog();
    }
  });
  const placementNames = {
    brush: '逐格画笔',
    rectangle: '矩形区域',
    fill: '连通填充',
    stamp: '固定占地模板',
  };
  function editMaterial(id = null, copy = false) {
    const source = id === null ? null : tileDef(id);
    let name = copy ? source.name.slice(0, 33) + ' 副本' : source?.name || '';
    if (copy) {
      let n = 2;
      while (p.customTiles.some((t) => t.name === name)) name = source.name.slice(0, 30) + ` 副本 ${n++}`;
      name = name.slice(0, 40);
    }
    const t = {
      name,
      group: source?.group === '分区' ? '区域' : source?.group === '连接' ? '地形' : source?.group || '建筑',
      color: source?.color || '#d6e4da',
      ink: source?.ink || '#234936',
      symbol: source?.symbol || '',
      description: source?.description || '',
      tool: source?.tool || 'stamp',
      width: source?.width || 3,
      height: source?.height || 3,
      shape: source?.shape || 'solid',
    };
    const editingId = source && !copy ? id : null;
    openDialog(
      editingId === null ? '新建自定义素材' : '编辑自定义素材',
      `
      <p>建筑、设施、区域或功能标记，由你定义。保存在当前蓝图中，可随 JSON 分享。</p>
      <div class="dialog-row"><div><label for="material-name">素材名称</label><input id="material-name" type="text" maxlength="40" required placeholder="例如：酿酒工坊" value="${escapeHTML(t.name)}"></div>
      <div><label for="material-group">分类</label><select id="material-group">${M.CUSTOM_GROUPS.map((g) => `<option ${g === t.group ? 'selected' : ''}>${g}</option>`).join('')}</select></div></div>
      <div class="material-appearance"><div><label for="material-symbol">符号（最多 2 字）</label><input id="material-symbol" type="text" maxlength="4" value="${escapeHTML(t.symbol)}" placeholder="酿 / ⚒"></div>
      <div><label for="material-color">底色</label><input id="material-color" type="color" value="${t.color}"></div>
      <div><label for="material-ink">符号色</label><input id="material-ink" type="color" value="${t.ink}"></div></div>
      <label for="material-description">用途 / 功能说明</label><textarea id="material-description" maxlength="240" rows="2" placeholder="例如：酿造酒类；靠近食物仓库，预留运桶通道。">${escapeHTML(t.description)}</textarea>
      <label for="material-tool">选中素材后的默认操作</label><select id="material-tool">${Object.entries(
        placementNames
      )
        .map(([v, n]) => `<option value="${v}" ${v === t.tool ? 'selected' : ''}>${n}</option>`)
        .join('')}</select>
      <div class="dialog-row footprint-fields"><div><label for="material-width">模板宽度（格）</label><input id="material-width" type="number" min="1" max="32" step="1" required value="${t.width}"></div>
      <div><label for="material-height">模板高度（格）</label><input id="material-height" type="number" min="1" max="32" step="1" required value="${t.height}"></div>
      <div><label for="material-shape">模板形状</label><select id="material-shape"><option value="solid" ${t.shape === 'solid' ? 'selected' : ''}>实心</option><option value="outline" ${t.shape === 'outline' ? 'selected' : ''}>仅边框</option></select></div></div>
      <div class="material-preview"><canvas id="material-preview" width="240" height="100" aria-label="素材模板预览"></canvas><div><strong id="preview-name"></strong><p id="preview-caption"></p></div></div>
      <p class="dialog-note">模板从点击格向右下方放置，Q 旋转；多格模板视为一个整体，擦除任意占用格会移除整个建筑。边框内部保持原状。区域可拖动矩形绘制。功能说明是规划备注，不执行游戏逻辑。${editingId === null ? '' : '修改名称和外观会同步到已绘制格子；模板尺寸只影响后续放置。'}</p>`,
      () => {
        let saved;
        change(() => {
          saved = M.saveCustomTile(
            p,
            {
              name: $('#material-name').value,
              group: $('#material-group').value,
              color: $('#material-color').value,
              ink: $('#material-ink').value,
              symbol: $('#material-symbol').value,
              description: $('#material-description').value,
              tool: $('#material-tool').value,
              width: Number($('#material-width').value),
              height: Number($('#material-height').value),
              shape: $('#material-shape').value,
            },
            editingId
          );
        });
        resetPaletteFilter();
        selectMaterial(saved.id);
        toast(editingId === null ? '自定义素材已添加，可在地图上绘制。' : '素材已更新，已绘制格子同步生效。');
      },
      '保存素材'
    );
    $('#dialog').classList.add('wide-dialog');
    const preview = () => {
      const c = $('#material-preview'),
        ctx = c.getContext('2d');
      const w = Math.min(32, Math.max(1, Number($('#material-width').value) || 1));
      const h = Math.min(32, Math.max(1, Number($('#material-height').value) || 1));
      const size = Math.min(26, 232 / w, 92 / h),
        ox = (240 - w * size) / 2,
        oy = (100 - h * size) / 2;
      ctx.clearRect(0, 0, 240, 100);
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          if ($('#material-shape').value === 'outline' && x > 0 && x < w - 1 && y > 0 && y < h - 1) continue;
          ctx.fillStyle = $('#material-color').value;
          ctx.fillRect(ox + x * size, oy + y * size, size, size);
        }
      const hollow = $('#material-shape').value === 'outline' && w > 2 && h > 2;
      ctx.strokeStyle = $('#material-ink').value + '80';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox + 0.5, oy + 0.5, w * size - 1, h * size - 1);
      ctx.fillStyle = $('#material-ink').value;
      ctx.font = `${Math.min(20, (hollow ? size : h * size) * 0.65)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        $('#material-symbol').value,
        ox + (w * size) / 2,
        oy + (hollow ? size : h * size) / 2,
        w * size - 4
      );
      $('#preview-name').textContent = $('#material-name').value || '新素材';
      $('#preview-caption').textContent =
        `${$('#material-group').value} · ${w} × ${h} 格模板 · ${placementNames[$('#material-tool').value]}`;
    };
    $$('#dialog-content input, #dialog-content select').forEach((el) =>
      el.addEventListener('input', preview)
    );
    $('#material-group').addEventListener('change', () => {
      if (editingId === null && !source) {
        $('#material-tool').value =
          $('#material-group').value === '区域'
            ? 'rectangle'
            : ['建筑', '设施'].includes($('#material-group').value)
              ? 'stamp'
              : 'brush';
        preview();
      }
    });
    preview();
  }
  function resetPaletteFilter() {
    state.search = '';
    $('#material-search').value = '';
    state.category = 'all';
    $$('.palette-tabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.category === 'all');
      b.setAttribute('aria-selected', b.dataset.category === 'all');
    });
  }
  function deleteMaterial(id) {
    const t = tileDef(id),
      count = M.tileUsage(p, id);
    openDialog(
      '删除自定义素材？',
      `<p>「${escapeHTML(t.name)}」在全部楼层中使用了 <strong>${count}</strong> 格。删除时会将这些格子替换为下方素材；操作可撤销。</p>
      <label for="replacement-tile">替换已绘制格子为</label><select id="replacement-tile">${M.allTiles(p)
        .filter((v) => v.id !== id)
        .map((v) => `<option value="${v.id}" ${v.id === 1 ? 'selected' : ''}>${escapeHTML(v.name)}</option>`)
        .join('')}</select>
      <label class="settings-check"><input id="delete-material-confirm" type="checkbox" required>确认删除素材并替换已绘制格子</label>`,
      () => {
        change(() => M.deleteCustomTile(p, id, Number($('#replacement-tile').value)));
        toast('素材已删除，可撤销恢复素材和格子。');
      },
      '删除并替换'
    );
  }
  function manageMaterials() {
    openDialog(
      '自定义素材库',
      `<p>当前蓝图 · ${p.customTiles.length} / ${M.MAX_CUSTOM_TILES} 个自定义素材。内置素材可复制后定制。</p>
      <div class="library-toolbar"><input id="library-search" type="search" placeholder="搜索名称或功能" aria-label="搜索素材库"><select id="library-group" aria-label="筛选素材分类"><option value="all">全部分类</option>${M.CUSTOM_GROUPS.map((g) => `<option>${g}</option>`).join('')}</select><button type="button" class="button primary" id="library-add">＋ 新建</button></div>
      <div id="library-list" class="library-list"></div>
      <details class="builtin-library"><summary>从内置素材创建副本</summary><div class="builtin-list">${M.TILES.filter(
        (t) => t.id
      )
        .map(
          (t) =>
            `<button type="button" data-clone="${t.id}" class="button">${materialSwatch(t)}${escapeHTML(t.name)}</button>`
        )
        .join('')}</div></details>`,
      null
    );
    $('#dialog').classList.add('wide-dialog');
    const render = () => {
      const q = $('#library-search').value.trim().toLowerCase(),
        group = $('#library-group').value;
      const list = p.customTiles.filter(
        (t) => matchesCategory(t, group) && `${t.name} ${t.description}`.toLowerCase().includes(q)
      );
      const usage = new Map();
      for (const l of p.layers)
        for (const id of l.cells) if (id >= 100) usage.set(id, (usage.get(id) || 0) + 1);
      $('#library-list').innerHTML =
        list
          .map(
            (
              t
            ) => `<article class="library-item">${materialSwatch(t)}<div class="library-info"><strong>${escapeHTML(t.name)}</strong><small>${t.group} · ${t.width} × ${t.height} · ${usage.get(t.id) || 0} 格已使用</small><p>${escapeHTML(t.description || '未填写功能说明')}</p></div><div class="library-item-actions">
        <button type="button" class="button" data-use="${t.id}" aria-label="使用 ${escapeHTML(t.name)}">使用</button><button type="button" class="button" data-edit="${t.id}" aria-label="编辑 ${escapeHTML(t.name)}">编辑</button>
        <button type="button" class="button" data-clone="${t.id}" aria-label="复制 ${escapeHTML(t.name)}">复制</button><button type="button" class="button danger-text" data-delete="${t.id}" aria-label="删除 ${escapeHTML(t.name)}">删除</button></div></article>`
          )
          .join('') ||
        '<div class="library-empty">还没有匹配的自定义素材。<br>新建一个建筑、设施、区域或功能标记，或复制下方内置素材。</div>';
    };
    $('#library-search').addEventListener('input', render);
    $('#library-group').addEventListener('change', render);
    $('#library-add').addEventListener('click', () => editMaterial());
    render();
  }
  $('#dialog-content').addEventListener('click', (e) => {
    const b = e.target.closest('[data-use], [data-edit], [data-clone], [data-delete]');
    if (!b) return;
    if (b.dataset.use) {
      resetPaletteFilter();
      selectMaterial(Number(b.dataset.use));
      closeDialog();
    } else if (b.dataset.edit) editMaterial(Number(b.dataset.edit));
    else if (b.dataset.clone) editMaterial(Number(b.dataset.clone), true);
    else if (b.dataset.delete) deleteMaterial(Number(b.dataset.delete));
  });
  $('#add-material').addEventListener('click', () => editMaterial());
  $('#edit-material').addEventListener('click', () => editMaterial(state.tile));
  $('#manage-materials').addEventListener('click', manageMaterials);
  $('#settings-btn').addEventListener('click', () => {
    const labels = {
      grid: '显示网格',
      labels: '显示地图标注',
      ghost: '透视下一个较低楼层',
      symbols: '显示素材符号（含 PNG 导出）',
    };
    openDialog(
      '编辑器设置',
      `<p>设置保存在当前蓝图中，刷新和 JSON 导入后继续生效。地图尺寸可在顶部尺寸按钮调整。</p>
      <div class="settings-list">${Object.entries(labels)
        .map(
          ([key, name]) =>
            `<label class="settings-check"><input type="checkbox" id="setting-${key}" ${p.settings[key] ? 'checked' : ''}>${name}</label>`
        )
        .join('')}</div>
      <label for="setting-brushSize">笔刷大小</label><select id="setting-brushSize">${[1, 2, 3, 5].map((n) => `<option value="${n}" ${n === p.settings.brushSize ? 'selected' : ''}>${n} × ${n}</option>`).join('')}</select>
      <p class="dialog-note">笔刷大小用于画笔和橡皮；建筑模板使用自己的占地尺寸。功能素材的默认操作在素材编辑中设置。</p>
      <button type="button" class="button" id="reset-settings">恢复默认设置</button>`,
      () => {
        const next = Object.fromEntries(Object.keys(labels).map((k) => [k, $('#setting-' + k).checked]));
        next.brushSize = Number($('#setting-brushSize').value);
        change(() => {
          p.settings = M.validateSettings(next);
        });
        toast('编辑器设置已保存。');
      },
      '保存设置'
    );
    $('#reset-settings').addEventListener('click', () => {
      for (const key of Object.keys(labels)) $('#setting-' + key).checked = M.DEFAULT_SETTINGS[key];
      $('#setting-brushSize').value = M.DEFAULT_SETTINGS.brushSize;
    });
  });
  $('#project-title').addEventListener('click', () =>
    openDialog(
      '给要塞起个名字',
      `<label for="name-input">要塞名称</label><input id="name-input" type="text" maxlength="60" required value="${escapeHTML(p.name)}">`,
      () => {
        const name = $('#name-input').value.trim();
        if (!name) return false;
        change(() => (p.name = name));
      }
    )
  );
  function addLayer(copy = false) {
    if (p.layers.length >= M.MAX_LAYERS) {
      toast(`最多支持 ${M.MAX_LAYERS} 个楼层。`, true);
      return;
    }
    const next = Math.max(M.MIN_Z, Math.min(...p.layers.map((l) => l.z)) - 1);
    openDialog(
      copy ? '复制当前楼层' : '拓展新的楼层',
      `<p>${copy ? '把当前楼层的格子与标注复制到一个新的 Z 层。' : '向地下延伸，或者在地表之上继续建造。'}</p><div class="dialog-row"><div><label for="layer-z">Z 轴高程</label><input id="layer-z" type="number" min="${M.MIN_Z}" max="${M.MAX_Z}" step="1" value="${next}" required></div><div><label for="layer-name">楼层名称</label><input id="layer-name" type="text" maxlength="40" value="${copy ? escapeHTML(currentLayer().name) + ' 副本' : '新楼层'}" required></div></div><p class="dialog-note">手绘规划可用地表为 Z=0；游戏导入保留原始 Z 坐标。Z 坐标不可重复。</p>`,
      () => {
        const z = Number($('#layer-z').value),
          name = $('#layer-name').value.trim();
        if (M.layerAt(p, z)) throw new Error('该 Z 坐标已存在，请使用其他高程。');
        if (!name) return false;
        change(() => {
          const layer = copy
            ? JSON.parse(JSON.stringify(currentLayer()))
            : M.makeLayer(z, name, p.width, p.height);
          layer.z = z;
          layer.name = name;
          p.layers.push(layer);
          p.activeZ = z;
        });
        state.selection = null;
        refresh();
        if (state.view === 'section') fit();
        toast(copy ? '楼层已复制' : '新楼层已添加');
      },
      copy ? '复制楼层' : '添加楼层'
    );
  }
  $('#add-layer').addEventListener('click', () => addLayer());
  $('#add-layer-tab').addEventListener('click', () => addLayer());
  $('#duplicate-layer').addEventListener('click', () => addLayer(true));
  $('#rename-layer').addEventListener('click', () =>
    openDialog(
      '重命名楼层',
      `<label for="layer-name">Z ${zText(p.activeZ)} · 楼层名称</label><input id="layer-name" type="text" maxlength="40" value="${escapeHTML(currentLayer().name)}" required>`,
      () => {
        const n = $('#layer-name').value.trim();
        if (!n) return false;
        change(() => (currentLayer().name = n));
      }
    )
  );
  $('#delete-layer').addEventListener('click', () => {
    if (p.layers.length <= 1) return;
    openDialog(
      '删除当前楼层？',
      `<p>将删除 <strong>Z ${zText(p.activeZ)} · ${escapeHTML(currentLayer().name)}</strong> 的全部格子与标注。删除后可以撤销。</p>`,
      () => {
        change(() => {
          p.layers = p.layers.filter((l) => l.z !== p.activeZ);
          p.activeZ = sorted()[0].z;
        });
        state.selection = null;
        refresh();
        if (state.view === 'section') fit();
        toast('楼层已删除，可使用 Ctrl+Z 撤销。');
      },
      '删除楼层'
    );
  });
  function editLabel(a) {
    if (state.view !== 'plan') {
      toast('请在俯视平面中添加标注。');
      return;
    }
    const label = currentLayer().labels.find((l) => l.x === a.x && l.y === a.y);
    openDialog(
      label ? '编辑地图标注' : '添加地图标注',
      `<p>位置：X ${a.x + 1} · Y ${a.y + 1} · Z ${zText(a.z)}</p><label for="label-input">标注文字（留空以删除）</label><input id="label-input" type="text" maxlength="40" value="${escapeHTML(label?.text || '')}"><p class="dialog-note">开启跨层编辑时，标注也会同步到所选楼层。</p>`,
      () => {
        const text = $('#label-input').value.trim();
        change(() => {
          for (const z of getLevels()) {
            const l = M.layerAt(p, z);
            l.labels = l.labels.filter((b) => b.x !== a.x || b.y !== a.y);
            if (text && l.labels.length < 500) l.labels.push({ x: a.x, y: a.y, text });
          }
        });
      },
      '保存标注'
    );
  }
  function dimensionFields(prefix, width, height) {
    return `<div class="dialog-row"><div><label for="${prefix}-width">宽度 / X（格）</label><input id="${prefix}-width" type="number" min="${M.MIN_SIZE}" max="${M.MAX_SIZE}" step="1" value="${width}" required></div><div><label for="${prefix}-height">高度 / Y（格）</label><input id="${prefix}-height" type="number" min="${M.MIN_SIZE}" max="${M.MAX_SIZE}" step="1" value="${height}" required></div></div><div class="size-presets" aria-label="常用地图尺寸">${[64, 128, 192, 256].map((size) => `<button type="button" class="button" data-map-size="${size}">${size} × ${size}</button>`).join('')}</div><p class="dimension-summary" id="${prefix}-summary"></p>`;
  }
  function bindDimensions(prefix, onChange = () => {}) {
    const widthInput = $(`#${prefix}-width`),
      heightInput = $(`#${prefix}-height`);
    const update = () => {
      const width = Number(widthInput.value),
        height = Number(heightInput.value);
      const valid = widthInput.checkValidity() && heightInput.checkValidity();
      $(`#${prefix}-summary`).textContent = valid
        ? `每层 ${(width * height).toLocaleString()} 格 · 宽高可分别设置为 ${M.MIN_SIZE}–${M.MAX_SIZE}`
        : `请输入 ${M.MIN_SIZE}–${M.MAX_SIZE} 之间的整数。`;
      $$('.size-presets button').forEach((b) =>
        b.classList.toggle('selected', Number(b.dataset.mapSize) === width && width === height)
      );
      onChange(valid, width, height);
    };
    widthInput.addEventListener('input', update);
    heightInput.addEventListener('input', update);
    $$('.size-presets button').forEach((b) =>
      b.addEventListener('click', () => {
        widthInput.value = b.dataset.mapSize;
        heightInput.value = b.dataset.mapSize;
        update();
      })
    );
    update();
  }
  $('#project-dimensions').addEventListener('click', () => {
    openDialog(
      '自定义地图大小',
      `<p>当前 ${p.width} × ${p.height} 格，调整会应用到全部 ${p.layers.length} 个 Z 层。左上角坐标不变，扩大时保留全部格子和标注。</p>${dimensionFields('resize', p.width, p.height)}<p id="resize-impact" class="dialog-note"></p><label id="resize-confirm-row" class="crop-confirm" hidden><input type="checkbox" id="resize-crop-confirm">我确认裁掉边界外的规划和标注（可撤销）</label>`,
      () => {
        const width = Number($('#resize-width').value),
          height = Number($('#resize-height').value);
        const next = M.resizeProject(p, width, height, $('#resize-crop-confirm').checked);
        state.selection = null;
        state.hover = null;
        state.pasting = false;
        change(() => (p = next));
        toast(`已调整为 ${width} × ${height} 格，全部 ${p.layers.length} 层已同步。`);
      },
      '应用尺寸'
    );
    bindDimensions('resize', (valid, width, height) => {
      const impact = valid ? M.cropImpact(p, width, height) : { cells: 0, labels: 0 };
      const destructive = impact.cells > 0 || impact.labels > 0;
      $('#resize-crop-confirm').checked = false;
      $('#resize-crop-confirm').required = destructive;
      $('#resize-confirm-row').hidden = !destructive;
      $('#resize-impact').textContent = !valid
        ? '请先输入有效的宽度和高度。'
        : destructive
          ? `将裁掉 ${impact.cells} 个已规划格、${impact.labels} 个标注；必须勾选确认后才能应用。`
          : width < p.width || height < p.height
            ? '仅裁掉空白边缘，所有已规划格和标注都会保留。'
            : '原有规划的位置和 Z 层不变，新增区域为未开掘岩层。';
      $('#confirm-dialog').textContent = destructive ? '确认裁剪并调整' : '应用尺寸';
    });
  });
  $('#new-btn').addEventListener('click', () => {
    openDialog(
      '一座要塞，从这里开始',
      `<p>当前蓝图会被替换，可使用撤销恢复，或先导出备份。</p><label for="new-name">要塞名称</label><input id="new-name" type="text" maxlength="60" required value="新的要塞">${dimensionFields('new', M.DEFAULT_SIZE, M.DEFAULT_SIZE)}<label for="new-template">初始蓝图</label><select id="new-template"><option value="blank">空白地图 · 自定义尺寸</option><option value="demo">要塞 · 5 层示例（192 × 192）</option></select>`,
      () => {
        const name = $('#new-name').value.trim();
        if (!name) return false;
        const width = Number($('#new-width').value),
          height = Number($('#new-height').value);
        const next =
          $('#new-template').value === 'demo' ? M.demoProject() : M.createProject(name, width, height);
        next.name = name;
        const validated = M.validateProject(next);
        state.selection = null;
        state.hover = null;
        state.pasting = false;
        change(() => (p = validated));
        state.cross = false;
        state.from = sorted()[0].z;
        state.to = sorted().at(-1).z;
        state.sectionX = Math.floor(p.width / 2);
        refresh();
        editingView();
        toast('新的蓝图已准备就绪。');
      },
      '创建蓝图'
    );
    bindDimensions('new');
    $('#new-template').addEventListener('change', () => {
      const demo = $('#new-template').value === 'demo';
      for (const id of ['new-width', 'new-height']) {
        if (demo) $('#' + id).value = M.DEFAULT_SIZE;
        $('#' + id).disabled = demo;
      }
      if (demo) $('#new-width').dispatchEvent(new Event('input'));
      $$('.size-presets button').forEach((b) => (b.disabled = demo));
    });
  });
  function download(blob, name) {
    const url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function safeName() {
    return p.name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  }
  function exportJSON() {
    download(
      new Blob([M.serializeProject(p)], { type: 'application/json' }),
      `${safeName()}.dfplan.json`
    );
    toast('已导出全部楼层、自定义素材与设置。');
    closeDialog();
  }
  function exportPNG() {
    const c = document.createElement('canvas'),
      margin = 38,
      header = 70,
      size = Math.min(22, (4096 - margin * 2) / p.width, (4096 - margin - header) / p.height);
    c.width = p.width * size + margin * 2;
    c.height = p.height * size + margin + header;
    const x = c.getContext('2d');
    x.fillStyle = '#f8fafc';
    x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#20382b';
    x.font = 'bold 22px sans-serif';
    let title = `${p.name} / Z ${zText(p.activeZ)} · ${currentLayer().name}`;
    while (x.measureText(title).width > c.width - margin * 2 && title.length > 2)
      title = title.slice(0, -2) + '…';
    x.fillText(title, margin, 32);
    x.font = '11px monospace';
    x.fillStyle = '#465361';
    x.fillText(
      `FORTRESS BLUEPRINT  |  ${p.width} × ${p.height}  |  1 TILE = 1 CELL`,
      margin,
      51,
      c.width - margin * 2
    );
    const grouped = M.buildingCells(p, currentLayer());
    for (let y = 0; y < p.height; y++)
      for (let col = 0; col < p.width; col++)
        paintTile(
          x,
          currentLayer().cells[y * p.width + col],
          margin + col * size,
          header + y * size,
          size,
          size,
          1,
          !grouped.has(y * p.width + col)
        );
    x.strokeStyle = '#bdc7d1';
    x.lineWidth = 0.5;
    for (let col = 0; col <= p.width; col++) {
      x.beginPath();
      x.moveTo(margin + col * size, header);
      x.lineTo(margin + col * size, header + p.height * size);
      x.stroke();
    }
    for (let y = 0; y <= p.height; y++) {
      x.beginPath();
      x.moveTo(margin, header + y * size);
      x.lineTo(margin + p.width * size, header + y * size);
      x.stroke();
    }
    for (const b of currentLayer().buildings)
      paintBuilding(x, b, margin + b.x * size, header + b.y * size, size, size);
    x.textAlign = 'center';
    x.font = '600 11px monospace';
    x.fillStyle = '#354457';
    for (let col = 0; col < p.width; col++)
      if (
        (col % Math.ceil(26 / size) === 0 && p.width - 1 - col >= Math.ceil(26 / size)) ||
        col === p.width - 1
      )
        x.fillText(String(col + 1), margin + (col + 0.5) * size, header - 7);
    for (let y = 0; y < p.height; y++)
      if ((y % Math.ceil(12 / size) === 0 && p.height - 1 - y >= Math.ceil(12 / size)) || y === p.height - 1)
        x.fillText(y + 1, margin - 15, header + (y + 0.5) * size);
    for (const a of currentLayer().labels) {
      const tx = margin + (a.x + 0.5) * size,
        ty = header + (a.y + 0.5) * size;
      x.font = '600 14px sans-serif';
      const tw = x.measureText(a.text).width;
      x.fillStyle = '#ffffff';
      x.fillRect(tx - tw / 2 - 6, ty - 12, tw + 12, 24);
      x.fillStyle = '#233c2b';
      x.fillText(a.text, tx, ty + 1);
    }
    c.toBlob((blob) => {
      if (blob) download(blob, `${safeName()}_Z${p.activeZ}.png`);
    }, 'image/png');
    toast('已导出当前楼层的完整 PNG。');
    closeDialog();
  }
  $('#export-btn').addEventListener('click', () => {
    openDialog(
      '带走你的要塞蓝图',
      `<p>JSON 可完整保留全部 Z 层并再次编辑；PNG 适合分享当前楼层。</p><button type="button" class="export-option" id="export-json">${icon('file')}<span><strong>项目文件 · JSON</strong><small>全部 ${p.layers.length} 个楼层、格子、标注、自定义素材与设置</small></span></button><button type="button" class="export-option" id="export-png">${icon('image')}<span><strong>地图图片 · PNG</strong><small>当前 Z ${zText(p.activeZ)} 层 · 完整尺寸高清网格</small></span></button>`,
      null
    );
    $('#export-json').addEventListener('click', exportJSON);
    $('#export-png').addEventListener('click', exportPNG);
  });
  $('#import-btn').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      if (file.size > M.MAX_IMPORT_BYTES) throw new Error('文件过大，请选择不超过 256 MB 的蓝图 JSON。');
      const next = M.validateProject(JSON.parse(await file.text()));
      openDialog(
        '导入要塞蓝图？',
        `<p>导入 <strong>${escapeHTML(next.name)}</strong>，包含 ${next.layers.length} 层，尺寸 ${next.width} × ${next.height} 格。</p><p>将替换当前项目，可通过撤销恢复。</p>`,
        () => {
          change(() => (p = next));
          state.selection = null;
          state.hover = null;
          state.sectionX = Math.floor(p.width / 2);
          state.cross = false;
          refresh();
          editingView();
          toast('蓝图导入成功。');
        },
        '导入蓝图'
      );
    } catch (error) {
      toast(`导入失败：${error instanceof SyntaxError ? 'JSON 文件格式不正确。' : error.message}`, true);
    }
  });
  function showHelp() {
    openDialog(
      '规划你的地下世界',
      `<p>像编辑表格一样规划地图，每个格子都是一个地块。数据仅保存于当前浏览器，不需要登录，也不会上传。</p><div class="help-grid">${[
        ['画笔', 'B'],
        ['矩形 / 边框', 'R / Shift'],
        ['直线', 'L'],
        ['曲线（L 形）/ 换向', 'C / Shift'],
        ['圆环（点击圆心）', 'O'],
        ['填充', 'U'],
        ['迷宫填充（空白选区）', 'M'],
        ['橡皮', 'E'],
        ['区域选择', 'V'],
        ['平移', 'H / Space'],
        ['地图标注', 'T'],
        ['撤销', 'Ctrl Z'],
        ['重做', 'Ctrl Shift Z'],
        ['复制 / 粘贴', 'Ctrl C / V'],
        ['切换楼层', 'PgUp / PgDn'],
        ['缩放', '滚轮 / + / −'],
        ['适应画布', 'F'],
        ['拾取素材', 'Alt 点击'],
        ['网格开关', 'G'],
      ]
        .map(([a, b]) => `<div><span>${a}</span><kbd>${b}</kbd></div>`)
        .join(
          ''
        )}</div><p><strong>魔法棒式迷宫填充</strong><br>选择迷宫（M），点击空白岩层自动选中四连通区域，再依次点击起点和终点。设置通道宽度（格）后预览，可「换一个」重新随机生成；点击「生成迷宫」才写入地板与墙壁，保留选区外内容和内部障碍。仅处理当前俯视楼层，支持一次撤销、起终点标注和 JSON 保存。若宽度无法穿过瓶颈，请减小宽度；Esc 或「重新选区」取消预览。</p><p><strong>L 形曲线</strong><br>选择曲线工具（C）后拖动，始终以水平、垂直两段直角连接起点与终点，默认先横后竖；按住 Shift 改为先竖后横，松开恢复。同一行或列为直线，原地点击为单格。拖动时预览，松开提交，Esc 取消；右键拖动按同一路径擦除。</p><p><strong>指定圆心画圆环</strong><br>选择圆环工具（O），输入内径和环宽后点击圆心。环宽向外扩展，外径 = 内径 + 2 × 环宽；内径设为 0 可画实心圆。悬停预览，右键擦除，越界部分裁剪，支持跨层同步和整圆撤销。</p><p><strong>跨 Z 轴编辑</strong><br>右侧设定起止楼层，开启「跨层编辑」后，画笔、矩形、直线、曲线、圆环、填充、选区和粘贴会同步到范围内已有的楼层。单层规划不会改动其他层。</p><p><strong>楼梯与剖面</strong><br>「连接垂直楼梯」在顶部放置下行梯、底部放置上行梯、中间放置双向梯，要求高程连续。纵向剖面固定一列 X，横轴为 Y，纵轴为 Z，可直接绘图。地图概览可以点击定位。</p><p class="dialog-note">这些是规划标记，不会修改游戏存档；导出 JSON 可保留全部规划，PNG 用于分享。触屏支持单指绘图，选择平移工具可拖动画布。</p>`,
      null
    );
  }
  function toggleMobileLayers(open) {
    document.body.classList.toggle('layers-open', open);
    $('#mobile-levels-btn').setAttribute('aria-expanded', open);
  }
  $('#mobile-levels-btn').addEventListener('click', () =>
    toggleMobileLayers(!document.body.classList.contains('layers-open'))
  );
  $('#levels-backdrop').addEventListener('click', () => toggleMobileLayers(false));
  $('#help-btn').addEventListener('click', showHelp);
  $('#shortcuts-btn').addEventListener('click', showHelp);
  document.addEventListener('keydown', (e) => {
    if ($('#dialog').open) return;
    const mazeEscape =
      e.key === 'Escape' && state.tool === 'maze' && document.activeElement.id === 'maze-width';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !mazeEscape) return;
    const mod = e.ctrlKey || e.metaKey,
      k = e.key.toLowerCase();
    if (mod && ['z', 'y', 'c', 'v', 's'].includes(k)) {
      e.preventDefault();
      finishDrag();
      if (k === 'z') history(e.shiftKey ? 'redo' : 'undo');
      if (k === 'y') history('redo');
      if (k === 'c') copySelection();
      if (k === 'v') startPaste();
      if (k === 's') {
        saveNow();
        toast(storageAvailable ? '已保存到当前浏览器。' : '请导出 JSON 保存规划。');
      }
      return;
    }
    if (mod || e.altKey) return;
    if (k === 'escape') {
      if (mazeEscape) document.activeElement.blur();
      toggleMobileLayers(false);
      finishDrag(true);
      state.selection = null;
      state.maze = null;
      state.pasting = false;
      state.stairs = false;
      state.stamping = false;
      state.space = false;
      updateTools();
      updateRange();
      updateSelection();
      draw();
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      state.space = true;
      canvas.style.cursor = 'grab';
      return;
    }
    if (k === 'shift') updateCurveDirection(true);
    // Don't change tools or planes halfway through an active pointer gesture.
    if (state.drag) return;
    if (k === 'q' && state.stamping) {
      e.preventDefault();
      rotateStamp();
      return;
    }
    const t = toolDefs.find((t) => t[2].toLowerCase() === k);
    if (t) {
      e.preventDefault();
      setTool(t[0]);
      return;
    }
    if (k === 'f') {
      e.preventDefault();
      fit();
    }
    if (k === 'g') $('#grid-btn').click();
    if (k === '?' || k === '/') {
      e.preventDefault();
      showHelp();
    }
    if (k === '+' || k === '=') {
      e.preventDefault();
      zoom(1.2);
    }
    if (k === '-') {
      e.preventDefault();
      zoom(1 / 1.2);
    }
    if (['pageup', 'pagedown'].includes(k)) {
      e.preventDefault();
      const l = sorted(),
        i = l.findIndex((a) => a.z === p.activeZ),
        next = l[i + (k === 'pageup' ? -1 : 1)];
      if (next) setLayer(next.z);
    }
    if ((k === 'delete' || k === 'backspace') && state.selection) {
      e.preventDefault();
      change(() => applyPoints(selectionPoints(), 0));
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') updateCurveDirection(false);
    if (e.code === 'Space') {
      state.space = false;
      updateTools();
    }
  });
  window.addEventListener('blur', () => {
    state.space = false;
    finishDrag();
    updateTools();
  });
  new ResizeObserver((entries) => {
    const r = entries[0].contentRect,
      first = !state.width;
    const oldW = state.width,
      oldH = state.height;
    state.width = r.width;
    state.height = r.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    if (first) editingView();
    else {
      state.ox += (r.width - oldW) / 2;
      state.oy += (r.height - oldH) / 2;
      draw();
    }
  }).observe($('#canvas-container'));
  state.from = sorted()[0].z;
  state.to = sorted().at(-1).z;
  state.sectionX = Math.floor(p.width / 2);
  refresh();
  if (loadError) toast(loadError, true);
  else save();
})();
