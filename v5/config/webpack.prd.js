const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const MapWebpackPlugin = require('./plugins/map-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const config = require('./webpack-config/dir.config');

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const smp = new SpeedMeasurePlugin();

// less-loader
const getLessLoader = require('./webpack-config/less.loader')(true);

let entry = {
  'common/vendors': ['mobx', 'mobx-react'],
};
/* 入口 */

let plugins = [
  new webpack.SourceMapDevToolPlugin({
    filename: '../sourcemap/' + config.version + '/[file].map', //存放为上层路径，接收相对路径
    append: false, // 去除js文件中末尾注释
  }),
];
/* 插件 */

const fsPath = require('fs-path');
fsPath.remove(path.join(config.prdPath, '../'), () => {
  fsPath.mkdir(path.join(config.prdPath, '../'));
});

// 遍历入口文件
const files = require('./webpack-config/entrys.config');

files.forEach((v) => {
  let name = v
    .replace(config.contextPath, '')
    .replace(/\/index\.js$/, '')
    .replace(/\.js$/, '');
  name = name.replace(/^\/+/, '');
  name = name.replace(/common\/js/g, 'common'); //common/js 处理
  name = name.replace(/common$/g, 'common/common'); //common 处理
  entry[name] = v;
});

plugins = plugins.concat(require('./webpack-config/plugin.base'));
// copy static
plugins.push(
  new CopyWebpackPlugin([
    {
      from: path.join(config.contextPath, 'static'),
      to: path.join(config.prdPath, 'static/[path][name].[hash:8].[ext]'),
      ignore: ['.*'],
    },
  ]),
);

plugins.push(new ProgressBarPlugin());

// webpack 压缩打包
plugins.push(new webpack.optimize.UglifyJsPlugin({ sourceMap: true, exclude: /\.min\.js$/ }));

plugins.push(
  new ExtractTextPlugin({
    filename(getPath) {
      return getPath('css/[name].[contenthash:8].css');
    },
  }),
);

// 插件配置 生成版本map  error?????
plugins.push(new MapWebpackPlugin({ targetFile: '../map.json' }));
plugins.push(new webpack.HashedModuleIdsPlugin());

const exportConfig = {
  entry: entry,
  output: {
    path: config.prdPath,
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/react/[name].[chunkhash:8].js',
    publicPath: config.publicPath,
  },

  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|woff|svg|eot|ttf)$/,
        exclude: config.exclude,
        use: [
          {
            loader: 'file-loader',
            options: {
              fakeoption: true,
              name(file) {
                const ext = path.extname(file);
                let subName = file.replace(config.contextPath, ''); // src 处理
                subName = subName.replace(ext, '');
                let ret = subName.split(/\/node_modules\//);
                if (ret) {
                  ret = ret.slice(-1);
                  subName = ret[0].replace('@liepin', 'plugins');
                }
                if (/\.(woff|svg|eot|ttf)$/.test(ext)) {
                  /* 字体处理 */
                  subName = 'fonts/' + subName.replace(/fonts\//, '');
                }
                if (/\.(png|jpg|jpeg|gif)$/.test(ext)) {
                  /* 图片处理 */
                  subName = 'images/' + subName.replace(/\/images?\//, '/');
                }
                subName = subName.replace(/\/+/g, '/');
                return `${subName}.[hash:8].[ext]`;
              },
            },
          },
        ],
      },
      {
        test: /\.tpl$/,
        exclude: config.exclude,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'nodetpl-loader',
          },
        ],
      },
      {
        test: /\.(less|css)$/,
        exclude: config.exclude,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: getLessLoader,
        }),
      },
      {
        test: /\.js[x]?$/,
        // loader: "babel-loader",
        exclude: config.exclude,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.tpl', '.jsx'] /* 自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名 */,
    alias: {
      '@/business': config.contextPath + '/components/business',
      '@/ui': config.contextPath + '/components/ui',
      '@/services': config.contextPath + '/services',
      '@/views': config.contextPath + '/views',
      '@/routes/_util': config.contextPath + '/routes/_util',
      '@': config.contextPath,
    },
  },
  plugins: plugins,
};

module.exports = smp.wrap(exportConfig);
