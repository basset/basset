const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/',
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name]_[hash:7].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      app: path.resolve(__dirname, 'src/app'),
    },
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    disableHostCheck: true,
  },
};
