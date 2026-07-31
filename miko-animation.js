// 看板娘动画浮框：负责像素角色绘制、自动动画与指针/键盘拖动。
(function initializeMikoFloat() {
    const mikoFloat = document.querySelector("[data-miko-float]");

    if (!mikoFloat) {
        return;
    }

    const canvas = mikoFloat.querySelector("[data-miko-sprite]");
    const canvasContext = canvas instanceof HTMLCanvasElement ? canvas.getContext("2d") : null;
    const dragGrip = mikoFloat;
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canvasContext) {
        return;
    }

    const MIKO_COLORS = {
        dark: "#242124",
        deep: "#625d60",
        mid: "#b8b3b5",
        light: "#fffdf8"
    };
    const MIKO_PALETTE = [
        [36, 33, 36],
        [98, 93, 96],
        [184, 179, 181],
        [255, 253, 248]
    ];

    function drawRectangle(x, y, width, height, color) {
        canvasContext.fillStyle = color;
        canvasContext.fillRect(x, y, width, height);
    }

    function drawPolygon(points, color) {
        canvasContext.fillStyle = color;
        canvasContext.beginPath();
        canvasContext.moveTo(points[0][0], points[0][1]);

        for (let index = 1; index < points.length; index += 1) {
            canvasContext.lineTo(points[index][0], points[index][1]);
        }

        canvasContext.closePath();
        canvasContext.fill();
    }

    function drawPixels(pixelList, color) {
        canvasContext.fillStyle = color;
        pixelList.forEach(([x, y, width = 2, height = 2]) => {
            canvasContext.fillRect(x, y, width, height);
        });
    }

    // Canvas 多边形边缘会产生半透明像素；量化后每个格子只保留四种本站主题色。
    function snapToPixelPalette() {
        const frame = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        const pixelValues = frame.data;

        for (let index = 0; index < pixelValues.length; index += 4) {
            if (pixelValues[index + 3] < 64) {
                pixelValues[index] = 0;
                pixelValues[index + 1] = 0;
                pixelValues[index + 2] = 0;
                pixelValues[index + 3] = 0;
                continue;
            }

            let closestColor = MIKO_PALETTE[0];
            let closestDistance = Infinity;

            for (const color of MIKO_PALETTE) {
                const distance = (pixelValues[index] - color[0]) ** 2
                    + (pixelValues[index + 1] - color[1]) ** 2
                    + (pixelValues[index + 2] - color[2]) ** 2;

                if (distance < closestDistance) {
                    closestColor = color;
                    closestDistance = distance;
                }
            }

            [
                pixelValues[index],
                pixelValues[index + 1],
                pixelValues[index + 2]
            ] = closestColor;
            pixelValues[index + 3] = 255;
        }

        canvasContext.putImageData(frame, 0, 0);
    }

    /** 在 34×34 逻辑网格中绘制看板娘，眨眼时只替换眼部像素。 */
    function drawMiko(isBlinking = false) {
        const colors = MIKO_COLORS;
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.imageSmoothingEnabled = false;

        drawPolygon([[13, 4], [10, 5], [8, 7], [6, 10], [5, 14], [5, 20], [7, 23], [10, 25],
            [14, 24], [20, 24], [24, 25], [27, 23], [29, 20], [29, 13], [28, 9], [25, 6], [22, 4]], colors.dark);
        drawPolygon([[13, 6], [10, 7], [8, 10], [7, 14], [7, 20], [9, 23], [12, 24], [14, 22],
            [20, 22], [23, 24], [26, 22], [27, 19], [27, 12], [25, 8], [22, 6]], colors.deep);
        drawPixels([[9, 9, 3, 1], [7, 14, 1, 4], [9, 21, 2, 2], [23, 7, 2, 1], [26, 12, 1, 5],
            [24, 21, 2, 2]], colors.mid);

        // 两侧发缕沿角色中心线镜像，长度、弧度与收尖位置保持一致。
        drawPolygon([[10, 6], [8, 7], [7, 9], [5, 11], [3, 14], [1, 17],
            [1, 19], [2, 21], [4, 23], [3, 20], [3, 18], [4, 16], [5, 14],
            [6, 11], [7, 9], [9, 8]], colors.dark);
        drawPolygon([[9, 7], [8, 8], [7, 10], [5, 12], [4, 14], [2, 17],
            [2, 19], [3, 21], [3, 18], [4, 16], [5, 14], [6, 12], [7, 10], [9, 8]], colors.deep);
        drawPolygon([[24, 6], [26, 7], [27, 9], [29, 11], [31, 14], [33, 17],
            [33, 19], [32, 21], [30, 23], [31, 20], [31, 18], [30, 16], [29, 14],
            [28, 11], [27, 9], [25, 8]], colors.dark);
        drawPolygon([[25, 7], [26, 8], [27, 10], [29, 12], [30, 14], [32, 17],
            [32, 19], [31, 21], [31, 18], [30, 16], [29, 14], [28, 12], [27, 10], [25, 8]], colors.deep);

        // 双臂位于躯干轮廓之外并自然下垂，袖口在胸像底边外截断，不绘制手掌。
        drawPolygon([[11, 24], [9, 25], [7, 27], [6, 30], [6, 34], [10, 34], [11, 27]], colors.dark);
        drawPolygon([[10, 26], [8, 27], [7, 30], [7, 33], [9, 33], [10, 27]], colors.light);
        drawPolygon([[24, 24], [26, 25], [28, 27], [29, 30], [29, 34], [25, 34], [24, 27]], colors.dark);
        drawPolygon([[25, 26], [27, 27], [28, 30], [28, 33], [26, 33], [25, 27]], colors.light);

        // 当前肩宽完整用于躯干本身，不再把躯干内部空间划作手臂。
        drawPolygon([[15, 22], [13, 23], [12, 24], [11, 26], [10, 29], [10, 34],
            [25, 34], [25, 29], [24, 26], [23, 24], [21, 22]], colors.dark);
        drawPolygon([[16, 23], [14, 24], [13, 25], [12, 28], [12, 34], [23, 34],
            [23, 28], [22, 25], [20, 23]], colors.light);

        // 袖身保持浅色，只用离散深色像素表现立绘的断续饰带，不使用灰色块面填充。
        drawPixels([[9, 27, 1, 1], [8, 30, 1, 1], [8, 32, 1, 1],
            [26, 27, 1, 1], [27, 30, 1, 1], [27, 32, 1, 1]], colors.deep);

        drawRectangle(15, 21, 6, 4, colors.dark);
        drawRectangle(16, 21, 4, 4, colors.light);
        drawPolygon([[9, 9], [12, 6], [17, 5], [22, 6], [25, 9], [27, 13], [26, 19], [23, 23],
            [20, 25], [14, 25], [10, 22], [8, 18], [8, 13]], colors.dark);
        drawPolygon([[10, 10], [13, 8], [17, 7], [21, 8], [24, 10], [25, 13], [25, 18], [22, 22],
            [19, 23], [15, 23], [11, 21], [10, 18]], colors.light);

        // 立绘领口层次：窄深色内领在下，宽白外领交叠，主交领线贯穿整个胸像。
        drawPolygon([[14, 23], [16, 22], [18, 25], [20, 22], [22, 23],
            [19, 28], [17, 28]], colors.deep);
        drawPolygon([[13, 24], [15, 23], [19, 27], [18, 29], [12, 26]], colors.light);
        drawPolygon([[21, 23], [23, 24], [17, 34], [15, 34]], colors.light);
        drawPixels([[14, 23, 1, 1], [15, 24, 1, 1], [16, 25, 1, 1],
            [17, 26, 1, 1], [18, 27, 1, 1]], colors.deep);
        drawPixels([[21, 23, 1, 1], [20, 24, 1, 2], [19, 26, 1, 2], [18, 28, 1, 2],
            [17, 30, 1, 2], [16, 32, 1, 2]], colors.dark);

        drawPolygon([[8, 12], [8, 9], [11, 6], [15, 4], [20, 4], [24, 6], [27, 10], [27, 13], [25, 12],
            [24, 10], [22, 9], [20, 8], [17, 8], [14, 9], [12, 11], [10, 15], [9, 15]], colors.dark);
        drawPolygon([[10, 11], [10, 8], [13, 6], [17, 5], [20, 5], [23, 7], [25, 9], [25, 12],
            [23, 11], [21, 10], [18, 9], [15, 10], [13, 12], [11, 14]], colors.deep);
        drawPixels([[12, 7, 3, 1], [16, 6, 3, 1], [21, 7, 2, 1], [11, 9, 1, 2]], colors.mid);

        drawPolygon([[10, 9], [13, 7], [17, 6], [21, 7], [25, 9], [25, 13], [23, 14], [21, 13],
            [19, 16], [17, 14], [15, 13], [13, 15], [11, 13]], colors.deep);
        drawPixels([[11, 9, 2, 1], [15, 8, 2, 1], [20, 8, 2, 1], [23, 10, 1, 2]], colors.mid);
        drawPolygon([[13, 7], [15, 7], [15, 10], [14, 13], [15, 15], [13, 14], [12, 12], [13, 10]], colors.dark);
        drawPixels([[14, 8, 1, 2], [13, 11, 1, 2]], colors.mid);
        drawPolygon([[16, 6], [19, 5], [22, 7], [24, 10], [23, 12], [21, 13], [19, 16], [17, 15],
            [17, 12], [18, 9]], colors.dark);
        drawPolygon([[18, 7], [20, 7], [22, 8], [23, 10], [22, 11], [20, 13], [19, 15], [18, 14],
            [19, 10]], colors.deep);
        drawPixels([[19, 7, 2, 1], [21, 9, 1, 2], [19, 12, 1, 2]], colors.mid);
        drawPolygon([[22, 8], [24, 9], [25, 8], [25, 10], [24, 12], [22, 12], [23, 11], [21, 10]], colors.dark);
        drawPixels([[23, 9, 1, 1], [24, 10, 1, 1], [22, 10, 1, 1]], colors.mid);

        drawPolygon([[9, 10], [6, 14], [6, 20], [8, 24], [11, 26], [13, 24], [11, 21], [11, 13]], colors.dark);
        drawPolygon([[9, 13], [8, 15], [8, 20], [10, 23], [11, 24], [11, 22], [10, 19], [10, 13]], colors.deep);
        drawPixels([[7, 15, 1, 4], [9, 21, 1, 2]], colors.mid);
        drawPolygon([[25, 9], [28, 13], [28, 19], [26, 23], [23, 26], [21, 24], [23, 20], [23, 12]], colors.dark);
        drawPolygon([[25, 12], [26, 14], [26, 19], [24, 23], [23, 24], [23, 22], [24, 19], [24, 11]], colors.deep);
        drawPixels([[27, 14, 1, 4], [25, 20, 1, 2]], colors.mid);

        // 呆毛沿用两侧发缕的窄发片画法，整体左移并让尾端悬空。
        drawPolygon([[17, 5], [18, 4], [18, 3], [17, 1], [15, 0], [13, 1],
            [11, 2], [12, 3], [13, 2], [15, 1], [16, 2], [17, 3], [16, 5]], colors.dark);
        drawPolygon([[17, 4], [17, 3], [16, 2], [15, 1], [13, 2],
            [15, 2], [16, 3], [16, 4]], colors.deep);

        if (isBlinking) {
            drawPixels([[10, 16, 1, 1], [11, 17, 4, 1], [15, 16, 1, 1],
                [19, 16, 1, 1], [20, 17, 4, 1], [24, 16, 1, 1]], colors.dark);
        } else {
            drawPixels([[10, 15, 1, 1], [11, 15, 4, 1], [11, 16, 1, 2], [14, 16, 1, 2],
                [12, 18, 2, 1]], colors.dark);
            drawPixels([[12, 16, 1, 1]], colors.light);
            drawPixels([[13, 16, 1, 1], [12, 17, 1, 1]], colors.mid);
            drawPixels([[13, 17, 1, 1]], colors.deep);
            drawPixels([[20, 15, 4, 1], [24, 15, 1, 1], [20, 16, 1, 2], [23, 16, 1, 2],
                [21, 18, 2, 1]], colors.dark);
            drawPixels([[21, 16, 1, 1]], colors.light);
            drawPixels([[22, 16, 1, 1], [21, 17, 1, 1]], colors.mid);
            drawPixels([[22, 17, 1, 1]], colors.deep);
        }

        drawPixels([[10, 20, 1, 1], [24, 20, 1, 1]], colors.mid);

        drawPixels([[16, 21, 1, 1], [17, 22, 2, 1], [19, 21, 1, 1]], colors.dark);

        snapToPixelPalette();
    }

    function getClampedPosition(left, top) {
        const edgeMargin = 8;
        const maximumLeft = Math.max(edgeMargin, window.innerWidth - mikoFloat.offsetWidth - edgeMargin);
        const maximumTop = Math.max(edgeMargin, window.innerHeight - mikoFloat.offsetHeight - edgeMargin);

        return {
            left: Math.min(Math.max(left, edgeMargin), maximumLeft),
            top: Math.min(Math.max(top, edgeMargin), maximumTop)
        };
    }

    function moveFloat(left, top) {
        const position = getClampedPosition(left, top);
        mikoFloat.style.right = "auto";
        mikoFloat.style.bottom = "auto";
        mikoFloat.style.left = `${position.left}px`;
        mikoFloat.style.top = `${position.top}px`;
    }

    const dragState = {
        isDragging: false,
        pointerId: null,
        offsetX: 0,
        offsetY: 0
    };

    function startDragging(event) {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        const floatBounds = mikoFloat.getBoundingClientRect();
        dragState.isDragging = true;
        dragState.pointerId = event.pointerId;
        dragState.offsetX = event.clientX - floatBounds.left;
        dragState.offsetY = event.clientY - floatBounds.top;
        moveFloat(floatBounds.left, floatBounds.top);
        mikoFloat.classList.add("is-dragging");
        dragGrip.setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    function dragFloat(event) {
        if (!dragState.isDragging || event.pointerId !== dragState.pointerId) {
            return;
        }

        moveFloat(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
    }

    function stopDragging(event) {
        if (!dragState.isDragging || event.pointerId !== dragState.pointerId) {
            return;
        }

        dragState.isDragging = false;
        dragState.pointerId = null;
        mikoFloat.classList.remove("is-dragging");

        if (dragGrip.hasPointerCapture(event.pointerId)) {
            dragGrip.releasePointerCapture(event.pointerId);
        }
    }

    function moveFloatWithKeyboard(event) {
        const movementByKey = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1]
        };
        const direction = movementByKey[event.key];

        if (!direction) {
            return;
        }

        const floatBounds = mikoFloat.getBoundingClientRect();
        const distance = event.shiftKey ? 32 : 12;
        moveFloat(
            floatBounds.left + direction[0] * distance,
            floatBounds.top + direction[1] * distance
        );
        event.preventDefault();
    }

    dragGrip.addEventListener("pointerdown", startDragging);
    dragGrip.addEventListener("pointermove", dragFloat);
    dragGrip.addEventListener("pointerup", stopDragging);
    dragGrip.addEventListener("pointercancel", stopDragging);
    dragGrip.addEventListener("lostpointercapture", stopDragging);
    dragGrip.addEventListener("keydown", moveFloatWithKeyboard);

    window.addEventListener("resize", () => {
        if (!mikoFloat.style.left) {
            return;
        }

        const floatBounds = mikoFloat.getBoundingClientRect();
        moveFloat(floatBounds.left, floatBounds.top);
    });

    drawMiko(false);

    if (!shouldReduceMotion) {
        window.setInterval(() => {
            if (document.hidden) {
                return;
            }

            drawMiko(true);
            window.setTimeout(() => drawMiko(false), 130);
        }, 2300);

    }
}());
