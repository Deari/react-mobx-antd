const webpack = require('webpack');
const path = require('path');
const getLessLoader = require('./less.loader')();
const os = require('os');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./dir.config');

const vendors = ['react', 'react-dom', 'react-router', 'prop-types', 'antd'];

let plugins = [
  new webpack.DllPlugin({
    path: './src/static/js/manifest.json',
    name: '[name]',
    context: __dirname,
  }),
  new HappyPack({
    id: 'happybabel',
    loaders: [
      {
        loader: 'babel-loader',
      },
    ],
    threadPool: happyThreadPool,
    cache: true,
    verbose: true,
  }),
  new ExtractTextPlugin({
    filename: 'css/[name].css',
    allChunks: true,
  }),
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ exclude: /\.min\.js$/ }));
}

module.exports = {
  output: {
    path: path.join(__dirname.replace('config/webpack-config', '/src/static')),
    filename: 'js/[name].js',
    library: '[name]',
  },
  entry: {
    lib: vendors,
  },
  plugins: plugins,
  module: {
    strictExportPresence: true,
    noParse: [/moment.js/],
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|woff|svg|eot|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1,
              name(file) {
                const ext = path.extname(file);
                let subName = file.replace(config.contextPath, '');
                /* src 处理 */
                subName = subName.replace(ext, '');
                let ret = subName.split(/\/node_modules\//);
                if (ret) {
                  ret = ret.slice(-1);
                  subName = ret[0].replace('@liepin', 'plugins');
                }
                if (/\.(woff|svg|eot|ttf)$/.test(ext)) {
                  //字体处理
                  subName = 'fonts/' + subName.replace(/fonts\//, '');
                }
                if (/\.(png|jpg|jpeg|gif)$/.test(ext)) {
                  //图片处理
                  subName = 'images/' + subName.replace(/\/images?\//, '/');
                }
                subName = subName.replace(/\/{2,}/g, '/');
                return `${subName}.[ext]`;
              },
            },
          },
        ],
      },
      {
        test: /\.(css)$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(less|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: getLessLoader,
        }),
      },
      {
        test: /\.js[x]?$/,
        loaders: ['happypack/loader?id=happybabel'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.tpl', '.jsx'] /* 自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名 */,
  },
};
