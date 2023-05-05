/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: { center: true },
    extend: {
      backgroundImage: {
        'hero-pattern':
          "url('/images/bg.svg'), linear-gradient(black, #181818);",
      },
    },
  },
  plugins: [
    require('daisyui'),
    function ({ addVariant }) {
      addVariant('child', '& > *');
      addVariant('child-hover', '& > *:hover');
    },
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#1d4ed8',

          secondary: '#3b82f6',

          accent: '#37CDBE',

          neutral: '#3D4451',

          'base-100': '#3D4451',

          info: '#3ABFF8',

          success: '#10b981',

          warning: '#FBBD23',

          error: '#be123c',
        },
      },
    ],
  },
};
