import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import pkg from './package.json'
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-import-css";
import jsx from 'rollup-plugin-jsx'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import replace from 'rollup-plugin-replace';



const extensions = ['.js', '.jsx']
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
                //plugins: ['transform-class-properties'],
                //exclude: 'node_modules/**',
                presets: ["@babel/preset-react"],
                babelHelpers: 'bundled'
            }),
            css(),
            //jsx( {factory: 'React.createElement'} ),
            terser(),
            
            resolve({
                browser: true
            }),
            
            
            replace({
                'process.env.NODE_ENV': JSON.stringify( 'development' )
            }),
            commonjs(),
            json({
                compact: true,
            }),
        ]
    }
];