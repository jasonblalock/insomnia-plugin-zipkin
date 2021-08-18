const path = require('path');

module.exports = {
  entry: { index: './index.js' },
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'zipkin',
    libraryTarget: 'commonjs2',
  },
  // output: {
  //   path: path.resolve(__dirname),
  //   filename: 'main.js',
  //   library: 'zipkin',
  //   libraryTarget: 'commonjs2',
  // },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  externals: [
    (function () {
      var IGNORES = ['electron'];
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback();
      };
    })(),
  ],
};
