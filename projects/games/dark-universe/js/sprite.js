
window.Sprite = (() => {
  const LAYOUT = {
  "sheet": "assets/pennywise-sheet.webp",
  "meta": {
    "source": "custom non-uniform row map for current pennywise-sheet.png",
    "sheetWidth": 1365,
    "sheetHeight": 2048,
    "notes": [
      "Uses full-width row segments instead of a uniform grid.",
      "Built to avoid horizontal bleed into adjacent frames.",
      "Bottom anchored for torso-cropped portrait animation."
    ]
  },
  "animations": {
    "idle": {
      "fps": 8,
      "loop": true,
      "frames": [
        {
          "x": 0,
          "y": 38,
          "w": 191,
          "h": 187,
          "anchorX": 95.5,
          "anchorY": 179
        },
        {
          "x": 191,
          "y": 38,
          "w": 172,
          "h": 187,
          "anchorX": 86.0,
          "anchorY": 179
        },
        {
          "x": 363,
          "y": 38,
          "w": 163,
          "h": 187,
          "anchorX": 81.5,
          "anchorY": 179
        },
        {
          "x": 526,
          "y": 38,
          "w": 167,
          "h": 187,
          "anchorX": 83.5,
          "anchorY": 179
        },
        {
          "x": 693,
          "y": 38,
          "w": 167,
          "h": 187,
          "anchorX": 83.5,
          "anchorY": 179
        },
        {
          "x": 860,
          "y": 38,
          "w": 171,
          "h": 187,
          "anchorX": 85.5,
          "anchorY": 179
        },
        {
          "x": 1031,
          "y": 38,
          "w": 164,
          "h": 187,
          "anchorX": 82.0,
          "anchorY": 179
        },
        {
          "x": 1195,
          "y": 38,
          "w": 170,
          "h": 187,
          "anchorX": 85.0,
          "anchorY": 179
        }
      ]
    },
    "laugh": {
      "fps": 9,
      "loop": true,
      "frames": [
        {
          "x": 0,
          "y": 248,
          "w": 186,
          "h": 200,
          "anchorX": 93.0,
          "anchorY": 192
        },
        {
          "x": 186,
          "y": 248,
          "w": 183,
          "h": 200,
          "anchorX": 91.5,
          "anchorY": 192
        },
        {
          "x": 369,
          "y": 248,
          "w": 171,
          "h": 200,
          "anchorX": 85.5,
          "anchorY": 192
        },
        {
          "x": 540,
          "y": 248,
          "w": 170,
          "h": 200,
          "anchorX": 85.0,
          "anchorY": 192
        },
        {
          "x": 710,
          "y": 248,
          "w": 166,
          "h": 200,
          "anchorX": 83.0,
          "anchorY": 192
        },
        {
          "x": 876,
          "y": 248,
          "w": 167,
          "h": 200,
          "anchorX": 83.5,
          "anchorY": 192
        },
        {
          "x": 1043,
          "y": 248,
          "w": 139,
          "h": 200,
          "anchorX": 69.5,
          "anchorY": 192
        },
        {
          "x": 1182,
          "y": 248,
          "w": 183,
          "h": 200,
          "anchorX": 91.5,
          "anchorY": 192
        }
      ]
    },
    "attack": {
      "fps": 12,
      "loop": false,
      "frames": [
        {
          "x": 0,
          "y": 476,
          "w": 198,
          "h": 189,
          "anchorX": 99.0,
          "anchorY": 181
        },
        {
          "x": 198,
          "y": 476,
          "w": 170,
          "h": 189,
          "anchorX": 85.0,
          "anchorY": 181
        },
        {
          "x": 368,
          "y": 476,
          "w": 170,
          "h": 189,
          "anchorX": 85.0,
          "anchorY": 181
        },
        {
          "x": 538,
          "y": 476,
          "w": 171,
          "h": 189,
          "anchorX": 85.5,
          "anchorY": 181
        },
        {
          "x": 709,
          "y": 476,
          "w": 166,
          "h": 189,
          "anchorX": 83.0,
          "anchorY": 181
        },
        {
          "x": 875,
          "y": 476,
          "w": 164,
          "h": 189,
          "anchorX": 82.0,
          "anchorY": 181
        },
        {
          "x": 1039,
          "y": 476,
          "w": 164,
          "h": 189,
          "anchorX": 82.0,
          "anchorY": 181
        },
        {
          "x": 1203,
          "y": 476,
          "w": 162,
          "h": 189,
          "anchorX": 81.0,
          "anchorY": 181
        }
      ]
    },
    "hit": {
      "fps": 10,
      "loop": false,
      "frames": [
        {
          "x": 0,
          "y": 687,
          "w": 214,
          "h": 197,
          "anchorX": 107.0,
          "anchorY": 189
        },
        {
          "x": 214,
          "y": 687,
          "w": 172,
          "h": 197,
          "anchorX": 86.0,
          "anchorY": 189
        },
        {
          "x": 386,
          "y": 687,
          "w": 172,
          "h": 197,
          "anchorX": 86.0,
          "anchorY": 189
        },
        {
          "x": 558,
          "y": 687,
          "w": 168,
          "h": 197,
          "anchorX": 84.0,
          "anchorY": 189
        },
        {
          "x": 726,
          "y": 687,
          "w": 170,
          "h": 197,
          "anchorX": 85.0,
          "anchorY": 189
        },
        {
          "x": 896,
          "y": 687,
          "w": 175,
          "h": 197,
          "anchorX": 87.5,
          "anchorY": 189
        },
        {
          "x": 1071,
          "y": 687,
          "w": 294,
          "h": 197,
          "anchorX": 147.0,
          "anchorY": 189
        }
      ]
    },
    "phase_shift": {
      "fps": 9,
      "loop": false,
      "frames": [
        {
          "x": 0,
          "y": 913,
          "w": 229,
          "h": 201,
          "anchorX": 114.5,
          "anchorY": 193
        },
        {
          "x": 229,
          "y": 913,
          "w": 164,
          "h": 201,
          "anchorX": 82.0,
          "anchorY": 193
        },
        {
          "x": 393,
          "y": 913,
          "w": 180,
          "h": 201,
          "anchorX": 90.0,
          "anchorY": 193
        },
        {
          "x": 573,
          "y": 913,
          "w": 168,
          "h": 201,
          "anchorX": 84.0,
          "anchorY": 193
        },
        {
          "x": 741,
          "y": 913,
          "w": 170,
          "h": 201,
          "anchorX": 85.0,
          "anchorY": 193
        },
        {
          "x": 911,
          "y": 913,
          "w": 174,
          "h": 201,
          "anchorX": 87.0,
          "anchorY": 193
        },
        {
          "x": 1085,
          "y": 913,
          "w": 280,
          "h": 201,
          "anchorX": 140.0,
          "anchorY": 193
        }
      ]
    },
    "taunt": {
      "fps": 8,
      "loop": true,
      "frames": [
        {
          "x": 0,
          "y": 1138,
          "w": 191,
          "h": 208,
          "anchorX": 95.5,
          "anchorY": 200
        },
        {
          "x": 191,
          "y": 1138,
          "w": 169,
          "h": 208,
          "anchorX": 84.5,
          "anchorY": 200
        },
        {
          "x": 360,
          "y": 1138,
          "w": 170,
          "h": 208,
          "anchorX": 85.0,
          "anchorY": 200
        },
        {
          "x": 530,
          "y": 1138,
          "w": 175,
          "h": 208,
          "anchorX": 87.5,
          "anchorY": 200
        },
        {
          "x": 705,
          "y": 1138,
          "w": 168,
          "h": 208,
          "anchorX": 84.0,
          "anchorY": 200
        },
        {
          "x": 873,
          "y": 1138,
          "w": 169,
          "h": 208,
          "anchorX": 84.5,
          "anchorY": 200
        },
        {
          "x": 1042,
          "y": 1138,
          "w": 158,
          "h": 208,
          "anchorX": 79.0,
          "anchorY": 200
        },
        {
          "x": 1200,
          "y": 1138,
          "w": 165,
          "h": 208,
          "anchorX": 82.5,
          "anchorY": 200
        }
      ]
    },
    "death_start": {
      "fps": 8,
      "loop": false,
      "frames": [
        {
          "x": 0,
          "y": 1392,
          "w": 206,
          "h": 175,
          "anchorX": 103.0,
          "anchorY": 165
        },
        {
          "x": 206,
          "y": 1392,
          "w": 196,
          "h": 175,
          "anchorX": 98.0,
          "anchorY": 165
        },
        {
          "x": 402,
          "y": 1392,
          "w": 208,
          "h": 175,
          "anchorX": 104.0,
          "anchorY": 165
        },
        {
          "x": 610,
          "y": 1392,
          "w": 194,
          "h": 175,
          "anchorX": 97.0,
          "anchorY": 165
        },
        {
          "x": 804,
          "y": 1392,
          "w": 193,
          "h": 175,
          "anchorX": 96.5,
          "anchorY": 165
        },
        {
          "x": 997,
          "y": 1392,
          "w": 368,
          "h": 175,
          "anchorX": 184.0,
          "anchorY": 165
        }
      ]
    },
    "death_mid": {
      "fps": 8,
      "loop": false,
      "frames": [
        {
          "x": 0,
          "y": 1630,
          "w": 265,
          "h": 147,
          "anchorX": 132.5,
          "anchorY": 137
        },
        {
          "x": 265,
          "y": 1630,
          "w": 297,
          "h": 147,
          "anchorX": 148.5,
          "anchorY": 137
        },
        {
          "x": 562,
          "y": 1630,
          "w": 320,
          "h": 147,
          "anchorX": 160.0,
          "anchorY": 137
        },
        {
          "x": 882,
          "y": 1630,
          "w": 483,
          "h": 147,
          "anchorX": 241.5,
          "anchorY": 137
        }
      ]
    },
    "death_end": {
      "fps": 8,
      "loop": false,
      "frames": [
        {
          "x": 0,
          "y": 1835,
          "w": 353,
          "h": 139,
          "anchorX": 176.5,
          "anchorY": 129
        },
        {
          "x": 353,
          "y": 1835,
          "w": 295,
          "h": 139,
          "anchorX": 147.5,
          "anchorY": 129
        },
        {
          "x": 648,
          "y": 1835,
          "w": 324,
          "h": 139,
          "anchorX": 162.0,
          "anchorY": 129
        },
        {
          "x": 972,
          "y": 1835,
          "w": 393,
          "h": 139,
          "anchorX": 196.5,
          "anchorY": 129
        }
      ]
    }
  }
};

  let canvas = null;
  let ctx = null;
  let img = null;
  let imgReady = false;
  let currentAnim = "idle";
  let currentFrame = 0;
  let frameTimer = 0;
  let animationId = null;
  let lastTimestamp = 0;
  let onAnimEnd = null;
  let pendingAnim = null;
  let hitFlashFrames = 0;
  let shakeX = 0;
  let shakeY = 0;
  let shakeFrames = 0;
  let deadlightAlpha = 0;
  let deadlightDecay = 0;
  let scaleX = 1;
  let scaleY = 1;

  function init(canvasEl) {
    if (!canvasEl) {
      console.warn("[Sprite] Missing canvas element");
      return null;
    }
    if (animationId) stop();

    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    if (ctx) ctx.imageSmoothingEnabled = true;

    imgReady = false;
    img = new Image();
    img.onload = () => {
      imgReady = true;
      resizeCanvas();
      draw();
      play("idle");
    };
    img.onerror = () => console.warn("[Sprite] Failed to load sprite sheet");
    img.src = LAYOUT.sheet + "?v=13";
    window.addEventListener("resize", resizeCanvas);
    return img;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const wrap = canvas.parentElement || canvas;
    const dpr = window.devicePixelRatio || 1;
    const W = wrap.clientWidth || 400;
    const H = wrap.clientHeight || 400;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
  }

  function getAnim(name) {
    return LAYOUT.animations[name] || LAYOUT.animations.idle;
  }

  function getFrame(animName, frameIndex) {
    const anim = getAnim(animName);
    return anim.frames[Math.max(0, Math.min(frameIndex, anim.frames.length - 1))];
  }

  function play(name, opts = {}) {
    const current = getAnim(currentAnim);
    if (!current.loop && currentAnim !== name && currentFrame < current.frames.length - 1 && name !== "hit" && name !== "death") {
      pendingAnim = { name, opts };
      return;
    }

    currentAnim = name;
    currentFrame = 0;
    frameTimer = 0;
    onAnimEnd = opts.onEnd || null;

    if (!animationId) {
      lastTimestamp = 0;
      animationId = requestAnimationFrame(tick);
    }
  }

  function playOnce(name, callback) {
    play(name, { onEnd: callback });
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function tick(ts) {
    animationId = requestAnimationFrame(tick);
    const dt = lastTimestamp ? Math.min((ts - lastTimestamp) / 1000, 0.1) : 0;
    lastTimestamp = ts;

    const anim = getAnim(currentAnim);
    frameTimer += dt;
    const frameDur = 1 / (anim.fps || 10);

    while (frameTimer >= frameDur) {
      frameTimer -= frameDur;
      currentFrame++;

      if (currentFrame >= anim.frames.length) {
        if (anim.loop) {
          currentFrame = 0;
        } else {
          currentFrame = anim.frames.length - 1;
          const cb = onAnimEnd;
          onAnimEnd = null;
          if (cb) cb();

          if (pendingAnim) {
            const p = pendingAnim;
            pendingAnim = null;
            play(p.name, p.opts);
          } else {
            setTimeout(() => {
              if (currentAnim !== "idle") play("idle");
            }, 140);
          }
          break;
        }
      }
    }

    if (hitFlashFrames > 0) hitFlashFrames--;
    if (shakeFrames > 0) {
      shakeFrames--;
      shakeX = (Math.random() - 0.5) * 4 * (shakeFrames / 8);
      shakeY = (Math.random() - 0.5) * 3 * (shakeFrames / 8);
    } else {
      shakeX = 0;
      shakeY = 0;
    }

    if (deadlightAlpha > 0) {
      deadlightAlpha = Math.max(0, deadlightAlpha - deadlightDecay);
    }

    draw();
  }

  function draw() {
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    if (!imgReady) return;

    const frame = getFrame(currentAnim, currentFrame);

    const baseScale = Math.min(W / frame.w, H / frame.h) * 0.68;
    const drawW = frame.w * baseScale * scaleX;
    const drawH = frame.h * baseScale * scaleY;

    const screenAnchorX = W * 0.5;
    const screenAnchorY = H - 18;
    const anchorX = (frame.anchorX || frame.w / 2) * baseScale * scaleX;
    const anchorY = (frame.anchorY || frame.h) * baseScale * scaleY;

    const dx = screenAnchorX - anchorX + shakeX;
    const dy = screenAnchorY - anchorY + shakeY;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, dx, dy, drawW, drawH);

    if (hitFlashFrames > 0) {
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(255,255,255,${(hitFlashFrames / 8) * 0.65})`;
      ctx.fillRect(dx, dy, drawW, drawH);
      ctx.globalCompositeOperation = "source-over";
    }

    if (deadlightAlpha > 0) {
      const eyeLX = dx + drawW * 0.38;
      const eyeRX = dx + drawW * 0.58;
      const eyeY = dy + drawH * 0.28;
      [eyeLX, eyeRX].forEach((ex) => {
        const g = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, drawW * 0.22);
        g.addColorStop(0, `rgba(255,180,20,${deadlightAlpha * 0.7})`);
        g.addColorStop(0.35, `rgba(255,80,0,${deadlightAlpha * 0.22})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
    }

    ctx.restore();
  }

  function triggerHit() {
    hitFlashFrames = 8;
    shakeFrames = 8;
    playOnce("hit", () => play("idle"));
  }

  function triggerAttack(onEnd) {
    playOnce("attack", onEnd || (() => play("idle")));
  }

  function triggerPhaseShift(onEnd) {
    playOnce("phase_shift", onEnd);
  }

  function triggerDeath(onEnd) {
    // chain through the 3 death rows
    playOnce("death_start", () => {
      playOnce("death_mid", () => {
        playOnce("death_end", onEnd || (() => {}));
      });
    });
  }

  function triggerDeadlight() {
    deadlightAlpha = 1.0;
    deadlightDecay = 0.025;
  }

  function setScale(x, y) {
    scaleX = x;
    scaleY = y;
  }

  function resetScale() {
    scaleX = 1;
    scaleY = 1;
  }

  function getState() {
    return { anim: currentAnim, frame: currentFrame, ready: imgReady };
  }

  return {
    init,
    resizeCanvas,
    play,
    playOnce,
    stop,
    draw,
    triggerHit,
    triggerAttack,
    triggerPhaseShift,
    triggerDeath,
    triggerDeadlight,
    setScale,
    resetScale,
    getState
  };
})();
