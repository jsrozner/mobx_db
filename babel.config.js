// This file added in order to run jest tests on frontend

// todo: will not test typescript; consider ts-jest or tsc
// see https://jestjs.io/docs/getting-started#using-babel
module.exports = {
  presets: [
    ['@babel/preset-env',
      {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};