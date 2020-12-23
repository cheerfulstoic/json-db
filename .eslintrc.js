module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'parser': '@typescript-eslint/parser'
  },
  'plugins': [
    'vue',
    '@typescript-eslint'
  ],
  'rules': {
    'indent': ['error', 2 ],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'never' ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error"

  }
}
