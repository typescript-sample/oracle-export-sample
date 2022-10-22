const webpack = require('webpack'),
  path = require('path'),
  CopyPlugin = require('copy-webpack-plugin'),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin'),
  BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  target: 'node',
  entry: './src/app.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        }
      },
      {
        // Change the path the oracledb package is looking for the binary to the dist directory.
        // This is a very hacky solution that modifies the source code in 'node_modules/oracledb/lib/oracledb.js'.
        test: /oracledb\.js$/i,
        loader: 'string-replace-loader',
        options: {
            search: '../',
            replace: './node_modules/oracledb/',
        },
      },
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new UglifyJsPlugin({
      test: /\.js($|\?)/i
    }),
    new BundleAnalyzerPlugin()
  ],
};
