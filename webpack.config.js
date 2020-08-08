const path                 = require('path');
const glob                 = require('glob');
const CopyWebpackPlugin    = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode:    'development',
  entry:   glob.sync('./src/{js,jsx,css}/*.{js,jsx,scss}').reduce(function(obj, el) {
    obj[path.parse(el).name] = el;
    return obj
  }, {}),
  output:  {
    filename: '[name].js',
    path:     path.resolve(__dirname, './build/js')
  },
  devtool: 'cheap-module-source-map',
  module:  {
    rules: [
      {
        test:    /\.jsx?$/,
        exclude: /(node_modules)/,
        resolve: {
          extensions: [".js", ".jsx"]
        },
        use:     {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.s?css$/,
        use:  [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test:   /\.html$/i,
        loader: 'html-loader',
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/[name].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/html', to: '../html' },
        { from: 'src/manifest.json', to: '../' },
        { from: 'images/*', to: '../' }
      ]
    })
  ]
};
