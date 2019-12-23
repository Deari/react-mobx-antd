'use strict';
const postcssConfig = require('./postcss.config');
const ReadLessUtil = require('../plugins/read-less-util');

//加载css-loader
function getCSSLoader(...arg) {
  let sourceMap, configFile;

  arg.forEach(item => {
    if (/^\.\w+rc$/.test(item)) {
      configFile = item;
    } else {
      sourceMap = item;
    }
  });

  const theme = new ReadLessUtil({ configFile });

  let cssOptions = {
    // importLoaders: 2,
  };

  if (typeof sourceMap !== 'undefined') {
    Object.assign(cssOptions, {
      minimize: true,
      sourceMap,
    });
  }


  let loaders = [
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: Object.assign({}, postcssConfig, { sourceMap: true }),
    },
    {
      loader: require.resolve('less-loader'),
      options: {
        modifyVars: theme.read(),
      },
    },
  ];

  return loaders;
}

module.exports = getCSSLoader;
