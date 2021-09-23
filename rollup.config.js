import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import pkg from './package.json'
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-import-css";
import jsx from 'rollup-plugin-jsx'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from 'rollup-plugin-replace';


const extensions = ['.js']
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
            css(),
            jsx( {factory: 'React.createElement'} ),
            terser(),
            json({
                compact: true,
            }),
            resolve({
                browser: true
            }),
            babel({
                exclude: 'node_modules/**',
                extensions,
                babelHelpers: 'bundled'
            }),
            commonjs(),
            replace({
                'process.env.NODE_ENV': JSON.stringify( 'development' )
            })
        ]
    }
];