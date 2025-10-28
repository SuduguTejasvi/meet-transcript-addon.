const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json'],
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": false,
      "process": false,
      "http": false,
      "https": false,
      "net": false,
      "tls": false,
      "url": false,
      "querystring": false,
      "os": false,
      "child_process": false,
      "assert": false,
      "zlib": false,
      "http2": false,
      "events": false,
      // Handle node: scheme modules
      "node:events": false,
      "node:process": false,
      "node:util": false,
      "node:stream": false,
      "node:crypto": false,
      "node:buffer": false,
      "node:fs": false,
      "node:path": false,
      "node:os": false,
      "node:child_process": false,
      "node:assert": false,
      "node:zlib": false,
      "node:http": false,
      "node:https": false,
      "node:net": false,
      "node:tls": false,
      "node:url": false,
      "node:querystring": false
    }
  },
  target: 'web',
  devtool: 'source-map',
  // Exclude Node.js modules that can't be bundled for browser
  externals: {
    'google-auth-library': 'google-auth-library',
    'googleapis': 'googleapis'
  }
};
