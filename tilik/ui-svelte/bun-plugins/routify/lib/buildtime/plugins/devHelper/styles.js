export default `
li { list-style-type: none; }
ul {padding-left: 8px;}


  :host {
    all: initial;
    font-size: 10px;
    font-family: Roboto;
    font-weight: 300;
    color: var(--color-grey-800);
    --scale-0: 1rem;
    --scale-1: 1.125rem;
    --scale-2: 1.25rem;
    --scale-3: 1.5rem;
    --scale-4: 1.875rem;
    --scale-5: 2.25rem;
    --scale-6: 3rem;
    --scale-7: 3.75rem;
    --scale-8: 4.5rem;
    --scale-9: 6rem;
    --scale-10: 8rem;
    --scale-000: 0.75rem;
    --scale-00: 0.875rem;
    --font-sans: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue;
    --font-serif: Georgia, Cambria, "Times New Roman", Times, serif;
    --font-mono: Consolas, Menlo, Monaco, "Liberation Mono", monospace;
    --weight-light: 300;
    --weight-regular: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;
    --weight-extrabold: 800;
    --weight-black: 900;
    --line-none: 1;
    --line-xs: 1.125;
    --line-sm: 1.275;
    --line-md: 1.5;
    --line-lg: 1.625;
    --line-xl: 2;
    --letter-xs: -0.05em;
    --letter-sm: -0.025em;
    --letter-none: 0em;
    --letter-lg: 0.025em;
    --letter-xl: 0.05em;
    --prose-xs: 45ch;
    --prose-sm: 55ch;
    --prose-md: 65ch;
    --prose-lg: 75ch;
    --prose-xl: 85ch;
    --size-1: 4px;
    --size-2: 8px;
    --size-3: 12px;
    --size-4: 16px;
    --size-5: 20px;
    --size-6: 24px;
    --size-7: 28px;
    --size-8: 32px;
    --size-9: 36px;
    --size-10: 40px;
    --size-11: 44px;
    --size-12: 48px;
    --size-14: 56px;
    --size-16: 64px;
    --size-20: 80px;
    --size-24: 96px;
    --size-28: 112px;
    --size-32: 128px;
    --size-36: 144px;
    --size-40: 160px;
    --size-44: 176px;
    --size-48: 192px;
    --size-52: 208px;
    --size-56: 224px;
    --size-60: 240px;
    --size-64: 256px;
    --size-72: 288px;
    --size-80: 320px;
    --size-96: 384px;
    --size-px: 1px;
    --size-full: 100%;
    --size-screen: 100vw;
    --size-min: min-content;
    --size-max: max-content;
    --width-xs: 480px;
    --width-sm: 640px;
    --width-md: 768px;
    --width-lg: 1024px;
    --width-xl: 1280px;
    --radius-100: 100%;
    --radius-xs: 3px;
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
    --blur-xs: blur(4px);
    --blur-sm: blur(8px);
    --blur-md: blur(16px);
    --blur-lg: blur(24px);
    --blur-xl: blur(40px);
    --layer-1: 10;
    --layer-2: 20;
    --layer-3: 30;
    --layer-4: 40;
    --layer-5: 50;
    --layer-below: -1;
    --layer-top: 2147483647;
    --elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --elevation-2: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --elevation-3: 0 4px 6px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
    --elevation-4: 0 12px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --elevation-5: 0 20px 24px -4px rgba(0, 0, 0, 0.1), 0 8px 8px -4px rgba(0, 0, 0, 0.04);
    --elevation-6: 0 24px 48px -12px rgba(0, 0, 0, 0.25);
    --elevation-7: 0 32px 64px -12px rgba(0, 0, 0, 0.2);
    --easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
    --easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
    --easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
    --color-grey-50: #f9fafb;
    --color-grey-100: #f2f4f5;
    --color-grey-200: #e8eaed;
    --color-grey-300: #d4d7dd;
    --color-grey-400: #a5aab4;
    --color-grey-500: #767c89;
    --color-grey-600: #555d6e;
    --color-grey-700: #3f4754;
    --color-grey-800: #2c343f;
    --color-grey-900: #10181C;
    --color-black: #14141B;
    --color-grey: var(--color-grey-500);
    --color-red-300: #fc8181;
    --color-red-500: #e53e3e;
    --color-red-700: #c53030;
    --color-red: var(--color-red-500);
    --color-green-300: #9ae6b4;
    --color-green-500: #48bb78;
    --color-green-700: #2f855a;
    --color-green: var(--color-green-500);
    --color-blue-300: #63b3ed;
    --color-blue-500: #4299e1;
    --color-blue-700: #3182ce;
    --color-blue: var(--color-blue-500);
    --color-pink-300: #fbb6ce;
    --color-pink-500: #ed64a6;
    --color-pink-700: #d53f8c;
    --color-pink: var(--color-pink-500);
    --color-purple-300: #b794f4;
    --color-purple-500: #805ad5;
    --color-purple-700: #6b46c1;
    --color-purple: var(--color-purple-500);
    --color-teal-300: #81e6d9;
    --color-teal-500: #38b2ac;
    --color-teal-700: #2c7a7b;
    --color-teal: var(--color-teal-500);
    --color-yellow-300: #faf089;
    --color-yellow-500: #ecc94b;
    --color-yellow-700: #d69e2e;
    --color-yellow: var(--color-yellow-500);
    --color-orange-300: #fbd38d;
    --color-orange-500: #ed8936;
    --color-orange-700: #dd6b20;
    --color-orange: var(--color-orange-500);
    --color-brown-300: #a1887f;
    --color-brown-500: #795548;
    --color-brown-700: #5d4037;
    --color-brown: var(--color-brown-500);
    --grid-2: repeat(2, minmax(0, 1fr));
    --grid-3: repeat(3, minmax(0, 1fr));
    --grid-4: repeat(4, minmax(0, 1fr));
    --grid-5: repeat(5, minmax(0, 1fr));
    --grid-6: repeat(6, minmax(0, 1fr));
    --grid-7: repeat(7, minmax(0, 1fr));
    --grid-8: repeat(8, minmax(0, 1fr));
    --grid-9: repeat(9, minmax(0, 1fr));
    --grid-10: repeat(10, minmax(0, 1fr));
    --grid-11: repeat(11, minmax(0, 1fr));
    --grid-12: repeat(12, minmax(0, 1fr));
    --grid-page-width: var(--width-xl);
    --grid-page-gutter: 5vw;
    --grid-page-main: 2 / 3;
    --grid-page: minmax(var(--grid-page-gutter), 1fr) minmax(0, var(--grid-page-width)) minmax(var(--grid-page-gutter), 1fr)
  }
  ` +
    // custom css
    `
.modal {
  position: fixed;
  bottom: 0;
  right: 0;
}

a {
  text-decoration: none;
  color: var(--color-grey-400);
  font-weight: 500;
}
a:hover {
  color: var(--color-grey-500);
}
ul {
  padding-left: var(--size-2);
}
.node {
  height: 24px;
  width: 100%;
  display: inline-block;
}
.info {
  background: var(--color-grey-400);
  border-radius: var(--radius-full);
  width: 13px;
  line-height: 13px;
  text-align: center;
  color: white;
  display: inline-block;
  font-weight: 700;
  font-size: 12px;
}
.node:not(:hover) span.info {
  /* display: none; */
}
` +
    `
.helper {
  border-top-left-radius: var(--radius-lg);
  background: white;
  display: grid;
  grid-template-areas:
      'header header'
      'instance node-info'
      'footer footer';
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-auto-rows: auto;
  width: 700px;
  height: 400px;
  box-shadow: 8px 8px 16px 0 black;
}
header {
  border-top-left-radius: var(--radius-lg);
  background: var(--color-pink-500);
  height: 32px;
  line-height: 32px;
  padding-left: 16px;
  grid-area: header;
  font-weight: 700;
  color: white;
}
footer {
  background: var(--color-pink-500);
  height: var(--size-1);
  grid-area: footer;
}
.instance {
  grid-area: instance;
  width: 200px;
}
.node-info {
  grid-area: node-info;
  width: 500px;
  border-left: 2px solid var(--color-grey-300);
}
.instance,
.node-info {
  overflow: auto;
  padding: 16px 20px;
  box-sizing: border-box;
}
`
