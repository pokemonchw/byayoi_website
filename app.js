// 主页内容数据与小型交互逻辑，保持社区内容易更新。

/**
 * @typedef {Object} SiteLink
 * @property {string} id
 * @property {string} label
 * @property {string} url
 * @property {string} purpose
 * @property {string} actionLabel
 */

/**
 * @typedef {Object} Announcement
 * @property {string} id
 * @property {string} title
 * @property {string} date
 * @property {string} summary
 * @property {string} targetUrl
 * @property {string} actionLabel
 * @property {"link" | "standee"} actionType
 */

/**
 * @typedef {Object} FeaturedProject
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {string} status
 * @property {string} summary
 * @property {{label: string, url: string}[]} links
 * @property {string} notice
 */

/**
 * @typedef {Object} CommunityChannel
 * @property {string} id
 * @property {string} label
 * @property {string} description
 * @property {string} [contactValue]
 * @property {string} actionLabel
 * @property {string} url
 */

const siteLinks = [
    {
        id: "homepage",
        label: "本站首页",
        url: "https://byayoi.org/",
        purpose: "返回月之神社公开主页入口。",
        actionLabel: "访问首页"
    },
    {
        id: "projects",
        label: "作品入口",
        url: "#projects",
        purpose: "查看月之神社相关的游戏、文字作品和公开创作入口。",
        actionLabel: "去看看"
    },
    {
        id: "announcements",
        label: "公告近况",
        url: "#announcements",
        purpose: "阅读适合公开看的短消息、入口变化和社团小记。",
        actionLabel: "读近况"
    }
];

const announcementList = [
    {
        id: "mascot-standee-update",
        title: "看板娘立绘更新",
        date: "2026-07-29",
        summary: "看板娘 03 的两张立绘现已更新。",
        targetUrl: "#standeeDialog",
        actionLabel: "查看立绘",
        actionType: "standee"
    },
    {
        id: "homepage-welcome-note",
        title: "新的神社入口摆好了",
        date: "2026-07-13",
        summary: "月之神社重新开张，祝福～",
        targetUrl: "#top",
        actionLabel: "查看相关位置",
        actionType: "link"
    }
];

const featuredProjects = [
    {
        id: "dieloli",
        name: "死亡萝莉",
        type: "文字模拟游戏",
        status: "社群创作",
        summary: "以文字和 ASCII 表现为主，带着自由演算 NPC、开放玩法和同人实验气质的作品。",
        links: [
            {
                label: "查看作品",
                url: "https://dieloli.org"
            }
        ],
        notice: ""
    },
    {
        id: "goblin-empire",
        name: "哥布林帝国",
        type: "浏览器经营小游戏",
        status: "创作企划",
        summary: "以中文策划、渐进解锁和文本管理界面为核心，适合慢慢打磨的小型作品。",
        links: [
            {
                label: "查看作品",
                url: "https://goblinempire.byayoi.org/"
            }
        ],
        notice: ""
    }
];

const communityChannels = [
    {
        id: "official-qq-group",
        label: "社团 QQ 群",
        description: "用于社团日常交流、公开联系和同好加入。",
        contactValue: "950487389",
        actionLabel: "复制群号",
        url: "#channel-official-qq-group"
    },
    {
        id: "project-feedback",
        label: "作品反馈",
        description: "想聊具体作品的问题、建议和想法，可以先从作品入口找到对应说明。",
        actionLabel: "查看作品",
        url: "#projects"
    },
    {
        id: "homepage-maintenance",
        label: "资料补充",
        description: "适合补充公开资料、提醒链接失效，或把新的公开入口交给页面收纳。",
        actionLabel: "查看近况",
        url: "#announcements"
    }
];

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#siteNav");
const meteorCatLayer = document.querySelector("#meteorCatLayer");
const standeeDialog = document.querySelector("#standeeDialog");
const standeeCanvas = document.querySelector(".standee-canvas");
const standeePreviewImage = document.querySelector("#standeePreviewImage");
const standeeFullImage = document.querySelector("#standeeFullImage");
const standeeLoadingStatus = document.querySelector("#standeeLoadingStatus");
const standeeCloseButton = document.querySelector("[data-close-standee]");
const standeeVariantButtons = document.querySelectorAll("[data-standee-src]");
const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const METEOR_CAT_IMAGE_URL = "assets/meteor-cat.png";
const METEOR_CAT_MIN_DELAY = 6500;
const METEOR_CAT_MAX_DELAY = 14000;
const METEOR_CAT_MAX_BATCH = 1;
const METEOR_CAT_MAX_ON_SCREEN = 2;
const METEOR_CAT_MIN_ROTATION_DELTA = 16;
const METEOR_CAT_MAX_ROTATION_DELTA = 42;
const standeeObjectUrls = new Map();
let standeeOpenButton = null;
let activeStandeeLoad = null;
let standeeLoadSequence = 0;

function formatDateLabel(dateValue) {
    const date = new Date(`${dateValue}T00:00:00+08:00`);
    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

function createExternalAttrs(url) {
    if (!url || url.startsWith("#")) {
        return "";
    }

    return " target=\"_blank\" rel=\"noreferrer\"";
}

function renderSiteLinks() {
    const listElement = document.querySelector("#siteLinks");
    listElement.innerHTML = siteLinks.map((siteLink) => {
        return `
            <article class="link-card" id="link-${siteLink.id}">
                <h3>${siteLink.label}</h3>
                <p>${siteLink.purpose}</p>
                <a class="text-link" href="${siteLink.url}"${createExternalAttrs(siteLink.url)}>${siteLink.actionLabel}</a>
            </article>
        `;
    }).join("");
}

function renderAnnouncements() {
    const listElement = document.querySelector("#announcementList");
    listElement.innerHTML = announcementList.map((announcement) => {
        const actionMarkup = announcement.actionType === "standee"
            ? `
                <button
                    class="text-button announcement-action"
                    type="button"
                    aria-haspopup="dialog"
                    aria-controls="standeeDialog"
                    data-open-standee
                >
                    ${announcement.actionLabel}
                </button>
            `
            : `
                <a class="text-link announcement-action" href="${announcement.targetUrl}">
                    ${announcement.actionLabel}
                </a>
            `;

        return `
            <article class="announcement-card" id="announcement-${announcement.id}">
                <time class="announcement-date" datetime="${announcement.date}">${formatDateLabel(announcement.date)}</time>
                <div>
                    <h3>${announcement.title}</h3>
                    <p>${announcement.summary}</p>
                </div>
                ${actionMarkup}
            </article>
        `;
    }).join("");
}

function renderLatestAnnouncement() {
    const latestAnnouncement = announcementList[0];
    const latestElement = document.querySelector("#heroLatestAnnouncement");

    if (!latestAnnouncement) {
        latestElement.hidden = true;
        return;
    }

    const latestTargetUrl = latestAnnouncement.actionType === "standee"
        ? "#announcements"
        : latestAnnouncement.targetUrl;

    latestElement.innerHTML = `
        <a class="hero-update-link" href="${latestTargetUrl}">
            <span class="hero-update-label">最近更新</span>
            <span class="hero-update-title">${latestAnnouncement.title}</span>
            <time class="hero-update-date" datetime="${latestAnnouncement.date}">${formatDateLabel(latestAnnouncement.date)}</time>
        </a>
    `;
}

function renderFeaturedProjects() {
    const listElement = document.querySelector("#featuredProjects");
    listElement.innerHTML = featuredProjects.map((project) => {
        const linkMarkup = project.links.map((projectLink) => `
            <a class="button secondary-button" href="${projectLink.url}"${createExternalAttrs(projectLink.url)}>${projectLink.label}</a>
        `).join("");
        const noticeMarkup = project.notice
            ? `<p class="project-notice">${project.notice}</p>`
            : "";

        return `
            <article class="project-card" id="project-${project.id}">
                <div>
                    <h3>${project.name}</h3>
                    <div class="project-meta" aria-label="作品标签">
                        <span class="project-tag">${project.type}</span>
                        <span class="project-tag">${project.status}</span>
                    </div>
                    <p>${project.summary}</p>
                    ${noticeMarkup}
                </div>
                <div class="project-actions">
                    ${linkMarkup}
                </div>
            </article>
        `;
    }).join("");
}

function renderCommunityChannels() {
    const listElement = document.querySelector("#communityChannels");
    listElement.innerHTML = communityChannels.map((channel) => {
        const contactMarkup = channel.contactValue
            ? `
                <p class="contact-line" aria-label="${channel.label}号码">
                    <span>群号</span>
                    <strong>${channel.contactValue}</strong>
                </p>
            `
            : "";
        const actionMarkup = channel.contactValue
            ? `<button class="text-button contact-copy" type="button" data-contact-value="${channel.contactValue}">${channel.actionLabel}</button>`
            : `<a class="text-link" href="${channel.url}"${createExternalAttrs(channel.url)}>${channel.actionLabel}</a>`;

        return `
            <article class="join-card" id="channel-${channel.id}">
                <h3>${channel.label}</h3>
                <p>${channel.description}</p>
                ${contactMarkup}
                ${actionMarkup}
            </article>
        `;
    }).join("");
}

async function copyTextValue(textValue) {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(textValue);
        return true;
    }

    const textArea = document.createElement("textarea");
    textArea.value = textValue;
    textArea.setAttribute("readonly", "");
    textArea.className = "visually-hidden";
    document.body.append(textArea);
    textArea.select();
    const didCopy = document.execCommand("copy");
    textArea.remove();
    return didCopy;
}

function bindContactActions() {
    document.querySelectorAll(".contact-copy").forEach((button) => {
        button.addEventListener("click", async () => {
            const contactValue = button.getAttribute("data-contact-value");

            if (!contactValue) {
                return;
            }

            const didCopy = await copyTextValue(contactValue);
            button.textContent = didCopy ? "已复制" : "请手动复制";
            window.setTimeout(() => {
                button.textContent = "复制群号";
            }, 1800);
        });
    });
}

function openMenu() {
    document.body.classList.add("is-menu-open");
    siteNav.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.querySelector(".visually-hidden").textContent = "关闭导航菜单";
}

function closeMenu() {
    document.body.classList.remove("is-menu-open");
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.querySelector(".visually-hidden").textContent = "打开导航菜单";
}

function toggleMenu() {
    const isMenuOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (isMenuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

function bindNavigation() {
    menuToggle.addEventListener("click", toggleMenu);

    siteNav.addEventListener("click", (event) => {
        if (event.target instanceof HTMLAnchorElement) {
            closeMenu();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}

function cancelStandeeLoad() {
    standeeLoadSequence += 1;

    if (!activeStandeeLoad) {
        return;
    }

    activeStandeeLoad.controller?.abort();

    if (activeStandeeLoad.image) {
        activeStandeeLoad.image.src = "";
    }

    activeStandeeLoad = null;
}

function formatStandeeLoadingStatus(loadedBytes, totalBytes) {
    if (!totalBytes) {
        return "正在流式加载高清立绘…";
    }

    const loadedPercent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
    return `正在流式加载高清立绘… ${loadedPercent}%`;
}

/**
 * 分块读取立绘响应，以便显示下载进度并在切换或关闭时取消请求。
 * @param {string} standeeSrc
 * @param {AbortSignal} signal
 * @param {(loadedBytes: number, totalBytes: number) => void} onProgress
 * @returns {Promise<Blob>}
 */
async function fetchStandeeBlob(standeeSrc, signal, onProgress) {
    const response = await fetch(standeeSrc, {
        cache: "force-cache",
        signal
    });

    if (!response.ok) {
        throw new Error(`立绘请求失败：${response.status}`);
    }

    const totalBytes = Number(response.headers.get("Content-Length")) || 0;

    if (!response.body) {
        const standeeBlob = await response.blob();
        onProgress(standeeBlob.size, standeeBlob.size);
        return standeeBlob;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let loadedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        chunks.push(value);
        loadedBytes += value.byteLength;
        onProgress(loadedBytes, totalBytes);
    }

    return new Blob(chunks, {
        type: response.headers.get("Content-Type") || "image/webp"
    });
}

/**
 * 等待图片解码完成，避免低清预览在高清图尚未可绘制时消失。
 * @param {string} imageSrc
 * @param {{image: HTMLImageElement | null}} loadState
 * @returns {Promise<void>}
 */
function decodeStandeeImage(imageSrc, loadState) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        loadState.image = image;
        image.decoding = "async";
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("立绘解码失败"));
        image.src = imageSrc;
    });
}

async function loadStandeeImage(standeeSrc, standeeAlt) {
    cancelStandeeLoad();

    const loadId = standeeLoadSequence;
    const controller = new AbortController();
    const loadState = {
        controller,
        id: loadId,
        image: null,
        standeeSrc
    };
    activeStandeeLoad = loadState;
    standeeCanvas.classList.remove("is-loaded", "has-load-error");
    standeeCanvas.classList.add("is-loading");
    standeeLoadingStatus.textContent = formatStandeeLoadingStatus(0, 0);
    standeeLoadingStatus.hidden = false;

    try {
        let displaySrc = standeeObjectUrls.get(standeeSrc);

        if (!displaySrc && window.location.protocol === "file:") {
            displaySrc = standeeSrc;
            standeeLoadingStatus.textContent = "正在加载高清立绘…";
        } else if (!displaySrc) {
            const standeeBlob = await fetchStandeeBlob(
                standeeSrc,
                controller.signal,
                (loadedBytes, totalBytes) => {
                    if (activeStandeeLoad?.id === loadId) {
                        standeeLoadingStatus.textContent = formatStandeeLoadingStatus(
                            loadedBytes,
                            totalBytes
                        );
                    }
                }
            );
            displaySrc = URL.createObjectURL(standeeBlob);
            standeeObjectUrls.set(standeeSrc, displaySrc);
        }

        await decodeStandeeImage(displaySrc, loadState);

        if (activeStandeeLoad?.id !== loadId) {
            return;
        }

        standeeFullImage.src = displaySrc;
        standeeFullImage.alt = standeeAlt;
        standeeFullImage.dataset.loadedSrc = standeeSrc;
        standeePreviewImage.alt = "";
        standeeCanvas.classList.remove("is-loading", "has-load-error");
        standeeCanvas.classList.add("is-loaded");
        standeeLoadingStatus.hidden = true;
        activeStandeeLoad = null;
    } catch (error) {
        if (error.name === "AbortError" || activeStandeeLoad?.id !== loadId) {
            return;
        }

        activeStandeeLoad = null;
        standeeCanvas.classList.remove("is-loading", "is-loaded");
        standeeCanvas.classList.add("has-load-error");
        standeeLoadingStatus.textContent = "高清立绘加载失败，请稍后重试。";
        standeeLoadingStatus.hidden = false;
    }
}

function selectStandeeVariant(selectedButton) {
    const standeeSrc = selectedButton.getAttribute("data-standee-src");
    const standeePreview = selectedButton.getAttribute("data-standee-preview");
    const standeeAlt = selectedButton.getAttribute("data-standee-alt");

    if (!standeeSrc || !standeePreview || !standeeAlt) {
        return;
    }

    standeeVariantButtons.forEach((variantButton) => {
        const isSelected = variantButton === selectedButton;
        variantButton.classList.toggle("is-active", isSelected);
        variantButton.setAttribute("aria-pressed", String(isSelected));
    });

    standeePreviewImage.src = standeePreview;
    standeePreviewImage.alt = standeeAlt;

    if (
        standeeFullImage.dataset.loadedSrc === standeeSrc
        && standeeCanvas.classList.contains("is-loaded")
    ) {
        standeePreviewImage.alt = "";
        return;
    }

    if (activeStandeeLoad?.standeeSrc === standeeSrc) {
        return;
    }

    standeeFullImage.alt = "";
    loadStandeeImage(standeeSrc, standeeAlt);
}

function hydrateStandeePreviews() {
    document.querySelectorAll("[data-preview-src]").forEach((previewImage) => {
        const previewSrc = previewImage.getAttribute("data-preview-src");

        if (previewSrc && !previewImage.hasAttribute("src")) {
            previewImage.setAttribute("src", previewSrc);
        }
    });
}

function openStandee(openButton) {
    const selectedButton = document.querySelector(".standee-variant.is-active")
        || standeeVariantButtons[0];

    if (typeof standeeDialog.showModal !== "function") {
        const standeeSrc = selectedButton?.getAttribute("data-standee-src");

        if (standeeSrc) {
            window.open(standeeSrc, "_blank", "noopener");
        }

        return;
    }

    standeeOpenButton = openButton;
    hydrateStandeePreviews();
    document.body.classList.add("is-standee-open");
    standeeDialog.showModal();
    standeeCloseButton.focus();

    if (selectedButton) {
        window.requestAnimationFrame(() => {
            selectStandeeVariant(selectedButton);
        });
    }
}

function restoreStandeePageState() {
    cancelStandeeLoad();
    standeeCanvas.classList.remove("is-loading");
    standeeLoadingStatus.hidden = true;
    document.body.classList.remove("is-standee-open");

    if (standeeOpenButton instanceof HTMLElement) {
        standeeOpenButton.focus();
    }
}

function closeStandee() {
    if (standeeDialog.open) {
        standeeDialog.close();
    }

    restoreStandeePageState();
}

function bindStandeeDialog() {
    document.querySelectorAll("[data-open-standee]").forEach((openButton) => {
        openButton.addEventListener("click", () => {
            openStandee(openButton);
        });
    });

    standeeCloseButton.addEventListener("click", closeStandee);

    standeeVariantButtons.forEach((variantButton) => {
        variantButton.addEventListener("click", () => {
            selectStandeeVariant(variantButton);
        });
    });

    standeeDialog.addEventListener("click", (event) => {
        if (event.target === standeeDialog) {
            closeStandee();
        }
    });

    standeeDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeStandee();
    });

    standeeDialog.addEventListener("close", restoreStandeePageState);

    window.addEventListener("pagehide", () => {
        cancelStandeeLoad();
        standeeObjectUrls.forEach((objectUrl) => {
            URL.revokeObjectURL(objectUrl);
        });
        standeeObjectUrls.clear();
    });
}

function getRandomNumber(minValue, maxValue) {
    return minValue + Math.random() * (maxValue - minValue);
}

function getRandomInteger(minValue, maxValue) {
    return Math.floor(getRandomNumber(minValue, maxValue + 1));
}

function createMeteorCat() {
    const meteorCat = document.createElement("img");
    const startY = getRandomNumber(-12, 72);
    const travelDrop = getRandomNumber(18, 42);
    const duration = getRandomInteger(10000, 19000);
    const size = getRandomInteger(72, 138);
    const scale = getRandomNumber(0.82, 1.16).toFixed(2);
    const opacity = getRandomNumber(0.38, 0.74).toFixed(2);
    const rotationStart = getRandomNumber(-14, 14);
    const rotationDelta = getRandomNumber(METEOR_CAT_MIN_ROTATION_DELTA, METEOR_CAT_MAX_ROTATION_DELTA)
        * (Math.random() < 0.5 ? -1 : 1);
    const rotationEnd = rotationStart + rotationDelta;

    meteorCat.className = "meteor-cat";
    meteorCat.src = METEOR_CAT_IMAGE_URL;
    meteorCat.alt = "";
    meteorCat.decoding = "async";
    meteorCat.style.setProperty("--meteor-start-x", `calc(100vw + ${size}px)`);
    meteorCat.style.setProperty("--meteor-start-y", `${startY}vh`);
    meteorCat.style.setProperty("--meteor-end-x", `-${size * 3}px`);
    meteorCat.style.setProperty("--meteor-end-y", `${startY + travelDrop}vh`);
    meteorCat.style.setProperty("--meteor-duration", `${duration}ms`);
    meteorCat.style.setProperty("--meteor-size", `${size}px`);
    meteorCat.style.setProperty("--meteor-scale", scale);
    meteorCat.style.setProperty("--meteor-opacity", opacity);
    meteorCat.style.setProperty("--meteor-rotation-start", `${rotationStart.toFixed(2)}deg`);
    meteorCat.style.setProperty("--meteor-rotation-end", `${rotationEnd.toFixed(2)}deg`);
    meteorCat.addEventListener("animationend", () => {
        meteorCat.remove();
    }, { once: true });

    return meteorCat;
}

function launchMeteorCatBatch() {
    const meteorCount = getRandomInteger(1, METEOR_CAT_MAX_BATCH);

    for (let index = 0; index < meteorCount; index += 1) {
        window.setTimeout(() => {
            if (meteorCatLayer.children.length >= METEOR_CAT_MAX_ON_SCREEN) {
                return;
            }

            meteorCatLayer.append(createMeteorCat());
        }, getRandomInteger(0, 900));
    }
}

function scheduleMeteorCats() {
    if (!meteorCatLayer || shouldReduceMotion) {
        return;
    }

    const delay = getRandomInteger(METEOR_CAT_MIN_DELAY, METEOR_CAT_MAX_DELAY);
    window.setTimeout(() => {
        launchMeteorCatBatch();
        scheduleMeteorCats();
    }, delay);
}

renderSiteLinks();
renderAnnouncements();
renderLatestAnnouncement();
renderFeaturedProjects();
renderCommunityChannels();
bindContactActions();
bindNavigation();
bindStandeeDialog();
scheduleMeteorCats();

