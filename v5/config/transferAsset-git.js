/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const webpackConfig = require('./webpack.prd');
const { exec } = require('child_process');
const {
  zipFilePath,
  zipFileName,
  prdAsset,
  sourcemapFilePath,
  sourcemapAsset,
  sourcemapFileName
} = require('./webpack-config/dir.config');
const packageJson = require('../package.json');
const request = require('request');
const zipdir = require('zip-dir');

const logger = (text, color = 'green') => console.log(chalk[color](text));

let scmRevision;
let userName;
let femapping;
const publishUrl = 'http://package.lietou.com/FileController/uploadFile.json';
const sourcemapPublishUrl = 'http://monitor.lietou.com/saveSourcemap';
function getCommitId() {
  logger('获取最新CommitId...', 'blue');
  return new Promise((resolve, reject) => {
    exec('git rev-parse --verify --short HEAD', (err, status) => {
      if (err) {
        logger('获取最新CommitId失败!!!', 'red');
        reject(err);
      } else {
        logger('获取最新CommitId成功.');
        scmRevision = status;
        resolve();
      }
    });
  });
}

function getUserInfo() {
  logger('获取用户姓名与邮箱...', 'blue');
  return new Promise((resolve, reject) => {
    exec('git config --local --list', (err, status) => {
      if (err) {
        logger('获取用户姓名与邮箱失败!!!', 'red');
        reject(err);
      } else {
        const match = status.match(/user.name=([^\n\r]+)/); // 全局git配置
        if (match) {
          logger('获取用户姓名与邮箱成功.');
          userName = match[1];
          resolve();
        } else {
          reject(new Error('请设置你的git账户与邮箱. ex: git config --local user.name=...'));
        }
      }
    });
  });
}

function isMaster() {
  logger('检测是否Master分支, 检测是否有未提交的更新...', 'blue');
  return new Promise((resolve, reject) => {
    exec('git status -sb', (err, status) => {
      if (err) {
        logger(status, 'red');
        reject(err);
      } else {
        const match = status.match(/^## master...origin\/master([^\n]*)\n?\r?([\s\S]*)/);
        if (match) {
          if (match[2]) {
            reject(new Error(`${match[2]} \n 有变更/新增的文件没有提交!!!`));
          } else if (match[1]) {
            reject(new Error('有本地更新没有提交到远程库!!!'));
          } else {
            logger('Master分支检测成功, 代码变更检测成功.');
            resolve();
          }
        } else {
          reject(new Error('不是Master分支!!!'));
        }
      }
    });
  });
}

function updatePackage(packages) {
  const ps = packages
    .replace(/\u001b\[\d+m/gi, '') // eslint-disable-line
    .split(/\s+/)
    .filter(str => /^@liepin/.test(str))
    .join(' ');
  if (!ps.length) {
    return;
  }
  return new Promise((resolve, reject) => {
    logger(`更新包:${ps}`);
    exec(`npm update ${ps}`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        logger(data);
        resolve();
      }
    });
  });
}
function checkModuleVersion() {
  logger('[@liepin/modules]版本号检查...', 'blue');
  const privateVersion = Object.keys(packageJson.dependencies).filter(key => key.startsWith('@liepin'));
  return new Promise((resolve, reject) => {
    exec(`cnpm outdated ${privateVersion.join(' ')}`, (err, status) => {
      if (err || /@liepin/.test(status)) {
        logger('[@liepin/modules]依赖模块有新版本，请更新版本', 'red');
        logger(status, 'red');
        logger('更新或忽略: y/n/i');
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', data => {
          if (/^(yes|y)\s*$/i.test(data)) {
            updatePackage(status)
              .then(() => {
                resolve();
                process.stdin.emit('end');
              })
              .catch(error => {
                logger(error, 'red');
                reject(error);
                process.stdin.emit('end');
              });
          } else if (/^(i|ignore)\s*$/i.test(data)) {
            resolve();
          } else {
            reject(status);
            process.stdin.emit('end');
          }
        });
      } else {
        logger('[@liepin/modules]版本号检查完成.');
        resolve();
      }
    });
  });
}

function beforeBuild() {
  return Promise.all([getUserInfo(), isMaster(), checkModuleVersion()]);
}

/**
 * 检查本地与远程版本是否一致
 * @returns {Promise<*[]>}
 */
function isSame() {
  const promises = ['git ls-remote origin -h HEAD|cut -f1', 'git rev-parse --verify HEAD'].map(
    cmd =>
      new Promise((resolve, reject) =>
        exec(cmd, (err, status) => {
          err ? reject(err) : resolve(status);
        })
      )
  );
  logger('对比远程库与本地库HEAD的CommitId...', 'blue');
  return Promise.all(promises).then(([remoteCommitID, localCommitID]) => {
    if (remoteCommitID === localCommitID) {
      logger('与远程库版本一致.');
    } else {
      return Promise.reject(new Error('本地库与远程库不同步!!!'));
    }
  });
}

/**
 * 编译
 * @returns {Promise<any>}
 */
function compile() {
  logger('开始编译...', 'blue');
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        logger('编译失败!!!', 'red');
        reject(err);
      } else if (stats.hasErrors()) {
        logger('编译失败!!!', 'red');
        reject(stats.toJson().errors);
      } else {
        process.stdout.write(
          `${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
          })}\n\n`
        );
        logger('编译成功.');
        resolve();
      }
    });
  });
}

/**
 * 检查map.json是否存在
 * @returns {Promise<any>}
 */
function checkMapJson() {
  logger('检测map.json...', 'blue');
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(prdAsset, './map.json'), 'utf8', (err, data) => {
      if (err) {
        logger('检测map.json失败!!!', 'red');
        reject(err);
      } else if (data) {
        logger('检测map.json完成.');
        femapping = JSON.parse(data);
        resolve();
      } else {
        reject(new Error('没找到map.json!!!'));
      }
    });
  });
}

function pack() {
  return new Promise((resolve, reject) => {
    logger(`开始打包文件:${prdAsset}...`, 'blue');
    zipdir(
      prdAsset,
      {
        saveTo: zipFilePath,
        filter: p => !/\/sourcemap$/.test(p)
      },
      err => {
        if (err) {
          logger('打包文件失败！', 'red');
          reject(err);
        } else {
          logger('打包文件完成.');
          resolve();
        }
      }
    );
  });
}

/**
 * 发布到打包中心
 * @returns {Promise<any>}
 */
function sender() {
  return new Promise((resolve, reject) => {
    logger(`开始同步: ${zipFilePath} 到打包中心...`);
    const data = Object.assign({
      src: prdAsset,
      femapping,
      projectName: packageJson.client.projectName,
      environment: 'online',
      userName,
      scmRevision,
      scmSource: packageJson.repository && packageJson.repository.url,
      scmLog: '',
      scmType: 'git',
      outputPath: path.dirname(zipFilePath),
      fileName: zipFileName,
      api: publishUrl
    });
    const formData = {
      file: {
        value: fs.createReadStream(zipFilePath),
        options: {
          filename: zipFileName,
          contentType: 'application/octet-stream'
        }
      },
      data: JSON.stringify(data)
    };
    try {
      request(
        {
          url: publishUrl,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          method: 'post',
          formData
        },
        (err, httpResponse, body) => {
          if (err) {
            logger('请求异常', 'red');
            reject(err);
          } else {
            try {
              const bodyJson = JSON.parse(body);
              if (bodyJson.flag === 1) {
                logger('同步到打包中心成功');
                resolve();
              } else {
                logger('同步到打包中心失败!!!', 'red');
                logger(JSON.stringify(bodyJson), 'red');
              }
            } catch (e) {
              logger('同步到打包中心失败', 'red');
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

function sourcemapPack() {
  return new Promise((resolve, reject) => {
    logger(`开始打包文件:${sourcemapAsset}...`, 'blue');
    zipdir(sourcemapAsset, { saveTo: sourcemapFilePath }, err => {
      if (err) {
        logger('打包sourcemap失败！', 'red');
        reject(err);
      } else {
        logger('打包sourcemap完成.');
        resolve();
      }
    });
  });
}
function sourcemapSender() {
  return new Promise((resolve, reject) => {
    logger(`开始同步: ${sourcemapFilePath} 到打包中心...`);
    const data = Object.assign({
      userName,
      femapping,
      src: sourcemapAsset,
      projectName: packageJson.client.projectName,
      fileName: sourcemapFileName
    });
    const formData = {
      file: {
        value: fs.createReadStream(sourcemapFilePath),
        options: {
          filename: sourcemapFileName,
          contentType: 'application/octet-stream'
        }
      },
      data: JSON.stringify(data)
    };
    try {
      request(
        {
          url: sourcemapPublishUrl,
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          method: 'post',
          formData
        },
        (err, httpResponse, body) => {
          if (err) {
            logger('请求异常', 'red');
            reject(err);
          } else {
            const resData = JSON.parse(body);
            try {
              if (resData.flag === 1) {
                logger('sourcemap同步至前端日志成功');
                resolve();
              } else {
                logger('sourcemap同步至前端日志失败!!!', 'red');
                logger(JSON.stringify(resData), 'red');
              }
            } catch (e) {
              logger('sourcemap同步至前端日志失败', 'red');
              reject(resData);
            }
          }
        }
      );
    } catch (e) {
      logger('sourcemap文件上传失败！不支持预上线上传sourcemap文件! 请切换host到其他环境', 'red');
      reject(e);
    }
  });
}

function removePack() {
  logger('开始删除本地缓存压缩包...');
  fs.unlinkSync(zipFilePath);
  fs.unlinkSync(sourcemapFilePath);
  logger('删除本地缓存压缩包成功');
  process.exit();
}

async function publish() {
  await getCommitId();
  await beforeBuild(); // 编译之前的各种并行校验
  await isSame(); // 检查本地commitId与远程库是否一致
  await compile(); // webpack编译
  await checkMapJson(); // 检查map.json
  await pack(); // zip打包
  await sender(); // 发送到打包中心
  await sourcemapPack(); // 打包sourcemap
  await sourcemapSender(); // 发送sourcemap
  await removePack(); // 删除本地zip文件
}

publish().catch(err => logger(err, 'red'));
