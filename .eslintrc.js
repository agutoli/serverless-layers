module.exports =  {
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "eslint-plugin-tsdoc"
  ],
  extends:  [
    'plugin:@typescript-eslint/recommended'
  ],
  parser:  '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.eslint.json',
    sourceType: 'module'
  },
  rules: {
    "tsdoc/syntax": "warn"
  }
};
