import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F97316", // orange - à ajuster selon l'identité visuelle
          dark: "#C2410C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
