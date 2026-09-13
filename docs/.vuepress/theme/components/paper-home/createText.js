import gsap from 'gsap'

// 纸墨线稿风的立体字：纸色字身 + 墨色描边 + 硬阴影，逐字翻转进场。
// 内容是屏幕空间 DOM，和镜头状态机（cameraRig）通过 showText(name) 同步切换。
// 换字体：设置 CSS 变量 --ph-font 即可。
const TEXT_STYLE = `
  .ph-text-layer { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1; }
  .ph-slot { position: absolute; perspective: 700px; }
  .ph-slot-home { top: 13%; left: 50%; transform: translateX(-50%); text-align: center; }
  .ph-slot-floor-1 { right: 5%; top: 40%; transform: translateY(-50%); text-align: right; }
  .ph-slot-floor-2 { left: 5%; top: 40%; transform: translateY(-50%); text-align: left; }
  .ph-slot-floor-3 { right: 5%; top: 62%; transform: translateY(-50%); text-align: right; }
  .ph-slot-floor-4 { left: 50%; bottom: 8%; transform: translateX(-50%); text-align: center; }
  .ph-inner { transform-style: preserve-3d; }
  .ph-line { transform-style: preserve-3d; white-space: nowrap; }
  .ph-line + .ph-line { margin-top: 30px; }
  .ph-char { display: inline-block; transform-style: preserve-3d; backface-visibility: hidden; will-change: transform, opacity; }
  .ph-char-face { display: inline-block; }
  .ph-sub { margin-top: 14px; font: 700 17px/1.4 var(--ph-font, "Microsoft YaHei", sans-serif); color: #2a2622; letter-spacing: .04em; }
  .ph-line.ph-3d-big { transform: rotate(-3deg); }
  .ph-line.ph-3d-note { transform: rotate(-2deg); }
  .ph-slot-home .ph-line { transform: rotate(-3deg); }
  .ph-3d-big .ph-char-face {
    font: 900 clamp(46px, 6.8vw, 92px)/1.02 var(--ph-font, "Microsoft YaHei", "PingFang SC", sans-serif);
    color: #f3ece1; letter-spacing: .01em;
    text-shadow:
      -3px -3px 0 #2a2622, 0 -3px 0 #2a2622, 3px -3px 0 #2a2622,
      -3px 0 0 #2a2622, 3px 0 0 #2a2622,
      -3px 3px 0 #2a2622, 0 3px 0 #2a2622, 3px 3px 0 #2a2622,
      10px 11px 0 rgba(42, 38, 34, .85);
  }
  .ph-3d-note .ph-char-face {
    font: 900 clamp(26px, 2.9vw, 46px)/1.06 var(--ph-font, "Microsoft YaHei", "PingFang SC", sans-serif);
    color: #f3ece1; letter-spacing: .01em;
    text-shadow:
      -2px -2px 0 #2a2622, 0 -2px 0 #2a2622, 2px -2px 0 #2a2622,
      -2px 0 0 #2a2622, 2px 0 0 #2a2622,
      -2px 2px 0 #2a2622, 0 2px 0 #2a2622, 2px 2px 0 #2a2622,
      6px 7px 0 rgba(42, 38, 34, .8);
  }
  .ph-3d-note-lg .ph-char-face { font-size: clamp(28.6px, 3.19vw, 50.6px); }
  .ph-3d-sub .ph-char-face { font-size: clamp(30px, 4vw, 58px); }
`

// 每个镜头状态对应一块文字；没配的状态就隐藏。加楼层在这里补一条即可。
// lines 里的每一行都是同款纸墨立体字，只是字号不同；sub 是楼层里的小号 URL。
const TEXT_STATES = {
  home: {
    slot: 'ph-slot-home',
    lines: [
      { text: '你好，我是白银三清', cls: 'ph-3d-big' },
      { text: '欢迎来到我的博客', cls: 'ph-3d-note ph-3d-sub' },
    ],
  },
  floor_1: {
    slot: 'ph-slot-floor-1',
    lines: [{ text: '这是我的 GitHub', cls: 'ph-3d-note' }],
    sub: 'github.com/bysq-2006',
  },
  floor_2: {
    slot: 'ph-slot-floor-2',
    lines: [{ text: '测试测试测试测试', cls: 'ph-3d-note ph-3d-note-lg' }],
  },
  floor_3: {
    slot: 'ph-slot-floor-3',
    lines: [{ text: '测试测试测试测试', cls: 'ph-3d-note ph-3d-note-lg' }],
  },
  floor_4: {
    slot: 'ph-slot-floor-4',
    lines: [{ text: '测试测试测试测试', cls: 'ph-3d-note ph-3d-note-lg' }],
  },
}

const charsHTML = (text) => [...text]
  .map((ch) => `<span class="ph-char"><span class="ph-char-face">${ch === ' ' ? '&nbsp;' : ch}</span></span>`)
  .join('')

export function createTextLayer(el) {
  const style = document.createElement('style')
  style.textContent = TEXT_STYLE
  document.head.appendChild(style)

  const layer = document.createElement('div')
  layer.className = 'ph-text-layer'
  el.appendChild(layer)

  const slots = {}
  for (const [name, cfg] of Object.entries(TEXT_STATES)) {
    const slot = document.createElement('div')
    slot.className = `ph-slot ${cfg.slot}`
    const inner = document.createElement('div')
    inner.className = 'ph-inner'
    inner.innerHTML = cfg.lines
      .map((line) => `<div class="ph-line ${line.cls}">${charsHTML(line.text)}</div>`)
      .join('')
      + (cfg.sub ? `<div class="ph-sub">${cfg.sub}</div>` : '')
    slot.appendChild(inner)
    layer.appendChild(slot)
    slots[name] = {
      inner,
      chars: inner.querySelectorAll('.ph-char'),
      sub: inner.querySelector('.ph-sub'),
    }
    gsap.set(inner, { autoAlpha: 0 })
  }

  let active = null
  // dir: 滚轮方向。>0 向下滚（去更深的楼层）：旧文字向上滑出、新文字从下方滑入；<0 反之。
  const showText = (name, dir = 0) => {
    if (active === name) return
    const prev = active ? slots[active] : null
    active = name
    const shift = dir === 0 ? 0 : dir * window.innerHeight * 0.22
    if (prev) {
      gsap.killTweensOf([prev.inner, prev.chars, prev.sub].filter(Boolean))
      gsap.to(prev.chars, { rotationX: 90, autoAlpha: 0, transformOrigin: '50% 100%', duration: 0.32, ease: 'power2.in', stagger: 0.025 })
      if (prev.sub) gsap.to(prev.sub, { autoAlpha: 0, duration: 0.2 })
      gsap.to(prev.inner, {
        y: -shift,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => gsap.set(prev.inner, { autoAlpha: 0, y: 0 }),
      })
    }
    const next = slots[name]
    if (!next) return
    gsap.killTweensOf([next.inner, next.chars, next.sub].filter(Boolean))
    gsap.set(next.inner, { autoAlpha: 1, y: shift })
    gsap.to(next.inner, { y: 0, duration: 0.6, ease: 'power2.out' })
    gsap.fromTo(next.chars,
      { rotationX: -90, rotation: () => gsap.utils.random(-12, 12), scale: 0.75, autoAlpha: 0, transformOrigin: '50% 100%' },
      {
        rotationX: 0,
        rotation: () => gsap.utils.random(-3, 3),
        scale: 1,
        autoAlpha: 1,
        duration: 0.55,
        ease: 'back.out(2.2)',
        stagger: 0.05,
        delay: 0.06,
      },
    )
    if (next.sub) {
      gsap.fromTo(next.sub,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, delay: 0.1 + next.chars.length * 0.06 },
      )
    }
  }

  return {
    showText,
    dispose() {
      gsap.killTweensOf(layer.querySelectorAll('*'))
      layer.remove()
      style.remove()
    },
  }
}
