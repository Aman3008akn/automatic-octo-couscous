/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12172B", // primary text / near-black navy
        paper: "#F7F7F5", // background
        navy: {
          50: "#EEF1F8",
          100: "#D6DCEE",
          400: "#3A4A82",
          600: "#232F5C",
          900: "#12172B",
        },
        amber: {
          400: "#E8A33D",
          500: "#D98E1B",
          600: "#B5710C",
        },
        line: "#DEDDD6", // hairline borders
        success: "#2F7D5B",
        danger: "#B4432F",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
