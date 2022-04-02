const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

require('dotenv').config({ path: './.env' }); 

module.exports = {
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index.bundle.js',
    publicPath: '/'
  },
  devtool: 'eval-source-map',
  devServer: {
    port: 3002,
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
      'REACT_APP_AUTH_URI',
      'REACT_APP_TOKEN_URI',
      'REACT_APP_APP_URI',
      'REACT_APP_API_URI'
    ]),
    new HtmlWebpackPlugin({ 
      template: './static/index.html',
      title: 'INCAL'
    }),
    new FaviconsWebpackPlugin({
      logo: './static/nyan.svg',
      prefix: 'static/'
    })
  ],
}