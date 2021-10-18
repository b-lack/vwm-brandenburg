import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import pkg from './package.json'
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-import-css";
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve'

export default [
    {
        input: 'src/index.js',
        output: [
            {
                file: pkg.main,
                format: 'umd',
                name: 'VWM',
                sourcemap: true
            }
        ],
        plugins: [
            babel({
                presets: ["@babel/preset-react"],
                babelHelpers: 'bundled'
            }),
            css({
                minify: true
            }),
            resolve({
                browser: true
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify( 'production' )
            }),
            commonjs(),
            json({
                compact: true,
            }),
            serve({
                contentBase: 'docs',
                open: true
            }),
            terser()
        ]
    }
];