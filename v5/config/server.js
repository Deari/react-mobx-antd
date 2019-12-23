/**
 * Created  17/11/14.
 */
const path = require('path');
const express = require('express');
const mime = require('mime');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const devConfig = require('./webpack.dev');
const dirConfig = require('./webpack-config/dir.config');

let compiler = webpack(devConfig);

let devServer = {
  contentBase: dirConfig.devAsset,
  // publicPath: 'fe-rpo-pc/v5',
  port: 3000,
  // quiet: false, //控制台中不输出打包的信息
  historyApiFallback: true, //不跳转
  // inline: true,//实时刷新无效,命令行配置有效
  hot: true, //热启动
  lazy: false, //懒加载,
  stats: {
    colors: true,
    children: true,
    modules: false,
    chunks: false,
    chunkModules: false
  },
  watchOptions: {
    ignored: /node_modules(?!\/\_?@liepin|\/\_?@liepin\/\.*)/
  },
  //反向代理
  proxy: {
    // '/http://chping.site/*':{
    //   target:'http:localhost:3000',
    //   pathRewrite: {
    //     '^/http://chping.site/':''
    //   }
    // }
  }
};

let app = express();
app.use('/fe-*-*/v*/', function(req, res, next) {
  // server content
  let filename = req.originalUrl.replace(/\/fe-[^-]+-(pc|h5)\/v[\d]+/, '');
  filename = path.join(compiler.outputPath, filename);
  // let content = compiler.outputFileSystem.readFileSync(filename);
  let content;
  try {
    content = compiler.outputFileSystem.readFileSync(filename);
  } catch (err) {
    content = compiler.outputFileSystem.readFileSync(filename.replace(/^(.*)\.(\w{8})(.*)/, '$1$3'));
  }
  res.setHeader('Content-Type', mime.getType(filename) + '; charset=UTF-8');
  res.setHeader('Content-Length', Buffer.from(content).length);
  res.statusCode = res.statusCode || 200;
  if (res.send) res.send(content);
  else res.end(content);
});
app.use(webpackDevMiddleware(compiler, devServer));

// app.use(require('webpack-hot-middleware')(compiler, {
//   path: '/__webpack_hmr',
//   heartbeat: 10 * 1000
// }));

app.listen(devServer.port, function(err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(`http://localhost:${devServer.port}/`);
  }
});
