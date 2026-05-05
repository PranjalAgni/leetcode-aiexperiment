const { FlatCompat } = require('@eslint/eslintrc')
const path = require('path')

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
]
