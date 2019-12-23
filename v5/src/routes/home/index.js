import onEnter from '../_util/enter';

export default {
  path: 'index',
  onEnter: () => onEnter('首页'),
  getComponent(nextState, cb) {
    require.ensure(
      [],
      require => {
        cb(null, require('../../views/HomePage').default);
      },
      'Home'
    );
  }
};
