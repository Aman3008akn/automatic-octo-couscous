export const colors = {
  ink: "#12172B", // Primary text / near-black ledger navy
  paper: "#F7F7F5", // Clean background
  white: "#FFFFFF",
  card: "#FFFFFF",
  line: "#DEDDD6", // Hairline borders
  lineLight: "#E5E7EB",

  navy: {
    50: "#EEF1F8",
    100: "#D6DCEE",
    400: "#3A4A82",
    600: "#232F5C",
    800: "#1A223E",
    900: "#12172B",
  },

  amber: {
    100: "#FEF3C7",
    300: "#F5C26B",
    400: "#E8A33D",
    500: "#D98E1B",
    600: "#B5710C",
  },

  text: {
    primary: "#12172B",
    secondary: "#4B5563",
    muted: "#9CA3AF",
    light: "#F9FAFB",
    amber: "#D98E1B",
  },

  status: {
    success: "#2F7D5B",
    successBg: "#ECFDF5",
    danger: "#B4432F",
    dangerBg: "#FEF2F2",
    warning: "#D98E1B",
    warningBg: "#FFFBEB",
    info: "#2563EB",
    infoBg: "#EFF6FF",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const shadows = {
  subtle: {
    shadowColor: "#12172B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    shadowColor: "#12172B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  elevated: {
    shadowColor: "#12172B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
