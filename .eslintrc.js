module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:prettier/recommended'],
  plugins: ['jest', '@typescript-eslint'],
  env: {
    jest: true,
  },
}
