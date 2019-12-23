const path = require('path');
const config = require('../webpack-config/dir.config');
class MapWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    const self = this;
    const mapJson = {};
    const regPath = /^(static)\//;
    compiler.plugin("done", function (stats) {
      let assets = stats.toJson().assets;
  
      assets.forEach(v => {
        let exts = path.extname(v.name);
        // if (v.chunkNames.length) {
        //   mapJson[path.join(config.version,v.chunkNames + exts)] = path.join(config.version,v.name);
        // } else if (regPath.test(v.name)) {
        //   let key = v.name.replace(exts, '').replace(/\.[a-z0-9]+$/, '') + exts;
        //   mapJson[path.join(config.version,key)] = path.join(config.version,v.name);
        // }

        if (v.chunkNames.length || regPath.test(v.name)) {
          let key = v.name.replace(exts, '').replace(/\.[a-z0-9]+$/, '') + exts;
          mapJson[path.join(config.version,key)] = path.join(config.version,v.name);
        }

      });
      
      let targetFile = this.outputFileSystem.join(this.outputPath, self.options.targetFile);
      this.outputFileSystem.writeFile(targetFile, JSON.stringify(mapJson, '', 2));
      self.options.callback && self.options.callback(mapJson);
    });
  };
}

module.exports = MapWebpackPlugin;