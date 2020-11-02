module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // project: 'tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'error',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public'
      }
    ],
    // '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['enumMember'],
        format: ['PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'forbid'
      }
    ],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-namespace': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/prefer-function-type': 'error',
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/unified-signatures': 'error',
    'arrow-body-style': 'error',
    'comma-dangle': 'error',
    'constructor-super': 'error',
    eqeqeq: ['error', 'smart'],
    'guard-for-in': 'error',
    'id-blacklist': [
      'error',
      'any',
      'Number',
      'number',
      'String',
      'string',
      'Boolean',
      'boolean',
      'Undefined',
      'undefined'
    ],
    'id-match': 'error',
    'import/order': 'off',
    'jsdoc/check-alignment': 'off',
    'jsdoc/check-indentation': 'off',
    'jsdoc/newline-after-description': 'off',
    'max-classes-per-file': 'off',
    'no-bitwise': 'error',
    'no-caller': 'error',
    'no-console': 'off',
    'no-debugger': 'error',
    'no-empty': 'off',
    'no-eval': 'error',
    'no-fallthrough': 'error',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 2
      }
    ],
    'no-new-wrappers': 'error',
    'no-restricted-imports': ['error', 'rxjs/Rx', 'rxjs/internal/operators'],
    'no-shadow': [
      'error',
      {
        hoist: 'all'
      }
    ],
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-underscore-dangle': 'error',
    'no-unused-labels': 'error',
    'no-var': 'error',
    'object-shorthand': 'off',
    'prefer-const': 'off',
    radix: 'error'
  }
};
