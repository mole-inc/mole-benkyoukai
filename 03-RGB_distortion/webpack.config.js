
//webpack.config.js

const webpack = require('webpack');
const path = require('path');
const glob = require('glob');

const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  mode: 'development',
  entry: './src/assets/scripts/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/'),
    //filename: './assets/bundle-[hash].js'
    filename: './assets/bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    watchContentBase: true,
    port: 5000,
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
          chunks: 'initial',
          enforce: true,
          reuseExistingChunk: true,
          minSize: 1,
          minChunks: 2,
        },
        vendorModules: {
          test: /src\/assets\/scripts\/vendors/,
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
        test: /\.pug$/,
        use: 'pug-loader',
      },
      {
        test:/\.html$/,
        use: [
          'html-loader'
        ]
      },
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
                }),
              ]
            }
          },
          'stylus-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)(\?.+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1024 * 100,
            name: './assets/images/[name].[ext]',
          }
        }
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
      }
    ]
  },
  plugins: [
    //minify style
    new MiniCssExtractPlugin({
      //filename: './assets/main-[hash].css'
      filename: './assets/main.css'
    }),

    new CopyPlugin({
      patterns: [
        {
          from: './src/assets/images',
          to: 'assets/images'
        }
      ]
    })
  ],
  resolve: {
    extensions: [
      '.ts', '.js',
    ],
  },
};

const type = '.pug';
  // 拡張子指定
glob.sync(`*${type}`, {
  cwd: 'src',
  // cwdでルートを指定し、pugファイルを探索後、配列に。
}).forEach((file) => {
  const name = path.basename(file);
    // name = hoge.pug
  const outputName = path.basename(file).replace(new RegExp(type, 'g'), '') + '.html';
    // hoge.html = 'hoge.pug'.replace(/.pug/g, '') + '.html';
    // 拡張子をpugからhtmlに。
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: path.resolve('src', name),
      filename: outputName,
    }),
  );
})

module.exports = config;
