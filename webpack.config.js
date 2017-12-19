const path = require('path');

module.exports = {
  entry: {
    code: './src/main.ts'
  },
  module: {
    rules: [
      {
        test: /\.(frag|vert)$/,
        use: 'raw-loader'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', 'frag', 'vert' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};