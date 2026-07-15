export default {
  // Run Prettier on all files
  '*.{js,jsx,ts,tsx,json,css,md}': ['prettier --write'],
  // Run ESLint on TS/TSX files
  '*.{ts,tsx}': ['eslint --fix'],
};