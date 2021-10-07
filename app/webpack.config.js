const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.bundle.js',
    publicPath: '/'
  },
  devServer: {
    port: 3000,
    historyApiFallback: {
      disableDotRule: true
    }
  },
  module: {
    rules: [{
      resourceQuery: /raw/,
      type: 'asset/source'
    }, {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.(jpg|png|svg|otf|ttf)$/,
      resourceQuery: { not: [ /raw/ ] },
      type: 'asset'
    },
    // TODO: Remove the below rule for .mjs, once aws-amplify supports webpack 5
    {
      test: /\.m?js/,
      resolve: {
          fullySpecified: false
      }
    }]
  },
  resolve: { 
    alias: {
      '@view': path.resolve(__dirname, 'src', 'view'),
      '@service': path.resolve(__dirname, 'src', 'service'),
      '@static': path.resolve(__dirname, 'static')
    }
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      'NODE_ENV', 
      'AUTH_URI',
      'TOKEN_URI',
      'APP_URI',
      'API_URI'
    ]),
    new HtmlWebpackPlugin({ 
      template: './static/index.html',
      title: 'authWeb'
    }),
    new FaviconsWebpackPlugin({
      logo: './static/nyan.svg',
      prefix: 'static/'
    })
  ],
}