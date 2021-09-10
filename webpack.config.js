const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CONFIG = {

    entry: {
      app: path.join(__dirname, 'src') + '/app.js'
    },
    output: {
        library: 'APP',
        filename: 'app.bundle.js',
        path: path.resolve(__dirname, 'docs'),
      },
    module: {
      rules: [
        {
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