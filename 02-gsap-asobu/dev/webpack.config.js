const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  watch: true,
  mode: 'development',
  // entry: './src/scripts/index.js',
  entry: {
    path: path.resolve(__dirname, './src/scripts/index.js'),
  },
  output: {
    path: path.resolve(__dirname, '../assets/'),
    publicPath: '/js/',
    filename: './main.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'assets'),
    watchContentBase: true,
    port: 9000,
    watchOptions: {
      poll: 1000,
      ignored: ['node_modules']
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          filename: 'assets/js/vendor.bundle.js',
          chunks: 'initial',
          enforce: true,
          reuseExistingChunk: true,
          minSize: 1,
          minChunks: 2,
        },
        vendorModules: {
          test: /src\/scripts\/vendors/,
          name: 'vendor-modules',
          chunks: 'initial',
          enforce: true,
          reuseExistingChunk: true,
          minSize: 1,
          minChunks: 2,
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        extractComments: 'all',
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              importLoaders: 2
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require('cssnano')({
                  preset: 'default',
                  discardComments: {
                    removeAll: true,
                  },
                }),
                require("autoprefixer")({
                  grid: true,
                  flexbox: true,
                }),
                require("css-mqpacker")(),
                require('css-declaration-sorter')({
                  order: 'alphabetical'
                }),
                require('postcss-sort-media-queries')({
                  sort: 'desktop-first',
                })
              ]
            }
          },
          'stylus-loader',
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)(\?.+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1024 * 100,
            name: './images/[name].[ext]',
          }
        }
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './main.css'
    }),
    new CopyPlugin({
      patterns: [{
        from: './src/images',
        to: '../assets/images/lp'
      }]
    }),

    // jquery使うなら
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery'
    }),
  ],
  resolve: {
    extensions: [
      '.js'
    ],
  },
};

module.exports = config;