(() => {
  "use strict";

  const SAVE_KEY = "tsukishiro-shrine-showa-save-v1";
  const DEFAULT_STATE = {
    day: 1, month: 4, money: 2400, faith: 18, visitors: 0, clean: 62,
    energy: 4, maxEnergy: 4, weather: "sunny", forecast: "sunny", publicity: 0,
    dayVisitors: 0, sound: true, actionCounts: { sweep: 0, pray: 0, omamori: 0, publicity: 0 },
    upgrades: { hall: 0, shop: 0, garden: 0 }, goalTarget: 12, goalClaimed: false,
    lifetimeVisitors: 0, log: [], festivalSeen: false, dailyDate: "", daySettled: false
  };

  const weatherNames = { sunny: "晴", cloudy: "曇", rain: "雨", mist: "薄雾" };
  const weatherDescriptions = {
    sunny: "晴 · 客流平稳", cloudy: "多云 · 午后风凉", rain: "雨 · 客流减少", mist: "薄雾 · 祈愿灵验"
  };
  const actionInfo = {
    sweep: { label: "清扫境内", color: "#4f6b53" },
    pray: { label: "主持祈愿", color: "#91382e" },
    omamori: { label: "缝制御守", color: "#b17a33" },
    publicity: { label: "街口宣传", color: "#536f75" }
  };

  let state = loadState();
  let actionLocked = false;
  let audioContext = null;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const refs = {
    money: $("#moneyValue"), faith: $("#faithValue"), visitors: $("#visitorsValue"), clean: $("#cleanValue"),
    era: $("#eraText"), month: $("#monthText"), day: $("#dayText"), time: $("#timeText"),
    weather: $("#weatherText"), energy: $("#energyPips"), endDay: $("#endDayBtn"),
    scene: $("#scene"), layer: $("#weatherLayer"), character: $("#character"), visitor: $("#visitorSprite"),
    float: $("#floatingText"), goal: $("#dailyGoal"), goalTitle: $("#goalTitle"), goalProgress: $("#goalProgress"),
    goalStamp: $("#goalStamp"), tasks: $("#taskList"), logs: $("#logList"), forecast: $("#forecastText"),
    hint: $("#actionHint"), backdrop: $("#modalBackdrop"), modalContent: $("#modalContent"), sound: $("#soundBtn")
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved) return structuredClone(DEFAULT_STATE);
      return {
        ...structuredClone(DEFAULT_STATE), ...saved,
        actionCounts: { ...DEFAULT_STATE.actionCounts, ...(saved.actionCounts || {}) },
        upgrades: { ...DEFAULT_STATE.upgrades, ...(saved.upgrades || {}) },
        log: Array.isArray(saved.log) ? saved.log.slice(0, 20) : []
      };
    } catch { return structuredClone(DEFAULT_STATE); }
  }

  function saveState() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
  function formatNumber(n) { return Math.round(n).toLocaleString("zh-CN"); }
  function pad2(num) { return String(num).padStart(2, "0"); }
  function localDateKey(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }
  function cnNumber(num) {
    const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    if (num < 10) return digits[num];
    if (num < 20) return "十" + (num === 10 ? "" : digits[num % 10]);
    return digits[Math.floor(num / 10)] + "十" + (num % 10 ? digits[num % 10] : "");
  }

  function formatEraYear(date) {
    const reiwaStart = new Date(2019, 4, 1);
    if (date >= reiwaStart) {
      const year = date.getFullYear() - 2018;
      return `令和${year === 1 ? "元" : cnNumber(year)}年`;
    }
    return `${date.getFullYear()}年`;
  }

  function timePeriod(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return "朝";
    if (hour >= 11 && hour < 17) return "昼";
    if (hour >= 17 && hour < 20) return "夕";
    return "夜";
  }

  function syncRealDay(now = new Date()) {
    const today = localDateKey(now);
    state.month = now.getMonth() + 1;
    state.day = now.getDate();

    // Older saves did not record a real date. Anchor them to today without an
    // immediate refill, so their next refill can happen only after midnight.
    if (!state.dailyDate) {
      state.dailyDate = today;
      return false;
    }
    // ISO date keys sort chronologically. Moving the device clock backwards
    // must not grant another refill for a date that has already been visited.
    if (today <= state.dailyDate) return false;

    state.dailyDate = today;
    state.weather = state.forecast;
    state.forecast = weightedWeather();
    state.publicity = Math.max(0, state.publicity - 1);
    state.energy = state.maxEnergy;
    state.dayVisitors = 0;
    state.actionCounts = { sweep: 0, pray: 0, omamori: 0, publicity: 0 };
    state.goalTarget = 12 + Math.min(18, Math.floor(state.faith / 18) * 2);
    state.goalClaimed = false;
    state.daySettled = false;
    addLog("现实日历进入了新的一天，今日精力已经恢复。", "开社");
    return true;
  }

  function renderClock(now = new Date()) {
    state.month = now.getMonth() + 1;
    state.day = now.getDate();
    refs.era.textContent = formatEraYear(now);
    refs.month.textContent = cnNumber(state.month) + "月";
    refs.day.textContent = cnNumber(state.day) + "日";
    const clock = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    refs.time.textContent = clock;
    refs.time.dateTime = `${localDateKey(now)}T${clock}`;
    $("#sceneTime").textContent = timePeriod(now);
    refs.scene.classList.toggle("evening", now.getHours() >= 17 || now.getHours() < 5);
  }

  function render() {
    syncRealDay(new Date());
    // Goal rewards may change resources, so settle them before painting the status bar.
    renderGoal();
    refs.money.textContent = formatNumber(state.money);
    refs.faith.textContent = formatNumber(state.faith);
    refs.visitors.textContent = formatNumber(state.lifetimeVisitors);
    refs.clean.textContent = Math.round(state.clean);
    renderClock(new Date());
    refs.weather.textContent = weatherNames[state.weather];
    refs.forecast.textContent = weatherDescriptions[state.forecast] + (state.publicity ? " · 宣传生效" : "");
    refs.sound.classList.toggle("sound-off", !state.sound);
    renderEnergy();
    renderTasks();
    renderLogs();
    renderScene();
    updateActions();
    saveState();
  }

  function renderEnergy() {
    refs.energy.innerHTML = "";
    for (let i = 0; i < state.maxEnergy; i++) {
      const pip = document.createElement("i");
      if (i >= state.energy) pip.className = "used";
      refs.energy.appendChild(pip);
    }
  }

  function renderGoal() {
    const complete = state.dayVisitors >= state.goalTarget;
    refs.goal.classList.toggle("complete", complete);
    refs.goalStamp.textContent = complete ? "成" : "未";
    refs.goalTitle.textContent = `迎接 ${state.goalTarget} 位参拜客`;
    refs.goalProgress.textContent = `目前 ${state.dayVisitors} / ${state.goalTarget}` + (complete && !state.goalClaimed ? " · 奖励已入账" : "");
    if (complete && !state.goalClaimed) {
      state.goalClaimed = true;
      state.money += 500;
      state.faith += 3;
      addLog("达成今日社务，町内会送来五百圆慰劳金。", "奖励");
      playTone("success");
    }
  }

  function renderTasks() {
    const tasks = [
      ["清扫一次境内", state.actionCounts.sweep > 0, "+整洁"],
      ["主持一次祈愿", state.actionCounts.pray > 0, "+信仰"],
      ["保持整洁在 70 以上", state.clean >= 70, "+客流"]
    ];
    refs.tasks.innerHTML = tasks.map(([name, done, bonus]) =>
      `<li class="${done ? "done" : ""}"><span>${name}</span><small>${done ? "完成" : "待办"}</small><b>${bonus}</b></li>`
    ).join("");
  }

  function renderLogs() {
    if (!state.log.length) {
      refs.logs.innerHTML = '<div class="log-entry"><time>开社</time><p>推开社务所的木窗，新的一页从这里开始。</p></div>';
      return;
    }
    refs.logs.innerHTML = state.log.slice(0, 8).map(entry =>
      `<div class="log-entry"><time>${escapeHtml(entry.time)}</time><p>${escapeHtml(entry.text)}</p></div>`
    ).join("");
  }

  function renderScene() {
    refs.scene.classList.toggle("rainy", state.weather === "rain");
    refs.layer.className = "weather-layer" + (state.weather === "rain" ? " rain" : state.weather === "mist" ? " mist" : "");
    renderClock(new Date());
    const moods = {
      sunny: ["阳光越过杉树梢，落在洒扫干净的石阶上。", "风铃轻响，远处传来町里的自行车铃声。"],
      cloudy: ["云影缓缓移过本殿，山里的风有些凉。", "杉叶沙沙作响，像是谁在低声说话。"],
      rain: ["细雨润湿石板路，屋檐下滴答作响。", "雨中的鸟居颜色格外鲜明。"],
      mist: ["薄雾缠绕山腰，境内显得静谧而神秘。", "雾气从石阶升起，御神木若隐若现。"]
    };
    $("#sceneMood").textContent = moods[state.weather][state.day % 2];
  }

  function updateActions() {
    $$(".action-card").forEach(button => {
      const unavailable = state.energy <= 0 || state.daySettled || actionLocked ||
        (button.dataset.action === "publicity" && state.money < 300) ||
        (button.dataset.action === "omamori" && state.clean < 25);
      button.disabled = unavailable;
    });
    refs.endDay.disabled = state.daySettled || actionLocked;
    refs.endDay.querySelector("b").textContent = state.daySettled ? "今日已结" : "结束今日";
    refs.hint.textContent = state.daySettled
      ? "今日社务已经结算。精力将在现实时间进入明日后恢复。"
      : state.energy <= 0
      ? "今天的精力已经用完了。可以结算今日，精力会在现实时间进入明日后恢复。"
      : "每项工作消耗一点精力。好好经营，让这座小神社重新热闹起来。";
  }

  function addLog(text, label = null) {
    state.log.unshift({ time: label || `${cnNumber(state.month)}月${cnNumber(state.day)}日`, text });
    state.log = state.log.slice(0, 20);
  }

  function performAction(type) {
    if (syncRealDay(new Date())) render();
    if (actionLocked || state.energy <= 0 || state.daySettled) return;
    if (type === "publicity" && state.money < 300) return flash("奉纳金不足");
    if (type === "omamori" && state.clean < 25) return flash("境内太乱，无法静心缝制");

    actionLocked = true;
    state.energy--;
    state.actionCounts[type]++;
    refs.character.classList.remove("working");
    void refs.character.offsetWidth;
    refs.character.classList.add("working");

    const effects = applyAction(type);
    flash(effects.label);
    playTone(type);
    if (effects.visitors > 0) showVisitor();
    maybeActionEvent(type);
    render();
    setTimeout(() => { actionLocked = false; refs.character.classList.remove("working"); updateActions(); }, 700);
  }

  function applyAction(type) {
    let visitors = 0;
    let label = "";
    if (type === "sweep") {
      const cleanGain = 18 + state.upgrades.garden * 4;
      state.clean = clamp(state.clean + cleanGain, 0, 100);
      state.faith += 1;
      visitors = state.clean > 80 ? random(2, 4) : random(1, 2);
      label = `整洁 +${cleanGain}　信仰 +1`;
      addLog("扫净了石阶上的落叶，参拜客称赞境内清爽。", "清扫");
    }
    if (type === "pray") {
      const faithGain = 5 + state.upgrades.hall * 2 + (state.weather === "mist" ? 2 : 0);
      state.faith += faithGain;
      visitors = random(3, 6) + state.upgrades.hall;
      label = `信仰 +${faithGain}　参拜客 +${visitors}`;
      addLog(pick(["为上山的母女主持了学业祈愿。", "为一位远行的青年系上祈愿绳。", "祝词声在本殿梁间久久回响。"]), "祈愿");
    }
    if (type === "omamori") {
      const earnings = random(430, 620) + state.upgrades.shop * 180;
      state.money += earnings;
      state.clean = clamp(state.clean - 4, 0, 100);
      visitors = random(1, 3);
      label = `奉纳金 +${earnings}圆`;
      addLog(`新缝的御守很受欢迎，奉纳金增加了 ${earnings} 圆。`, "授与所");
    }
    if (type === "publicity") {
      state.money -= 300;
      state.publicity = Math.min(3, state.publicity + 1);
      visitors = random(2, 4);
      label = "奉纳金 -300圆　明日客流 ↑";
      addLog("在商店街贴好了例祭传单，老板们答应帮忙宣传。", "町内");
    }
    addVisitors(visitors);
    return { visitors, label };
  }

  function addVisitors(amount) {
    const adjusted = state.weather === "rain" ? Math.max(1, Math.floor(amount * .75)) : amount;
    state.dayVisitors += adjusted;
    state.lifetimeVisitors += adjusted;
  }

  function maybeActionEvent(type) {
    if (Math.random() > .17) return;
    const events = {
      sweep: { title: "树下的旧硬币", body: "清扫御神木周围时，你在落叶下发现了一枚旧硬币。洗净后放进了社务所的小木盒。", effects: [["奉纳金", 100]], apply: () => state.money += 100 },
      pray: { title: "还愿的点心铺老板", body: "商店街的点心铺老板前来还愿，还带来一包刚烤好的栗子馒头。香气让大家都笑了。", effects: [["信仰", 3], ["参拜客", 2]], apply: () => { state.faith += 3; addVisitors(2); } },
      omamori: { title: "红线结缘", body: "一位女学生认真挑选了两个御守，说其中一个要寄给远方的朋友。", effects: [["奉纳金", 220], ["信仰", 1]], apply: () => { state.money += 220; state.faith += 1; } },
      publicity: { title: "旧书店的橱窗", body: "街角旧书店愿意把祭典传单贴在最显眼的橱窗里，町里的孩子们已经开始议论了。", effects: [["明日宣传", 1]], apply: () => state.publicity++ }
    };
    const event = events[type];
    event.apply();
    addLog(event.body, "偶遇");
    setTimeout(() => showEvent(event), 620);
  }

  function endDay() {
    if (syncRealDay(new Date())) render();
    if (actionLocked || state.daySettled) return;
    const naturalBase = random(4, 8) + Math.floor(state.faith / 18) + state.upgrades.hall * 2;
    const cleanFactor = state.clean >= 70 ? 1.25 : state.clean < 35 ? .65 : 1;
    const weatherFactor = state.weather === "rain" ? .55 : state.weather === "mist" ? .9 : 1;
    const publicityBonus = state.publicity * random(3, 5);
    const eveningVisitors = Math.max(1, Math.round(naturalBase * cleanFactor * weatherFactor) + publicityBonus);
    const offering = eveningVisitors * (random(36, 58) + state.upgrades.shop * 8);
    state.money += offering;
    addVisitors(eveningVisitors);
    state.clean = clamp(state.clean - random(7, 12) - Math.floor(eveningVisitors / 8), 0, 100);
    state.faith = clamp(state.faith - (state.clean < 25 ? 2 : 0), 0, 999);
    state.energy = 0;
    state.daySettled = true;

    const summary = {
      title: "一日安稳",
      body: `暮色降临，最后一位参拜客走下石阶。今日共有 ${state.dayVisitors} 人到访，香油钱与授与收入共计 ${formatNumber(offering)} 圆。`,
      effects: [["今日参拜", `${state.dayVisitors}人`], ["入账", `${formatNumber(offering)}圆`]],
      onConfirm: closeModal
    };
    if (state.clean < 25) {
      summary.title = "落叶堆积";
      summary.body += " 境内的落叶已经太多，参拜客颇有微词。明日最好先清扫。";
    }
    render();
    showEvent(summary);
  }

  function weightedWeather() {
    const roll = Math.random();
    if (roll < .52) return "sunny";
    if (roll < .73) return "cloudy";
    if (roll < .9) return "rain";
    return "mist";
  }

  function showEvent(event) {
    const template = $("#eventTemplate").content.cloneNode(true);
    template.querySelector("#eventTitle").textContent = event.title;
    template.querySelector("#eventBody").textContent = event.body;
    template.querySelector("#eventEffects").innerHTML = event.effects.map(([label, value]) => `<span>${escapeHtml(String(label))} ${typeof value === "number" && value >= 0 ? "+" : ""}${escapeHtml(String(value))}</span>`).join("");
    const confirm = template.querySelector("#eventConfirm");
    confirm.addEventListener("click", () => event.onConfirm ? event.onConfirm() : closeModal());
    openModal(template);
    playTone("event");
  }

  function showFestival() {
    state.festivalSeen = true;
    showEvent({
      title: "夏越祭，再兴！",
      body: "信仰已经传遍山下的町。消失多年的夏越祭终于能够重新举办——灯笼从鸟居一直亮到商店街，这座小神社真正活了过来。经营仍可继续。",
      effects: [["称号", "町守宫司"], ["信仰", "100达成"]]
    });
    saveState();
  }

  function showUpgrades() {
    const costs = {
      hall: [1800, 3800, 7200], shop: [1400, 3200, 6500], garden: [1200, 2800, 5600]
    };
    const info = {
      hall: ["本殿修缮", "提升祈愿信仰与每日自然客流"],
      shop: ["授与所扩建", "提高御守收益与参拜客奉纳"],
      garden: ["境内整备", "提高清扫效果，三级提高每日精力上限（次日生效）"]
    };
    const wrapper = document.createElement("div");
    wrapper.className = "upgrade-view";
    wrapper.innerHTML = `<span class="event-kicker">棟梁估价书</span><h2 id="modalTitle">修缮神社</h2><p>用奉纳金修整年久失修的设施。每项设施最多可提升三级。</p><div class="upgrade-list"></div>`;
    const list = wrapper.querySelector(".upgrade-list");
    Object.keys(info).forEach(key => {
      const level = state.upgrades[key];
      const max = level >= 3;
      const cost = max ? 0 : costs[key][level];
      const item = document.createElement("div");
      item.className = "upgrade-item";
      item.innerHTML = `<span class="level-mark">${level}/3</span><div><h3>${info[key][0]}</h3><p>${info[key][1]}</p></div><button ${max || state.money < cost ? "disabled" : ""}>${max ? "已完成" : `${formatNumber(cost)}圆`}</button>`;
      item.querySelector("button").addEventListener("click", () => buyUpgrade(key, cost));
      list.appendChild(item);
    });
    openModal(wrapper);
  }

  function buyUpgrade(key, cost) {
    if (state.money < cost || state.upgrades[key] >= 3) return;
    state.money -= cost;
    state.upgrades[key]++;
    if (key === "garden" && state.upgrades.garden === 3) {
      state.maxEnergy = 5;
    }
    state.faith += 2;
    addLog(`${key === "hall" ? "本殿" : key === "shop" ? "授与所" : "境内"}完成了一级修缮。`, "修缮");
    flash("修缮完成　信仰 +2");
    playTone("success");
    render();
    showUpgrades();
  }

  function showHelp() {
    const wrapper = document.createElement("div");
    wrapper.className = "help-view";
    wrapper.innerHTML = `
      <span class="event-kicker">社务手引</span><h2 id="modalTitle">游戏说明</h2>
      <p>你接手了山间一座逐渐被遗忘的小神社。安排有限的精力，积累奉纳金与信仰，让夏越祭重新回到町里。</p>
      <div class="help-grid">
        <div class="help-card"><b>经营循环</b><p>选择社务会消耗精力。点击“结束今日”会结算并收工；精力只会在现实时间进入新一天后恢复。</p></div>
        <div class="help-card"><b>环境影响</b><p>整洁越高，客流越好；雨天客流减少，薄雾会强化祈愿效果。</p></div>
        <div class="help-card"><b>修缮设施</b><p>本殿、授与所与境内各有三级，分别强化祈愿、收入与行动效率。</p></div>
        <div class="help-card"><b>最终目标</b><p>将信仰提升至 100，重启多年未办的夏越祭。达成后仍可继续经营。</p></div>
      </div>
      <button class="primary-button" id="resetBtn">重新开始</button>`;
    wrapper.querySelector("#resetBtn").addEventListener("click", resetGame);
    openModal(wrapper);
  }

  function resetGame() {
    if (!window.confirm("确定要清除当前经营记录，重新开始吗？")) return;
    state = structuredClone(DEFAULT_STATE);
    syncRealDay(new Date());
    closeModal();
    addLog("推开社务所的木窗，新的经营从这里开始。", "开社");
    render();
  }

  function openModal(content) {
    refs.modalContent.replaceChildren(content);
    refs.backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".modal-close").focus(), 10);
  }
  function closeModal() { refs.backdrop.hidden = true; document.body.style.overflow = ""; }

  function flash(text) {
    refs.float.textContent = text;
    refs.float.classList.remove("show");
    void refs.float.offsetWidth;
    refs.float.classList.add("show");
  }
  function showVisitor() {
    refs.visitor.classList.remove("show");
    void refs.visitor.offsetWidth;
    refs.visitor.classList.add("show");
  }

  function playTone(kind) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;
      const frequencies = kind === "success" ? [523, 659, 784] : kind === "event" ? [392, 523] : kind === "sweep" ? [220, 180] : [330, 440];
      frequencies.forEach((frequency, i) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = kind === "sweep" ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, now + i * .1);
        gain.gain.exponentialRampToValueAtTime(.045, now + i * .1 + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, now + i * .1 + .22);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now + i * .1); oscillator.stop(now + i * .1 + .24);
      });
    } catch { /* Audio is a nonessential enhancement. */ }
  }

  function escapeHtml(text) {
    return text.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  $$(".action-card").forEach(button => button.addEventListener("click", () => performAction(button.dataset.action)));
  $("#endDayBtn").addEventListener("click", endDay);
  $("#upgradeBtn").addEventListener("click", showUpgrades);
  $("#helpBtn").addEventListener("click", showHelp);
  $("#modalClose").addEventListener("click", closeModal);
  refs.backdrop.addEventListener("click", event => { if (event.target === refs.backdrop) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !refs.backdrop.hidden) closeModal(); });
  refs.sound.addEventListener("click", () => { state.sound = !state.sound; render(); if (state.sound) playTone("event"); });

  syncRealDay(new Date());
  if (!state.log.length) addLog("推开社务所的木窗，新的经营从这里开始。", "开社");
  render();
  setInterval(() => {
    const now = new Date();
    if (syncRealDay(now)) {
      render();
      if (state.faith >= 100 && !state.festivalSeen) setTimeout(showFestival, 400);
    } else {
      renderClock(now);
    }
  }, 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (syncRealDay(new Date())) render();
    else renderClock(new Date());
  });
})();
