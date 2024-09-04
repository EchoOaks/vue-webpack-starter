const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const getAppEnv = require('./env').getAppEnv;

module.exports = (env, argv) => {
  const isProd = process.env.NODE_ENV === 'production';

  const config = {
    entry: {
      main: './src/app/main.ts',
    },
    output: {
      filename: 'js/app.[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
          },
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: (file) =>
            /node_modules/.test(file) && !/\.vue\.js/.test(file),
        },
        {
          test: /\.(scss|css)$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'vue-style-loader',
            { loader: 'css-loader', options: { url: false } },
            'postcss-loader',
            'sass-loader',
          ],
        },
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.tsx', '.ts', '.js', '.vue'],
    },
    plugins: [
      new VueLoaderPlugin(),
      new ESLintPlugin({
        extensions: ['js', 'vue', 'ts', 'tsx'],
        context: path.resolve(__dirname, 'src'), // Ensure it lints the right folder
        eslintPath: require.resolve('eslint'),
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
    ],
    devtool: isProd ? false : 'source-map',
    devServer: {
      static: {
        directory: path.join(__dirname, 'src'),
      },
      hot: true,
      host: process.env.HOST || 'localhost',
      port: process.env.PORT || 8080,
      client: {
        overlay: true,
      },
    },
  };

  if (isProd) {
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'css/app.[name].bundle.css',
      }),
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          {
            from: 'src',
            globOptions: {
              ignore: ['**/app/**', '**/*.scss', '**/index.html'],
            },
          },
        ],
      })
    );
  }

  return config;
};
