export const theme = {
  colors: {
    bg: {
      void: "#080810",
      deep: "#0D0D1A",
      surface: "#12121F",
      elevated: "#1A1A2E",
      overlay: "#22223A",
    },
    borders: {
      subtle: "rgba(255,255,255,0.06)",
      default: "rgba(255,255,255,0.12)",
      strong: "rgba(255,255,255,0.24)",
      accent: "rgba(212,175,55,0.4)",
    },
    accent: {
      gold: {
        dim: "#8B6914",
        subtle: "#B8860B",
        base: "#D4AF37",
        bright: "#F0C040",
        glow: "#FFD700",
      },
      purple: {
        dim: "#1A0A2E",
        base: "#6B21A8",
        mid: "#9333EA",
        bright: "#C084FC",
      }
    },
    text: {
      primary: "#F5F5F0",
      secondary: "#A0A0B0",
      tertiary: "#5A5A72",
      accent: "#D4AF37",
      onAccent: "#0D0D1A",
      muted: "#3A3A52",
    },
    semantic: {
      success: { bg: "rgba(16,185,129,0.1)", text: "#34D399", border: "rgba(52,211,153,0.3)" },
      error: { bg: "rgba(239,68,68,0.1)", text: "#F87171", border: "rgba(248,113,113,0.3)" },
      warning: { bg: "rgba(245,158,11,0.1)", text: "#FCD34D", border: "rgba(252,211,77,0.3)" },
    },
    planets: {
      sun: "#FF6B35",
      moon: "#E8E8F0",
      jupiter: "#FFD700",
      rahu: "#2D2D4E",
      mercury: "#00C896",
      venus: "#FF8FAB",
      ketu: "#8B4513",
      saturn: "#4A4A6A",
      mars: "#DC2626",
    }
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    32: "128px",
  },
  borderRadius: {
    none: "0px",
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
    full: "9999px",
  },
  typography: {
    fontFamily: {
      display: "'Cormorant Garamond', serif",
      body: "'DM Sans', sans-serif",
    }
  },
  animation: {
    easing: {
      outExpo: [0.22, 1, 0.36, 1],
      inOut: [0.4, 0, 0.2, 1],
      spring: { type: "spring", stiffness: 300, damping: 30 }
    },
    duration: {
      instant: 0.1,
      quick: 0.2,
      default: 0.3,
      deliberate: 0.5,
      cinematic: 0.8
    }
  }
};
