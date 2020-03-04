import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory, Router } from 'react-router';
import routes from '../../routes';
import stores from '../../stores';
import './index.less';

configure({ enforceActions: 'observed' });

ReactDOM.render(
  <Provider {...stores}>
    <ConfigProvider locale={zhCN}>
      <Router history={browserHistory} routes={routes} />
    </ConfigProvider>
  </Provider>,
  document.getElementById('{{name}}'),
);
