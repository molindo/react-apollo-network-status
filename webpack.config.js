const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './example/index.tsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.mjs']
  },
  output: {
    filename: 'bundle.js'
  },
  devServer: {
    open: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'example/index.html'
    })
  ]
};
