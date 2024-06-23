/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}',
  ],
  theme: {
    extend: {
      colors: {
        transparentWhite: 'rgba(255, 255, 255, 0.8)',
        lightOlive: '#819a6f',
        darkOlive: '#31452a',
      },
    },
  },
  plugins: [],
}
