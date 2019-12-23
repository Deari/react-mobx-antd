const path = require('path');
const glob = require('glob');
const FontPluginsPlus = require('font-plugins-plus');
const webpack = require('webpack');
/* font处理 */
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
/* 公共模块打包 */
const config = require('./dir.config');
let plugins = [];
// 插件配置 font 处理
const IconfontFiles = [
  path.join(config.contextPath, 'fonts/src'), // src入口
  ...glob.sync(path.join(config.roots, 'node_modules/@liepin/**/fonts-src')) // 组件字体入口
];

plugins.push(
  new FontPluginsPlus({
    name: 'iconfont', // 字体图标库的名称
    to: path.join(config.contextPath, 'fonts'), //出口
    from: IconfontFiles, // 入口 数组或字符串路径
    cssPath: path.join(config.contextPath, 'common/index.css') // 编译后字体配置输出到指定css文件
  })
);
// DLL 动态连接
plugins.push(
  new webpack.DllReferencePlugin({
    context: __dirname,
    manifest: require('../../src/static/js/manifest.json')
  })
);

// 插件配置 打包公共模块
plugins.push(
  new CommonsChunkPlugin({
    name: 'common/vendors',
    minChunks: Infinity
    // names: ["common/common", "common/vendors"],
    // minChunks: 3 //多少重复引用打包common
  })
);

const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
plugins.push(new NamedModulesPlugin());

// 简化模块
const OccurrenceOrderPlugin = require('webpack/lib/optimize/OccurrenceOrderPlugin');

plugins.push(new OccurrenceOrderPlugin());

const DefinePlugin = require('webpack/lib/DefinePlugin');
plugins.push(
  new DefinePlugin({
    __DEBUG__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
  })
);

module.exports = plugins;
