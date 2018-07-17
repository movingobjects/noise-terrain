
const path                  = require('path'),
      HtmlWebpackPlugin     = require('html-webpack-plugin');

const appTitle = process.env.npm_package_productName || process.env.npm_package_name;

module.exports = {

  entry: {
    app: './app/src/entry.js'
  },

  output: {
    path: path.resolve(__dirname, './app/dist'),
    filename: 'resources/scripts/[name].bundle.js'
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      path.resolve(__dirname),
      'node_modules'
    ]
  },

  module: {
    rules: [

      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'app')
        ],
        options: {
          presets: ['react'],
          env: {
            production: {
              presets: [
                'minify'
              ]
            }
          },
          plugins: [
            'transform-object-rest-spread',
            'transform-class-properties'
          ],
        }
      },

      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: 'resources/images/[name].[ext]'
        }
      },

      {
        test: /\.(ttf|otf|eot|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'resources/fonts/[name].[ext]'
        }
      },

      {
        test: /\.(mp3|aif|aiff|wav)$/,
        loader: 'file-loader',
        options: {
          name: 'resources/audio/[name].[ext]'
        }
      },

      {
        test: /\.(mp4|webm)$/,
        loader: 'file-loader',
        options: {
          name: 'resources/video/[name].[ext]'
        }
      },

      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader',
        options: {
          name: 'resources/shaders/[name].[ext]'
        }
      }

    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: appTitle
    })
  ],

};
