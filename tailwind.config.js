import {nextui} from '@nextui-org/theme'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          "colors": {
              "background": "#f0f6f7",
              "primary": {
                "50": "#e7f5f8",
                "100": "#cce9f0",
                "200": "#99d2e1",
                "300": "#66bbd2",
                "400": "#33a4c3",
                "500": "#50A3BE",
                "600": "#3e828e",
                "700": "#2f606d",
                "800": "#1f4049",
                "900": "#0f2024",
                "foreground": "#fff",
                "DEFAULT": "#50A3BE"
              },
              "secondary": {
                "50": "#f5f6f7",
                "100": "#e4e7ea",
                "200": "#ccd2d7",
                "300": "#b4bdc3",
                "400": "#9ca8b0",
                "500": "#A4ACB4",
                "600": "#707880",
                "700": "#545a60",
                "800": "#383c40",
                "900": "#1c1e20",
                "foreground": "#000",
                "DEFAULT": "#A4ACB4"
              },
              "success": {
                  "50": "#effbf1",
                  "100": "#d7f7da",
                  "200": "#aff0b3",
                  "300": "#86e98d",
                  "400": "#5ee267",
                  "500": "#36db41",
                  "600": "#2bb234",
                  "700": "#208828",
                  "800": "#155f1c",
                  "900": "#0a3510",
                  "foreground": "#000",
                  "DEFAULT": "#36db41"
              },
              "warning": {
                "50": "#fff7e2",
                "100": "#ffecb0",
                "200": "#ffe08e",
                "300": "#ffd26a",
                "400": "#ffc448",
                "500": "#ffb620",
                "600": "#d19400",
                "700": "#a37200",
                "800": "#745000",
                "900": "#462d00",
                "foreground": "#000",
                "DEFAULT": "#ffb620"
              },
              "danger": {
                "50": "#fdebea",
                "100": "#fbd3d3",
                "200": "#f7a8a8",
                "300": "#f27e7e",
                "400": "#ed5555",
                "500": "#e82b2b",
                "600": "#bf2121",
                "700": "#971818",
                "800": "#6e1010",
                "900": "#450808",
                "foreground": "#000",
                "DEFAULT": "#e82b2b"
              }
          }
        },
        dark: {
          "colors": {
              "background": "#021f24",
              "primary": {
                "50": "#0f2024",
                "100": "#1f4049",
                "200": "#2f606d",
                "300": "#3e828e",
                "400": "#50A3BE",
                "500": "#66bbd2",
                "600": "#99d2e1",
                "700": "#cce9f0",
                "800": "#e7f5f8",
                "900": "#f3fafc",
                "foreground": "#fff",
                "DEFAULT": "#50A3BE"
              },        
              "secondary": {
                "50": "#1c1e20",
                "100": "#30363d",
                "200": "#474f58",
                "300": "#5d6873",
                "400": "#74808e",
                "500": "#A4ACB4",
                "600": "#bcc5cf",
                "700": "#d0d6de",
                "800": "#e4e8ea",
                "900": "#f5f6f7",
                "foreground": "#fff",
                "DEFAULT": "#A4ACB4"
              },
              "success": {
                "50": "#122b1a",
                "100": "#205a2d",
                "200": "#2e8b40",
                "300": "#3bbd52",
                "400": "#48ee65",
                "500": "#55ff78",
                "600": "#6cff94",
                "700": "#84ffaf",
                "800": "#9bffd8",
                "900": "#b3fffb",
                "foreground": "#000",
                "DEFAULT": "#3bbd52"
              },
              "warning": {
                "50": "#332110",
                "100": "#664320",
                "200": "#996430",
                "300": "#cc8640",
                "400": "#ffa850",
                "500": "#ffb970",
                "600": "#ffcc91",
                "700": "#ffddb1",
                "800": "#ffeece",
                "900": "#fff7eb",
                "foreground": "#000",
                "DEFAULT": "#cc8640"
              },
              "danger": {
                "50": "#2b1010",
                "100": "#562121",
                "200": "#832e2e",
                "300": "#b03b3b",
                "400": "#de4949",
                "500": "#ff5757",
                "600": "#ff7575",
                "700": "#ff9292",
                "800": "#ffaeae",
                "900": "#ffcac9",
                "foreground": "#fff",
                "DEFAULT": "#ff5757"
              }
          }
        }
      }
    }),
    typography  
  ],
};

