
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

require('dotenv').config({ path: './.env' }); 

const uri = process.env.BASE_URI;

module.exports = {
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.bundle.js'
  },
  devtool: 'eval-source-map',
  devServer: {
    port: 3000,
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
        port: 3001
      },
    },
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
      'REACT_APP_AUTH_URI',
      'REACT_APP_TOKEN_URI',
      'REACT_APP_APP_URI',
      'REACT_APP_API_URI',
      'BASE_URI'
    ]),
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, 'dist', 'index.html'),
      template: path.join(__dirname, 'static', 'index.html'),
      title: 'sleep',
      metadata: {
        baseUrl: uri
      }
    }),
    new FaviconsWebpackPlugin({
      logo: './static/favicon.svg',
      prefix: 'static/'
    })
  ]
}

