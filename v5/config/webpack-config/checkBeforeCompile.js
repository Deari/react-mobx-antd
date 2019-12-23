// require('./svnUp');
const execsync = require('child_process').execSync;
const chalk = require('chalk');
const version = require('../../package');

const logger = (text, color = 'green') => console.log(chalk[color](text));
logger('[@liepin/modules]版本号检查...111');

let privateVersion = Object.keys(version.dependencies).filter((key) => key.startsWith('@liepin'));
let ret = execsync('cnpm outdated ' + privateVersion.join(' '));
let reg = /@liepin/;
if (reg.test(ret.toString())) {
  logger('[@liepin/modules]依赖模块有新版本，请更新版本');
  console.log(ret.toString());
  autoUpdatePackage(ret.toString());
}

function autoUpdatePackage(str){
  logger('是否将包都更新？(y/n)','blue');
  process.stdin.setEncoding("utf8");
  process.stdin.on('data', async data => {
    if(/yes|y/i.test(data)){
      let exeArr = [];
      for(let v of toJson(str)){
        logger(`正在更新${v.package}, 请等待...`,'blue');
        let exeResult = await exe(`npm update ${v.package}`);
        if(exeResult){
          logger(`${v.package}包更新成功！`,'blue');
        }else{
          logger(`${v.package}包更新失败！`,'red');
        }
        exeArr.push(exeResult);
      }
      
      if(exeArr.some(v=>!v)){
        process.exit(1);
      }else{
        
      } 
    }else{
      process.exit();
    }
  });
  function toJson(str){
    let arr = str.match(/[^\n\r]+/gi) || [];
    if(arr.length===0) return;
    arr.shift();
    return arr.map(v=> {
      let _arr = v.match(/[^\s]+/gi) || [];
      return {
        package: _arr[0],
        current: _arr[1],
        wanted: _arr[2],
        latest: _arr[3]
      }
    });
  }
  function exe(command){
    return new Promise((resolve, reject)=> {
      try{        
        let result = execsync(command);
        resolve(true);
        console.log(result.toString());            
      }catch(e){
        resolve(false);
        //process.exit(e);
      }
    });
  }
}