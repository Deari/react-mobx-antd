export default {
  path: '*',
  onEnter: (_, replaceState) => replaceState(null, '/view-404'),
  getComponent(nextState, cb) {
    require.ensure(
      [],
      require => {
        cb(null, require('../../views/NoMatch').default);
      },
      'NotFound'
    );
  }
};
