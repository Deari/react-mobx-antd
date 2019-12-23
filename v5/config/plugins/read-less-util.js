'use strict';

const path = require('path');
const fs = require('fs');

const stripJsonComments = require('strip-json-comments');
const parseJSON = require('parse-json');

class ReadLessUtil {
  constructor(options = {}) {
    const {
      configFile = '.themeconfigrc',
      cwd = process.cwd(),
    } = options;

    this.options = Object.assign(options, { configFile, cwd });
  }

  paths() {
    const { cwd } = this.options;
    const appDirectory = fs.realpathSync(cwd);

    function resolveApp(relativePath) {
      return path.resolve(appDirectory, relativePath);
    }

    return {
      resolveApp,
      appDirectory,
    };
  }

  // 读取.themeconfigrc文件
  getConfig() {
    const paths = this.paths();
    const { configFile } = this.options;

    const rcConfig = paths.resolveApp(configFile);
    const jsConfig = paths.resolveApp(`${configFile}.js`);

    if (fs.existsSync(rcConfig)) {
      if (process.env.NODE_ENV === 'development' && fs.existsSync(jsConfig)) {
        console.error(`Config error: You must delete ${rcConfig} if you want to use ${jsConfig}`);
      }
      return parseJSON(stripJsonComments(fs.readFileSync(rcConfig, 'utf-8')), configFile);
    } else if (fs.existsSync(jsConfig)) {
      return require(jsConfig);  // eslint-disable-line
    } else {
      return {};
    }
  }

  getLessVariables(file) {
    let variables = {};
    let self = this;
    fs.readFileSync(file, 'utf-8').split('\n').forEach(function (item) {
      if (item.indexOf('//') > -1 || item.indexOf('/*') > -1) {
        return
      }

      if (item.indexOf('@import') > -1) {
        let filename = item.replace(';', '').replace('\r', '').replace('@import', '').replace(/^\s+|\s+$/g, '').replace(/\"|\'/g, '');
        filename = path.resolve(path.dirname(file), filename);
        if (!filename.endsWith('.less')) {
          filename += '.less';
        }
        return Object.assign(variables, self.getLessVariables(filename));
      }

      const _pair = item.split(':');
      if (_pair.length < 2) return;
      const key = _pair[0].replace('\r', '').replace('@', '');
      if (!key) return;
      variables[key] = _pair[1].replace(';', '').replace('\r', '').replace(/^\s+|\s+$/g, '');
    });
    return variables;
  }

  // 读取theme主题
  read() {
    const { cwd } = this.options;

    const { theme } = this.getConfig();


    if (theme) {
      if (typeof theme === 'string') {
        const themeFile = path.resolve(cwd, theme);

        try {
          const themeConfig = require(themeFile);
          return typeof themeConfig === 'function' ? themeConfig() : themeConfig;
        } catch (e) {
          return this.getLessVariables(themeFile);
        }
      }
      return theme;
    }

    return {};
  }
}

module.exports = ReadLessUtil;
