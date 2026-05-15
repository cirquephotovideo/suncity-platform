import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        bgAlt: 'rgb(var(--bg-alt) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        textMuted: 'rgb(var(--text-muted) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        unbounded: ['var(--font-unbounded)', 'sans-serif'],
        bigShoulders: ['var(--font-big-shoulders)', 'sans-serif'],
      },
      maxWidth: { prose: '70ch' },
      typography: () => ({
        DEFAULT: { css: { color: 'rgb(var(--text))', a: { color: 'rgb(var(--primary))' } } },
      }),
    },
  },
  plugins: [],
};
export default config;
