import globals from 'globals';
export default [
  { files: ['js/**/*.js'], languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.browser, THREE: 'readonly', gsap: 'readonly', ScrollTrigger: 'readonly', Lenis: 'readonly' } },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }], 'no-redeclare': 'error' } }
];
