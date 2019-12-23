const path = require('path');
const glob = require('glob');
const config = require('./dir.config');
// 遍历入口文件
const files = [
  ...glob.sync(path.join(config.contextPath, 'common/index.js')), /* common */
  ...glob.sync(path.join(config.contextPath, 'common/js/header.js')), /* header */
  ...glob.sync(path.join(config.contextPath, 'common/js/footer.js')), /* footer */

  ...glob.sync(path.join(config.contextPath, 'pages?(.?(*))/*/index.js')), /* pages 入口 */
  // ...glob.sync(path.join(config.contextPath, 'views?(.?(*))/*/index.js')), /* react 入口 */
];

module.exports = files;
