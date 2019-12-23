import ajax from '@liepin/ajax';

function isSameOrigin(str) {
  if (str.indexOf('//') === -1) {
    return true;
  }

  const reg = /^https?:/i;
  if (reg.test(str)) {
    str = str.replace(reg, '');
  }

  return str.match(/^\/\/([^\/]+)\//i)[1] === window.document.domain;
}

/**
 * 返回数据统一处理
 * @param data
 * @returns {data, flag, msg}
 * data 返回数据
 * flag 1=成功，其他失败
 * msg 提示信息， 一般为错误信息
 */
function initialParse(api = {}) {
  if (api === null) {
    return {};
  }
  return api;
}

export default ({
  url,
  sameOrigin = isSameOrigin(url),
  data = {},
  type,
  errorMsg = '与服务器交互失败!',
  warnMsg,
  parse = initialParse,
  message,
  callback
}) => {
  const options = {
    url,
    data,
    dataType: sameOrigin ? 'json' : 'jsonp',
    type: type || sameOrigin ? 'POST' : 'GET',
    cache: false
  };

  if (typeof callback !== 'function') {
    return new Promise((reslove, reject) => {
      ajax(
        Object.assign({}, options, {
          success(api) {
            const { flag, msg, data: restful } = parse(api);
            if (flag === 1) {
              reslove(restful);
              return;
            }

            if (warnMsg && message && message.warning) {
              message.warning(msg || warnMsg);
              return;
            }

            if (message && message.error) {
              message.error(msg || errorMsg);
              return false;
            }
          },
          error(msg) {
            message.error(errorMsg);
            reject(errorMsg);
          }
        })
      );
    });
  }

  return ajax(
    Object.assign({}, options, {
      success(api) {
        const { flag, msg, data: restful } = parse(api);
        if (flag === 1) {
          callback && callback(null, restful);
        } else if (api.code === '10028_30011') {
          callback && callback(null, api, true);
        } else {
          callback && callback(msg || errorMsg);
        }
      },
      error() {
        callback && callback(errorMsg);
      }
    })
  );
};
