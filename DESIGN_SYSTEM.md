# VIPNumberWala Design System & UI Manifesto

This document is the single source of truth for every screen, every component, every animation, and every spacing decision in the "VIPNumberWala" project.

═══════════════════════════════════════════════════════════
## SECTION 1 — BRAND IDENTITY & EMOTIONAL DIRECTION
═══════════════════════════════════════════════════════════

### WHAT THIS BRAND MUST FEEL LIKE:
- **Exclusive**: Not for everyone. For people who understand the value of a powerful number.
- **Mystical but not superstitious**: Spiritual intelligence, not roadside astrology. Like a Rolls Royce of numerology.
- **Indian but globally premium**: Feels native to Indian culture but has Silicon Valley production quality.
- **Trustworthy**: Every design decision must reduce purchase anxiety.
- **Fast and alive**: Animations make the site breathe. Numbers should feel like they have energy.

### TARGET USER PSYCHOLOGY:
- 28-45 years old
- Business owners, entrepreneurs, politicians, real estate agents
- Has bought something on Tanishq, CRED, or Nykaa
- Makes decisions emotionally, justifies rationally
- Will spend ₹5,000–₹2,00,000 on the right number

### THE BRAND TENSION TO RESOLVE:
Spiritual + Technology. Sacred + Modern. Indian + Premium.
The numerology watermarks on number cards are the physical embodiment of this.

═══════════════════════════════════════════════════════════
## SECTION 2 — COLOR SYSTEM
═══════════════════════════════════════════════════════════

**PHILOSOPHY**: Dark base always. Gold on velvet. Never light mode.

**Base / Background scale**:
- `--bg-void`: `#080810` (deepest background)
- `--bg-deep`: `#0D0D1A` (section alternates)
- `--bg-surface`: `#12121F` (cards, panels)
- `--bg-elevated`: `#1A1A2E` (modals, dropdowns)
- `--bg-overlay`: `#22223A` (selected states)

**Border scale**:
- `--border-subtle`: `rgba(255,255,255,0.06)`
- `--border-default`: `rgba(255,255,255,0.12)`
- `--border-strong`: `rgba(255,255,255,0.24)`
- `--border-accent`: `rgba(212,175,55,0.4)`

**Accent Family (Royal Gold)**:
- `--accent-gold-dim`: `#8B6914`
- `--accent-gold-subtle`: `#B8860B`
- `--accent-gold`: `#D4AF37` (PRIMARY)
- `--accent-gold-bright`: `#F0C040`
- `--accent-gold-glow`: `#FFD700`

**Secondary Accent (Cosmic Purple)**:
- `--accent-purple-dim`: `#1A0A2E`
- `--accent-purple`: `#6B21A8`
- `--accent-purple-mid`: `#9333EA`
- `--accent-purple-bright`: `#C084FC`

**Text Scale**:
- `--text-primary`: `#F5F5F0`
- `--text-secondary`: `#A0A0B0`
- `--text-tertiary`: `#5A5A72`
- `--text-accent`: `#D4AF37`
- `--text-on-accent`: `#0D0D1A`
- `--text-muted`: `#3A3A52`

**Planetary Energy Colors**:
- Sun (1): `#FF6B35` | Moon (2): `#E8E8F0` | Jupiter (3): `#FFD700`
- Rahu (4): `#2D2D4E` | Mercury (5): `#00C896` | Venus (6): `#FF8FAB`
- Ketu (7): `#8B4513` | Saturn (8): `#4A4A6A` | Mars (9): `#DC2626`

**Glassmorphism Formula**:
`background: rgba(18, 18, 31, 0.7); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255,255,255,0.08);`

═══════════════════════════════════════════════════════════
## SECTION 3 — TYPOGRAPHY
═══════════════════════════════════════════════════════════

**FONT PAIRING:**
- **Display / Hero Font**: "Cormorant Garamond" (Weights: 300, 400, 600, 700). Used for hero headings, numbers.
- **UI / Body Font**: "DM Sans" (Weights: 300, 400, 500, 600). Used for all UI text, nav, buttons.

**Type Scale**:
- `--text-display-2xl`: 4.5rem (72px), 300, Cormorant
- `--text-h1`: 2rem (32px), 600, Cormorant
- `--text-body`: 1rem (16px), 400, DM Sans
- `--text-number-hero`: 3rem (48px), 300, Cormorant (tabular-nums feature required)

═══════════════════════════════════════════════════════════
## SECTION 4 — SPACING & BORDER RADIUS
═══════════════════════════════════════════════════════════

**Base unit**: 4px
**Scale**: `space-1` (4px) through `space-32` (128px)
**Radius Scale**: `--radius-none` (0px) through `--radius-full` (9999px)

═══════════════════════════════════════════════════════════
## SECTION 5 — COMPONENT SPECIFICATIONS
═══════════════════════════════════════════════════════════

*   **Navbar**: Sticky Glassmorphic, 72px desktop / 64px mobile.
*   **Mobile Menu**: Fullscreen overlay triggered by hamburger config, staggering in from the right.
*   **VIP Number Card**: Includes a watermark number behind everything, planetary energy row, numerology sum, and a gold CTA full width.
*   **Buttons**: Solid gold primary, transparent gold-outline secondary.

═══════════════════════════════════════════════════════════
## SECTION 6 — DO / DON'T RULES
═══════════════════════════════════════════════════════════

**DO:**
- Use tabular-nums for numbers.
- Keep the gold accent disciplined.
- Use skeleton UI before loading.
- Animate on scroll exactly once.

**DON'T:**
- Use light mode anywhere. EVER.
- Show raw prices without exact ₹ symbol formatting.
- Play auto audio or use sharp 0px border radiuses.
