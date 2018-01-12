/* eslint-disable import/no-extraneous-dependencies */
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: {
    file: pkg.main,
    format: 'cjs'
  },
  external: Object.keys(pkg.dependencies).concat(
    Object.keys(pkg.peerDependencies)
  ),
  plugins: [babel()]
};
