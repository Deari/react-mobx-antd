/**
 * Created  17/10/17.
 */
const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = require('./webpack-config/dir.config');

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

//less-loader
const getLessLoader = require('./webpack-config/less.loader')();

let entrys = {
  'common/vendors': ['mobx', 'mobx-react']
};
/* 入口 */

let plugins = [];
/* 插件 */

const fsPath = require('fs-path');
fsPath.remove(path.join(config.devPath, '../'), () => {
  fsPath.mkdir(path.join(config.devPath, '../'));
});

// 遍历入口文件
const files = require('./webpack-config/entrys.config');
const hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';

files.forEach(v => {
  let name = v
    .replace(config.contextPath, '')
    .replace(/\/index\.js$/, '')
    .replace(/\.js$/, '');
  name = name.replace(/^\/+/, '');
  name = name.replace(/common\/js/g, 'common'); //common/js 处理
  name = name.replace(/common$/g, 'common/common'); //common 处理
  // entrys[name] = [v, hotMiddlewareScript];
  entrys[name] = v;

  // 插件配置 html导出路径设置
  const gbHtml = glob.sync(v.replace(/\.js$/, '') + '.html');
  if (gbHtml.length) {
    const html = 'html/' + name + '.html';
    plugins.push(
      new HtmlWebpackPlugin({
        filename: html,
        publicPath: config.publicPath,
        template: v.replace('.js', '.html'),
        inject: false
      })
    );
  }
});

plugins = plugins.concat(require('./webpack-config/plugin.base'));
// copy includes
plugins.push(
  new CopyWebpackPlugin([
    {
      from: path.join(config.contextPath, 'includes'),
      to: path.join(config.devPath, 'html/includes/[name].[ext]'),
      ignore: ['.*']
    }
  ])
);
// copy static
plugins.push(
  new CopyWebpackPlugin([
    {
      from: path.join(config.contextPath, 'static'),
      to: path.join(config.devPath, 'static/[path][name].[ext]'),
      ignore: ['.*']
    }
  ])
);

// cdn 回源机制
// plugins.push(new CopyWebpackPlugin([
//   {
//     from: path.join(config.contextPath, './cdntest.png'),
//     to: path.join(config.prdPath, './cdntest.png'),
//   },
// ]));

plugins.push(
  new ExtractTextPlugin({
    filename(getPath) {
      return getPath('css/[name].css').replace('.js', '');
    }
  })
);

//开启happypack的线程池加速代码构建
const os = require('os');
const HappyPack = require('happypack');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const eslintFormatter = require('react-dev-utils/eslintFormatter');

plugins.push(
  new HappyPack({
    id: 'happybabel',
    loaders: [
      {
        loader: 'babel-loader',
        exclude: config.exclude
      }
      // {
      //   options: {
      //     formatter: eslintFormatter,
      //     eslintPath: require.resolve('eslint'),
      //     // @remove-on-eject-begin
      //     baseConfig: {
      //       extends: ['eslint-config-react-app'],
      //     },
      //     ignore: false,
      //     useEslintrc: false,
      //     // @remove-on-eject-end
      //   },
      //   loader: 'eslint-loader',
      // }
    ],
    threadPool: happyThreadPool,
    cache: true,
    verbose: true
  })
);

// plugins.push(
//   new webpack.HotModuleReplacementPlugin()
// );

const exportConfig = {
  entry: entrys,
  output: {
    path: config.devPath,
    filename: 'js/[name].js',
    chunkFilename: 'js/react/[name].chunk.js',
    publicPath: config.publicPath
  },
  devtool: 'inline-source-map',
  module: {
    strictExportPresence: true,
    noParse: [/moment.js/],
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|woff|svg|eot|ttf)$/,
        exclude: config.exclude,
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
              }
            }
          }
        ]
      },
      {
        test: /\.tpl$/,
        exclude: config.exclude,
        use: [
          {
            loader: 'babel-loader'
          },
          // {
          //   loader: 'eslint-loader',
          // },
          {
            loader: 'nodetpl-loader'
          }
        ]
      },
      {
        test: /\.(css)$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(less)$/,
        exclude: config.exclude,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: getLessLoader
        })
      },
      {
        test: /\.js[x]?$/,
        loaders: ['happypack/loader?id=happybabel']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.tpl', '.jsx'] /* 自动扩展文件后缀名，意味着我们require模块可以省略不写后缀名 */,
    alias: {
      '@business': config.contextPath + '/components/business',
      '@ui': config.contextPath + '/components/ui'
    } /* 勿删  模块别名定义，方便后续直接引用别名，无须多写长长的地址 */
    // enforceExtension: false
  },
  // externals: [{
  //   react: 'React',
  //   'react-dom': 'ReactDOM',
  //   antd: 'antd',
  // }],
  plugins: plugins
};

module.exports = exportConfig;
