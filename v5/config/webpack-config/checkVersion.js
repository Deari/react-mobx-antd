const execsync = require('child_process').execSync;
const version = require('../../package');
console.log('[@liepin/modules]版本号检查...');
let privateVersion = Object.keys(version.dependencies).filter(key => key.startsWith('@liepin'));
let ret = execsync('cnpm outdated ' + privateVersion.join(' '));
let reg = /@liepin/;
if (reg.test(ret.toString())) {
  console.log('[@liepin/modules]依赖模块有新版本，请更新版本');
  console.log(ret.toString());
  process.exit(1);
}
