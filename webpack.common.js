const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
      app: path.join(__dirname, 'src') + 'app.js'
    },
  
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Production',
        }),
    ],
    module: {
      rules: [
        {
          // Transpile ES6 to ES5 with babel
          // Remove if your app does not use JSX or you don't need to support old browsers
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [/node_modules/],
          options: {
            presets: ['@babel/preset-react']
          }
        }
      ]
    }
  };
  
  // This line enables bundling against src in this repo rather than installed module
  module.exports = env => (env ? require('../../webpack.config.local')(CONFIG)(env) : CONFIG);