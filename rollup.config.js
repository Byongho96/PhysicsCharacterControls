import del from 'rollup-plugin-delete';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const isDev = process.env.NODE_ENV === 'development';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      exports: 'auto',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
    {
      file: 'dist/bundle.esm.min.js',
      format: 'esm',
      plugins: [terser()],
    },
  ],
  external: ['three'],
  plugins: [
    del({ targets: 'dist/*' }),
    resolve({
      extensions: ['.js', '.ts'],
    }),
    commonjs(),
    typescript(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
    }),
    isDev &&
      serve({
        open: true,
        contentBase: ['public', '.'],
        openPage: '/',
        port: 3000,
      }),
    isDev &&
      livereload({
        watch: ['dist', 'public'],
      }),
  ].filter(Boolean),
  watch: {
    clearScreen: false,
  },
};
