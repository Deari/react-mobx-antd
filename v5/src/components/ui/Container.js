import { inject, observer } from 'mobx-react';
import React from 'react';

const Container = (WrappedComponent) => {
  return inject('appStore')(
    observer((props) => {
      return <WrappedComponent {...props} />;
    }),
  );
};

export default Container;
