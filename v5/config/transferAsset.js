/**
 * Class TransferAsset
 * 打包文件,同步到打包中心
 * 调用方式
 * package.json.client is required!!!
 * const svn = require('../package.json').client;
 * new TransferAsset({
 *   svn: svn
 * });
 * 支持Promise链式调用
 * const svn = require('../package.json').client;
 * new TransferAsset({
 *   svn: svn
 * }).then(()=>{'after process'}).catch((err)=>{console.log(err)});
 *
 * */

const zipdir = require('zip-dir');
const request = require('request');

const fs = require('fs');
const path = require('path');
const os = require('os');
const execsync = require('child_process').execSync;

class TransferAsset {
  constructor(options) {
    this.options = Object.assign(
      {
        // src: '../asset',
        outputPath: os.tmpdir() || './',
        fileName: 'asset.zip',
        api: 'http://package.lietou.com/FileController/uploadFile.json'
      },
      options
    );

    const tasks = [
      this.isTrunk.bind(this),
      this.getUserName.bind(this),
      this.asset2zip.bind(this),
      this.syncAsset2PackCenter.bind(this),
      this.clear.bind(this)
    ];
    const handler = tasks.reduce((promise, task) => {
      return promise.then(task);
    }, Promise.resolve());
    return handler.catch(err => {
      this.clear();
      throw new Error(err);
    });
  }

  //remove tmp/asset.zip;
  clear() {
    fs.unlinkSync(path.join(this.options.outputPath, this.options.fileName));
  }

  //asset to asset.zip
  asset2zip() {
    return new Promise((resolve, reject) => {
      console.log('开始打包文件:' + this.options.src);

      zipdir(this.options.src, { saveTo: path.join(this.options.outputPath, this.options.fileName) }, function(
        err,
        buffer
      ) {
        if (err) {
          console.log('打包文件失败！');
          reject(err);
        } else {
          console.log('打包文件完成！');
          resolve();
        }
      });
    });
  }

  //同步代码到打包中心
  syncAsset2PackCenter() {
    return new Promise((resolve, reject) => {
      console.log('开始同步: ' + path.join(this.options.outputPath, this.options.fileName) + ' 到打包中心!');
      let data = Object.assign(
        {
          environment: 'online',
          userName: this.svnJson.userName,
          scmRevision: this.svnJson.Revision,
          scmSource: path.join(this.svnJson.URL.split('trunk')[0], 'trunk'),
          scmLog: '',
          scmType: 'svn'
          // 'femapping' : require('../asset/map.json')
        },
        this.options
      );

      let formData = {
        file: {
          value: fs.createReadStream(path.join(this.options.outputPath, this.options.fileName)),
          options: {
            filename: this.options.fileName,
            contentType: 'application/octet-stream'
          }
        },
        data: JSON.stringify(data)
      };
      try {
        request(
          {
            url: this.options.api,
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            method: 'post',
            formData: formData
          },
          function(err, httpResponse, body) {
            console.log(111 + err);
            if (err) {
              console.log('请求异常');
              reject(err);
            } else {
              try {
                body = JSON.parse(body);
                console.log(222, body);
                if (body.flag === 1) {
                  console.log('同步到打包中心成功:');
                  resolve();
                }
              } catch (e) {
                console.log('同步到打包中心失败:');
                console.log(body);
                reject(body);
              }
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  //检测主干开发
  isTrunk() {
    return new Promise((resolve, reject) => {
      const svnInfo = execsync('svn info').toString();
      const svnJson = {};
      svnInfo.split(/[\r\n]+/).forEach(info => {
        info = info.split(':');
        if (info.length > 1) {
          svnJson[info[0].replace(/\s+/g, '')] = info
            .slice(1)
            .join('')
            .replace(/^\s+/, '');
        }
      });
      if (svnJson.URL.indexOf('trunk') === -1) {
        console.log('检测失败，请切换到主干下打包发布！！！');
        reject('检测失败，请切换到主干下打包发布！！！');
        return;
      }
      this.svnJson = svnJson;
      resolve();
    });
  }

  //svn username
  getUserName() {
    return new Promise((resolve, reject) => {
      const svnAuth = execsync('svn auth').toString();
      svnAuth.split(/-+/).forEach(svn => {
        if (/hello liepin!/.test(svn)) {
          let ret = /Username:\s*([0-9a-zA-Z]+)/.exec(svn);
          this.svnJson.userName = ret[1];
        }
      });
      if (this.svnJson.userName) {
        resolve();
      } else {
        reject('未获取到SVN用户名，请联系Panym@liepin.com！');
      }
    });
  }
}

const config = require('./webpack-config/dir.config');
const svn = require('../package.json').client;
const assetPath = path.join(config.prdPath, '../');
const maping = fs.readFileSync(path.join(assetPath, './map.json'), 'utf-8');
if (maping) {
  new TransferAsset({
    projectName: svn.projectName,
    src: assetPath,
    femapping: JSON.parse(maping)
  });
} else {
  console.log('map.json is required！');
}

module.exports = TransferAsset;
