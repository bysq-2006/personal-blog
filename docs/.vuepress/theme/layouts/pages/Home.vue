<template>
  <ParentLayout>
    <template #page>
      <div class="home-container">

        <!-- ── HERO ────────────────────────────────── -->
        <section id="hero" ref="heroRef" @mousemove="handleMouseMove">

          <!-- Grid texture -->
          <div class="grid-texture" />

          <!-- Left: SVG Bookshelf -->
          <div class="hero-left">
            <!-- Ambient glow -->
            <div
              class="ambient-glow"
              :style="{
                transform: `translate(${(mouse.x - 0.5) * -12}px, ${(mouse.y - 0.5) * -8}px)`
              }"
            />
            <div
              class="bookshelf-wrap"
              :style="{
                transform: `translate(${(mouse.x - 0.5) * 8}px, ${(mouse.y - 0.5) * 5}px)`
              }"
            >
              <svg viewBox="0 0 310 460" width="380" class="bookshelf-svg">
                <!-- Shelf frame -->
                <g>
                  <rect x="58"  y="72"  width="194" height="330" rx="2" fill="oklch(88% 0.025 75)" />
                  <rect x="56"  y="68"  width="14"  height="336" rx="2" fill="oklch(72% 0.06 60)" />
                  <rect x="240" y="68"  width="14"  height="336" rx="2" fill="oklch(68% 0.055 60)" />
                  <rect x="52"  y="64"  width="206" height="12"  rx="2" fill="oklch(76% 0.065 60)" />
                  <rect v-for="(y, i) in [162, 274, 378, 402]" :key="i"
                    x="62" :y="y" width="186" height="10" rx="1" fill="oklch(72% 0.06 60)" />
                  <rect x="48" y="400" width="214" height="10" rx="2" fill="oklch(76% 0.065 60)" />
                  <rect x="66" y="408" width="178" height="8"  rx="2" fill="oklch(70% 0.058 60)" />
                </g>

                <!-- Books -->
                <g>
                  <g v-for="(b, i) in books" :key="i">
                    <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h"
                      rx="1" :fill="b.color" opacity="0.88" />
                    <rect :x="b.x + 1" :y="b.y + 4" :width="b.w - 2" height="1"
                      fill="white" opacity="0.15" />
                    <rect :x="b.x + 1" :y="b.y + b.h - 8" :width="b.w - 2" height="1"
                      fill="black" opacity="0.1" />
                    <rect v-if="b.title"
                      :x="b.x + 3" :y="b.y + 12" :width="b.w - 6" height="40"
                      fill="white" opacity="0.12" rx="1" />
                  </g>
                </g>

                <!-- Decorative objects -->
                <g>
                  <!-- Coffee cup -->
                  <g transform="translate(208, 352)">
                    <ellipse cx="14" cy="22" rx="12" ry="4" fill="oklch(78% 0.04 70)" />
                    <rect x="2" y="8" width="24" height="14" rx="4" fill="oklch(82% 0.03 70)" />
                    <ellipse cx="14" cy="8" rx="12" ry="4" fill="oklch(86% 0.03 70)" />
                    <ellipse cx="14" cy="8" rx="8" ry="2.5" fill="oklch(35% 0.06 42)" />
                    <path d="M 26 12 Q 32 14 26 18" stroke="oklch(78% 0.04 70)" stroke-width="2" fill="none" />
                  </g>

                  <!-- Plant -->
                  <g transform="translate(206, 125)">
                    <rect x="6" y="20" width="16" height="12" rx="2" fill="oklch(55% 0.1 42)" />
                    <ellipse cx="14" cy="18" rx="9" ry="7" fill="oklch(55% 0.13 162)" />
                    <ellipse cx="8"  cy="14" rx="6" ry="5" fill="oklch(60% 0.11 162)" />
                    <ellipse cx="18" cy="16" rx="5" ry="4" fill="oklch(58% 0.12 162)" />
                    <line x1="14" y1="18" x2="14" y2="21" stroke="oklch(40% 0.1 110)" stroke-width="1.5" />
                  </g>

                  <!-- Glasses -->
                  <g transform="translate(64, 264)">
                    <circle cx="8"  cy="10" r="7" stroke="oklch(45% 0 0)" stroke-width="1.5" fill="none" />
                    <circle cx="22" cy="10" r="7" stroke="oklch(45% 0 0)" stroke-width="1.5" fill="none" />
                    <line x1="1"  y1="8" x2="-2" y2="6" stroke="oklch(45% 0 0)" stroke-width="1.5" />
                    <line x1="29" y1="8" x2="32" y2="6" stroke="oklch(45% 0 0)" stroke-width="1.5" />
                    <circle cx="8"  cy="10" r="7" fill="oklch(70% 0.02 220)" opacity="0.3" />
                    <circle cx="22" cy="10" r="7" fill="oklch(70% 0.02 220)" opacity="0.3" />
                  </g>
                </g>

                <!-- Floating elements -->
                <g :transform="`translate(${px * 1.8}, ${py * 1.4})`">
                  <!-- Bookmark -->
                  <g class="float-a">
                    <rect x="270" y="110" width="12" height="40" rx="1" fill="var(--terra)" opacity="0.8" />
                    <polygon points="270,150 282,150 276,158" fill="var(--terra)" opacity="0.8" />
                  </g>
                  <!-- Pen -->
                  <g class="float-b" transform="translate(20, 45) rotate(-25, 16, 16)">
                    <rect x="10" y="5" width="6" height="32" rx="3" fill="oklch(40% 0 0)" />
                    <polygon points="10,37 16,48 22,37" fill="oklch(55% 0.12 42)" />
                    <rect x="10" y="5" width="6" height="6" rx="3" fill="oklch(65% 0.12 42)" />
                  </g>
                  <!-- Star -->
                  <g class="float-c">
                    <text x="42" y="400" font-size="16" fill="var(--terra)" opacity="0.7">✦</text>
                  </g>
                  <!-- Leaf -->
                  <g class="float-a-slow">
                    <ellipse cx="288" cy="390" rx="6" ry="14"
                      fill="var(--sage)" opacity="0.6" transform="rotate(-30, 288, 390)" />
                    <line x1="288" y1="380" x2="288" y2="403"
                      stroke="oklch(40% 0.1 162)" stroke-width="1" opacity="0.5" />
                  </g>
                </g>
              </svg>
            </div>
          </div>

          <!-- Right: Copy -->
          <div class="hero-right">
            <div class="hero-eyebrow">Welcome to my little space</div>
            <h1 class="hero-title">
              A reader,<br />
              a <em>tinkerer</em>,<br />
              a wanderer.
            </h1>
            <span class="hero-typewriter">
              {{ displayed }}<span class="cursor" />
            </span>
            <div class="hero-cta">
              <a href="#about" class="btn-primary">了解我</a>
              <router-link to="/article/" class="btn-secondary">
                浏览文章 <span class="arrow">→</span>
              </router-link>
            </div>
          </div>

          <!-- Scroll hint -->
          <div class="scroll-hint">
            <span class="scroll-label">scroll</span>
            <div class="scroll-line" />
          </div>
        </section>

        <!-- ── ABOUT ───────────────────────────────── -->
        <section id="about" class="about-section">
          <div class="about-grid scroll-reveal" :class="{ visible: aboutVisible }">
            <div>
              <div class="about-label">About</div>
              <h2 class="about-title">
                Hi, I'm here<br />reading &amp; building.
              </h2>
              <p class="about-body">
                一个喜欢读书、折腾代码、偶尔思考的普通人。这里是我的数字角落——记录读过的书、用过的工具、走过的弯路，还有一些不知道怎么归类的碎碎念。
              </p>
              <p class="about-body">
                平时写写 TypeScript，调调 CSS，研究一些没什么用但很有趣的东西。相信好的文字和好的代码一样，都应该让人读起来舒服。
              </p>
              <div class="about-tags">
                <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
              </div>
            </div>

            <div>
              <div class="about-stats">
                <div v-for="s in stats" :key="s.label" class="stat-cell">
                  <div class="stat-num">{{ s.num }}<span>{{ s.unit }}</span></div>
                  <div class="stat-label">{{ s.label }}</div>
                </div>
              </div>
              <div class="about-quote">
                <p class="quote-text">"The more that you read, the more things you will know."</p>
                <p class="quote-author">— Dr. Seuss</p>
              </div>
            </div>
          </div>
        </section>

        <!-- ── GUITAR ──────────────────────────────── -->
        <section id="guitar" class="guitar-section">
          <div class="guitar-grid scroll-reveal" :class="{ visible: guitarVisible }">
            <!-- Left: Guitar SVG -->
            <div class="guitar-left">
              <div class="guitar-glow" />
              <svg viewBox="0 0 320 540" width="340" class="guitar-svg">
                <!-- Headstock (Strat-style: angled, 6-in-line tuners) -->
                <g>
                  <path d="
                    M 152 14
                    L 200 18
                    Q 210 24, 206 34
                    Q 200 44, 190 46
                    L 174 52
                    L 146 52
                    Z"
                    fill="oklch(38% 0.06 42)" />
                  <!-- 6 in-line tuning pegs -->
                  <g fill="oklch(86% 0.02 80)">
                    <circle cx="160" cy="24" r="2.4" />
                    <circle cx="170" cy="26" r="2.4" />
                    <circle cx="180" cy="28" r="2.4" />
                    <circle cx="188" cy="32" r="2.4" />
                    <circle cx="194" cy="38" r="2.4" />
                    <circle cx="196" cy="44" r="2.4" />
                  </g>
                </g>

                <!-- Nut -->
                <rect x="146" y="52" width="28" height="3.5" fill="oklch(88% 0.02 80)" />

                <!-- Neck (long, thin) -->
                <rect x="146" y="55" width="28" height="220" fill="oklch(42% 0.06 42)" />
                <!-- Frets -->
                <g stroke="oklch(80% 0.02 80)" stroke-width="0.9" opacity="0.85">
                  <line x1="146" y1="78"  x2="174" y2="78" />
                  <line x1="146" y1="100" x2="174" y2="100" />
                  <line x1="146" y1="122" x2="174" y2="122" />
                  <line x1="146" y1="144" x2="174" y2="144" />
                  <line x1="146" y1="166" x2="174" y2="166" />
                  <line x1="146" y1="188" x2="174" y2="188" />
                  <line x1="146" y1="210" x2="174" y2="210" />
                  <line x1="146" y1="232" x2="174" y2="232" />
                  <line x1="146" y1="254" x2="174" y2="254" />
                </g>
                <!-- Fret markers (Strat-style dots, on the side of the fretboard) -->
                <g fill="oklch(86% 0.02 80)" opacity="0.9">
                  <circle cx="160" cy="111" r="1.8" />
                  <circle cx="160" cy="155" r="1.8" />
                  <circle cx="160" cy="199" r="1.8" />
                  <circle cx="160" cy="243" r="1.8" />
                </g>

                <!-- Body shadow -->
                <path d="
                  M 146 278
                  L 174 278
                  Q 198 280, 218 300
                  Q 244 326, 246 366
                  Q 248 416, 232 458
                  Q 210 502, 160 504
                  Q 110 502, 88 458
                  Q 72 416, 74 366
                  Q 76 326, 102 300
                  Q 122 280, 146 278 Z"
                  fill="oklch(50% 0.07 42)" opacity="0.18"
                  transform="translate(3, 6)" />

                <!-- Body: Stratocaster, no upper horns sticking up -->
                <!--
                  Smooth contour: neck joins at top center (y≈275),
                  body widens gently outward to maximum width at the lower bout (y≈420),
                  then curves back to bottom (y≈500).
                -->
                <path d="
                  M 146 275
                  L 174 275
                  Q 196 278, 216 298
                  Q 240 322, 242 360
                  Q 244 410, 228 454
                  Q 208 498, 160 500
                  Q 112 498, 92 454
                  Q 76 410, 78 360
                  Q 80 322, 104 298
                  Q 124 278, 146 275 Z"
                  fill="var(--terra)" />

                <!-- Inner shading (single flat darker shape) -->
                <path d="
                  M 148 286
                  L 172 286
                  Q 192 290, 208 306
                  Q 230 326, 232 360
                  Q 234 406, 220 446
                  Q 202 486, 160 488
                  Q 118 486, 100 446
                  Q 86 406, 88 360
                  Q 90 326, 112 306
                  Q 128 290, 148 286 Z"
                  fill="oklch(62% 0.14 30)" opacity="0.38" />

                <!-- Pickguard (Strat 3-ply shape, follows body curves) -->
                <path d="
                  M 148 290
                  L 172 290
                  Q 188 294, 200 308
                  Q 212 322, 210 344
                  Q 208 372, 212 408
                  Q 214 444, 192 466
                  Q 174 478, 160 478
                  Q 146 478, 128 466
                  Q 106 444, 108 408
                  Q 112 372, 110 344
                  Q 108 322, 120 308
                  Q 132 294, 148 290 Z"
                  fill="oklch(94% 0.01 80)" />
                <path d="
                  M 148 290
                  L 172 290
                  Q 188 294, 200 308
                  Q 212 322, 210 344
                  Q 208 372, 212 408
                  Q 214 444, 192 466
                  Q 174 478, 160 478
                  Q 146 478, 128 466
                  Q 106 444, 108 408
                  Q 112 372, 110 344
                  Q 108 322, 120 308
                  Q 132 294, 148 290 Z"
                  fill="none" stroke="oklch(28% 0.02 40)" stroke-width="0.8" opacity="0.7" />

                <!-- 3 single-coil pickups: neck / middle / bridge (bridge slanted) -->
                <g>
                  <!-- Neck pickup -->
                  <rect x="140" y="316" width="40" height="9" rx="1.5"
                    fill="oklch(96% 0.005 80)" stroke="oklch(28% 0.02 40)" stroke-width="0.6" />
                  <g fill="oklch(28% 0.02 40)">
                    <circle cx="146" cy="320.5" r="0.9" /><circle cx="153" cy="320.5" r="0.9" />
                    <circle cx="160" cy="320.5" r="0.9" /><circle cx="167" cy="320.5" r="0.9" />
                    <circle cx="174" cy="320.5" r="0.9" />
                  </g>
                  <!-- Middle pickup -->
                  <rect x="140" y="358" width="40" height="9" rx="1.5"
                    fill="oklch(96% 0.005 80)" stroke="oklch(28% 0.02 40)" stroke-width="0.6" />
                  <g fill="oklch(28% 0.02 40)">
                    <circle cx="146" cy="362.5" r="0.9" /><circle cx="153" cy="362.5" r="0.9" />
                    <circle cx="160" cy="362.5" r="0.9" /><circle cx="167" cy="362.5" r="0.9" />
                    <circle cx="174" cy="362.5" r="0.9" />
                  </g>
                  <!-- Bridge pickup (slanted) -->
                  <rect x="138" y="402" width="44" height="9" rx="1.5"
                    fill="oklch(96% 0.005 80)" stroke="oklch(28% 0.02 40)" stroke-width="0.6"
                    transform="rotate(-9, 160, 406.5)" />
                </g>

                <!-- 5-way selector switch -->
                <g transform="translate(192, 392)">
                  <rect x="-2" y="-2" width="4" height="14" rx="1" fill="oklch(28% 0.02 40)" />
                  <circle cx="0" cy="-4" r="2.4" fill="oklch(94% 0.005 80)"
                    stroke="oklch(28% 0.02 40)" stroke-width="0.6" />
                </g>

                <!-- 1 volume + 2 tone knobs in a diagonal line (Strat layout) -->
                <g>
                  <circle cx="184" cy="408" r="4.6" fill="oklch(94% 0.005 80)"
                    stroke="oklch(28% 0.02 40)" stroke-width="0.6" />
                  <circle cx="192" cy="428" r="4.6" fill="oklch(94% 0.005 80)"
                    stroke="oklch(28% 0.02 40)" stroke-width="0.6" />
                  <circle cx="198" cy="448" r="4.6" fill="oklch(94% 0.005 80)"
                    stroke="oklch(28% 0.02 40)" stroke-width="0.6" />
                  <line x1="184" y1="403" x2="184" y2="408" stroke="oklch(28% 0.02 40)" stroke-width="1" />
                  <line x1="192" y1="423" x2="192" y2="428" stroke="oklch(28% 0.02 40)" stroke-width="1" />
                  <line x1="198" y1="443" x2="198" y2="448" stroke="oklch(28% 0.02 40)" stroke-width="1" />
                </g>

                <!-- Bridge: Strat synchronized tremolo plate + 6 saddles + tremolo arm -->
                <g>
                  <rect x="134" y="436" width="52" height="13" rx="1"
                    fill="oklch(82% 0.02 80)" />
                  <g fill="oklch(60% 0.02 80)">
                    <rect x="137" y="438" width="6" height="9" rx="0.5" />
                    <rect x="144" y="438" width="6" height="9" rx="0.5" />
                    <rect x="151" y="438" width="6" height="9" rx="0.5" />
                    <rect x="158" y="438" width="6" height="9" rx="0.5" />
                    <rect x="165" y="438" width="6" height="9" rx="0.5" />
                    <rect x="172" y="438" width="6" height="9" rx="0.5" />
                  </g>
                  <!-- Tremolo arm -->
                  <path d="M 142 449 Q 132 458, 124 478" stroke="oklch(82% 0.02 80)"
                    stroke-width="1.6" fill="none" stroke-linecap="round" />
                  <circle cx="124" cy="478" r="2.2" fill="oklch(82% 0.02 80)" />
                </g>

                <!-- Output jack on the lower side -->
                <circle cx="226" cy="430" r="4" fill="oklch(82% 0.02 80)" />
                <circle cx="226" cy="430" r="2" fill="oklch(28% 0.02 40)" />

                <!-- Strings (nut to bridge, gently fanning to match bridge spacing) -->
                <g stroke="oklch(88% 0.015 80)" stroke-width="0.8" opacity="0.9">
                  <line x1="148" y1="56" x2="140" y2="436" />
                  <line x1="152" y1="56" x2="148" y2="436" />
                  <line x1="156" y1="56" x2="156" y2="436" />
                  <line x1="164" y1="56" x2="164" y2="436" />
                  <line x1="168" y1="56" x2="172" y2="436" />
                  <line x1="172" y1="56" x2="180" y2="436" />
                </g>

                <!-- Floating notes -->
                <g class="note-float-a" fill="var(--terra)" opacity="0.75">
                  <text x="36" y="140" font-size="22" font-family="serif">♪</text>
                </g>
                <g class="note-float-b" fill="var(--sage)" opacity="0.7">
                  <text x="276" y="220" font-size="18" font-family="serif">♫</text>
                </g>
                <g class="note-float-c" fill="var(--terra)" opacity="0.6">
                  <text x="28" y="320" font-size="14" font-family="serif">♩</text>
                </g>
              </svg>
            </div>

            <!-- Right: Copy -->
            <div class="guitar-right">
              <div class="guitar-eyebrow">Off the keyboard</div>
              <h2 class="guitar-title">
                偶尔，<br />
                也<em>弹一弹</em>吉他。
              </h2>
              <p class="guitar-body">
                写代码写累了，会插上音箱、抓起电吉他随便扫几下。算不上专业——速弹跟不上、推弦也不够稳——但失真一开，整个人的烦躁能被一段 riff 吃掉大半。
              </p>
              <p class="guitar-body">
                最近在啃《华丽的友谊乐章》，左手切换有点跟不上，但每弹通一小段都很上头。
              </p>
              <div class="guitar-meta">
                <div class="meta-item">
                  <span class="meta-key">Now playing</span>
                  <span class="meta-val">《华丽的友谊乐章》</span>
                </div>
                <div class="meta-item">
                  <span class="meta-key">My guitar</span>
                  <span class="meta-val">Squier Stratocaster</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr class="divider" />

      </div>
    </template>
  </ParentLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ParentLayout from '../Layout/Layout.vue'

// ── Mouse parallax ──────────────────────────────
const heroRef = ref(null)
const mouse = ref({ x: 0.5, y: 0.5 })
const px = computed(() => (mouse.value.x - 0.5) * 18)
const py = computed(() => (mouse.value.y - 0.5) * 10)

const handleMouseMove = (e) => {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouse.value = {
    x: (e.clientX - rect.left) / rect.width,
    y: (e.clientY - rect.top) / rect.height,
  }
}

// ── Books data ──────────────────────────────────
const books = [
  // shelf 1
  { x: 74,  y: 88,  w: 18, h: 74, color: '#8B6952', title: true },
  { x: 94,  y: 102, w: 14, h: 60, color: '#4A5568' },
  { x: 110, y: 95,  w: 20, h: 67, color: '#744C3E' },
  { x: 132, y: 108, w: 12, h: 54, color: '#2D4A3E' },
  { x: 146, y: 100, w: 16, h: 62, color: '#8B7355' },
  { x: 164, y: 93,  w: 22, h: 69, color: '#5A4A6B' },
  { x: 188, y: 105, w: 14, h: 57, color: '#3D5A4F' },
  { x: 204, y: 98,  w: 18, h: 64, color: '#7D4E3A' },
  // shelf 2
  { x: 74,  y: 202, w: 20, h: 66, color: '#3E5A7D' },
  { x: 96,  y: 208, w: 14, h: 60, color: '#6B4E35' },
  { x: 112, y: 195, w: 18, h: 73, color: '#4A6B5A' },
  { x: 132, y: 205, w: 22, h: 63, color: '#744C4C' },
  { x: 156, y: 200, w: 16, h: 68, color: '#4C5E74' },
  { x: 174, y: 210, w: 12, h: 58, color: '#8B7040' },
  { x: 188, y: 202, w: 20, h: 66, color: '#5A3E6B' },
  // shelf 3
  { x: 74,  y: 316, w: 16, h: 62, color: '#4A5E4A' },
  { x: 92,  y: 308, w: 24, h: 70, color: '#7D5A3A' },
  { x: 118, y: 312, w: 14, h: 66, color: '#3A4A7D' },
  { x: 134, y: 320, w: 18, h: 58, color: '#6B4A3E' },
  { x: 154, y: 310, w: 22, h: 68, color: '#3E5A5A' },
  { x: 178, y: 318, w: 16, h: 60, color: '#744C6B' },
  { x: 196, y: 308, w: 20, h: 70, color: '#4A6B3E' },
]

// ── Typewriter ──────────────────────────────────
const typeLines = [
  '写代码，读闲书，煮一杯咖啡。',
  'Building things, reading books, brewing coffee.',
  '记录生活里值得留下的碎片。',
]
const displayed = ref('')
let tLineIdx = 0
let tCharIdx = 0
let tDeleting = false
let tTimer = null
const PAUSE_MS = 1600
const SPEED = 55

const tick = () => {
  const cur = typeLines[tLineIdx]
  if (!tDeleting) {
    if (tCharIdx < cur.length) {
      displayed.value = cur.slice(0, tCharIdx + 1)
      tCharIdx++
      tTimer = setTimeout(tick, SPEED + Math.random() * 30)
    } else {
      tTimer = setTimeout(() => { tDeleting = true; tick() }, PAUSE_MS)
    }
  } else {
    if (tCharIdx > 0) {
      displayed.value = cur.slice(0, tCharIdx - 1)
      tCharIdx--
      tTimer = setTimeout(tick, SPEED * 0.45)
    } else {
      tDeleting = false
      tLineIdx = (tLineIdx + 1) % typeLines.length
      tTimer = setTimeout(tick, 200)
    }
  }
}

// ── About data ──────────────────────────────────
const tags = ['读书', '写作', '前端开发', '摄影','rust', 'TypeScript', 'Linux']
const stats = [
  { num: '48',  unit: '+', label: '篇文章' },
  { num: '12',  unit: '',  label: '个项目' },
  { num: '200', unit: '+', label: '本书（已读）' },
  { num: '3',   unit: '',  label: '年持续更新' },
]

// ── Scroll reveal ───────────────────────────────
const aboutVisible = ref(false)
const guitarVisible = ref(false)
let observer = null

onMounted(() => {
  tTimer = setTimeout(tick, 900)

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        if (e.target.matches('#about .about-grid')) aboutVisible.value = true
        if (e.target.matches('#guitar .guitar-grid')) guitarVisible.value = true
      })
    }, { threshold: 0.15 })

    const aboutTarget = document.querySelector('#about .about-grid')
    if (aboutTarget) observer.observe(aboutTarget)
    const guitarTarget = document.querySelector('#guitar .guitar-grid')
    if (guitarTarget) observer.observe(guitarTarget)
  } else {
    aboutVisible.value = true
    guitarVisible.value = true
  }
})

onUnmounted(() => {
  if (tTimer) clearTimeout(tTimer)
  if (observer) observer.disconnect()
})
</script>

<style lang="scss" scoped>
// ── Tokens ─────────────────────────────────────
.home-container {
  --bg:          #f5f0e8;
  --bg2:         #ede8de;
  --ink:         #1a1a2e;
  --ink2:        #4a4a6a;
  --ink3:        #8a8aaa;
  --terra:       #b85c38;
  --terra-light: #f0d8cc;
  --sage:        #5a8a6a;
  --rule:        #ddd8ce;
}

.home-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: 'DM Sans', 'Inter', sans-serif;
  font-weight: 300;
  user-select: none;
}

// ── HERO ───────────────────────────────────────
#hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: 60px;
}

.grid-texture {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--rule) 1px, transparent 1px),
    linear-gradient(90deg, var(--rule) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

.hero-left {
  flex: 0 0 52%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.ambient-glow {
  position: absolute;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, oklch(88% 0.08 60 / 0.35) 0%, transparent 70%);
  transition: transform 0.12s ease-out;
  pointer-events: none;
}

.bookshelf-wrap {
  position: relative;
  transition: transform 0.1s ease-out;
  animation: driftIn 1.2s ease 0.1s both;
}

.bookshelf-svg {
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.12));
}

.hero-right {
  flex: 1;
  padding: 0 80px 0 40px;
  position: relative;
  z-index: 2;
}

.hero-eyebrow {
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terra);
  margin-bottom: 20px;
  opacity: 0;
  animation: fadeUp 0.8s ease 0.3s forwards;
}

.hero-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: clamp(42px, 5vw, 68px);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 0 0 24px;
  opacity: 0;
  animation: fadeUp 0.9s ease 0.5s forwards;

  em {
    font-style: italic;
    color: var(--terra);
  }
}

.hero-typewriter {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 300;
  color: var(--ink2);
  line-height: 1.7;
  min-height: 52px;
  margin-bottom: 36px;
  opacity: 0;
  animation: fadeUp 0.9s ease 0.7s forwards;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--terra);
  vertical-align: middle;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
}

.hero-cta {
  display: flex;
  gap: 20px;
  align-items: center;
  opacity: 0;
  animation: fadeUp 0.9s ease 0.9s forwards;
}

.btn-primary {
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--bg);
  background: var(--ink);
  padding: 12px 28px;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: var(--terra);
    transform: translateY(-1px);
    color: var(--bg);
  }
}

.btn-secondary {
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--ink2);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;

  .arrow { transition: transform 0.2s; }

  &:hover {
    color: var(--terra);
    .arrow { transform: translateX(4px); }
  }
}

// ── Scroll hint ────────────────────────────────
.scroll-hint {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 3;
  animation: scrollBob 2.5s ease-in-out infinite;
}

.scroll-label {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--ink3);
  text-transform: uppercase;
}

.scroll-line {
  width: 1px;
  height: 36px;
  background: linear-gradient(to bottom, var(--ink3), transparent);
}

// ── ABOUT ──────────────────────────────────────
.about-section {
  padding: 100px 80px 80px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.about-label {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terra);
  margin-bottom: 20px;
}

.about-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 24px;
  color: var(--ink);
}

.about-body {
  font-size: 15px;
  line-height: 1.85;
  color: var(--ink2);
  margin: 0 0 20px;
}

.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 28px;
}

.tag {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--ink2);
  background: var(--rule);
  padding: 5px 12px;
  border-radius: 2px;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--terra-light);
    color: var(--terra);
  }
}

.about-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--rule);
}

.stat-cell {
  background: var(--bg);
  padding: 32px 28px;
  transition: background 0.2s;

  &:hover { background: var(--bg2); }
}

.stat-num {
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1;
  margin-bottom: 6px;

  span {
    color: var(--terra);
    font-size: 28px;
  }
}

.stat-label {
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink3);
}

.about-quote {
  margin-top: 24px;
  padding: 20px 24px;
  background: var(--bg2);
  border-left: 2px solid var(--terra);
}

.quote-text {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 15px;
  color: var(--ink2);
  line-height: 1.7;
  margin: 0;
}

.quote-author {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--ink3);
  margin: 8px 0 0;
  letter-spacing: 0.06em;
}

.divider {
  max-width: 1100px;
  margin: 40px auto 0;
  border: none;
  border-top: 1px solid var(--rule);
}

// ── GUITAR ─────────────────────────────────────
.guitar-section {
  padding: 60px 80px 100px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.guitar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.guitar-left {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guitar-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, oklch(78% 0.1 60 / 0.28) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.guitar-svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 22px 40px rgba(0, 0, 0, 0.14));
}

.guitar-right {
  padding-right: 20px;
}

.guitar-eyebrow {
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--terra);
  margin-bottom: 20px;
}

.guitar-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.25;
  margin: 0 0 24px;
  color: var(--ink);

  em {
    font-style: italic;
    color: var(--terra);
  }
}

.guitar-body {
  font-size: 15px;
  line-height: 1.85;
  color: var(--ink2);
  margin: 0 0 16px;
}

.guitar-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 28px;
  padding: 18px 22px;
  background: var(--bg2);
  border-left: 2px solid var(--sage);
}

.meta-item {
  display: flex;
  align-items: baseline;
  gap: 14px;
  font-size: 13px;
}

.meta-key {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink3);
  min-width: 96px;
}

.meta-val {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  color: var(--ink2);
}

:deep(.note-float-a) {
  transform-origin: center;
  animation: noteFloatA 5s ease-in-out infinite;
}
:deep(.note-float-b) {
  animation: noteFloatB 6s ease-in-out 0.8s infinite;
}
:deep(.note-float-c) {
  animation: noteFloatA 4.5s ease-in-out 1.6s infinite;
}

@keyframes noteFloatA {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.75; }
  50%      { transform: translateY(-14px) rotate(6deg); opacity: 1; }
}
@keyframes noteFloatB {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
  50%      { transform: translateY(-10px) rotate(-5deg); opacity: 1; }
}

// ── Scroll reveal ──────────────────────────────
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

// ── Animations ─────────────────────────────────
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  50% { opacity: 0; }
}

@keyframes driftIn {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scrollBob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(-8px); }
}

// SVG element floats
:deep(.float-a) {
  transform-origin: center;
  animation: floatA 5s ease-in-out infinite;
}
:deep(.float-a-slow) {
  animation: floatA 7s ease-in-out 2s infinite;
}
:deep(.float-b) {
  animation: floatB 6s ease-in-out 0.5s infinite;
}
:deep(.float-c) {
  animation: floatC 4s ease-in-out 1s infinite;
}

@keyframes floatA {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-18px) rotate(3deg); }
}
@keyframes floatB {
  0%, 100% { transform: translate(20px, 45px) rotate(-25deg); }
  50%      { transform: translate(20px, 33px) rotate(-28deg); }
}
@keyframes floatC {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

// ── Dark mode ──────────────────────────────────
html.dark {
  .home-container {
    --bg:    #1e1a14;
    --bg2:   #2a2419;
    --ink:   #f0ebe0;
    --ink2:  #b0a898;
    --ink3:  #706860;
    --terra: #d4744e;
    --terra-light: #3a2418;
    --rule:  #2e2820;
  }

  .grid-texture { opacity: 0.22; }
}

// ── Responsive ─────────────────────────────────
@media (max-width: 900px) {
  #hero {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    padding: 100px 0 60px;
    gap: 40px;
  }

  .hero-left {
    flex: 0 0 auto;
  }

  .bookshelf-svg {
    width: 280px;
    height: auto;
  }

  .hero-right {
    padding: 0 32px;
    text-align: center;
  }

  .hero-cta {
    justify-content: center;
  }

  .scroll-hint { display: none; }

  .about-section {
    padding: 60px 32px;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .guitar-section {
    padding: 40px 32px 60px;
  }

  .guitar-grid {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }

  .guitar-svg {
    width: 260px;
    height: auto;
  }

  .guitar-right {
    padding-right: 0;
  }

  .meta-item {
    justify-content: center;
  }
}
</style>
