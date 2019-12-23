import React, { Component } from 'react';
import { Menu, Icon, Row, Col } from 'antd';
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { Link } from 'react-router';

const Container = WrappedComponent => {
  @inject('appStore')
  @observer
  class RefsHOC extends React.Component {
    render() {
      return <WrappedComponent {...props} />;
    }
  }
  return RefsHOC;
};

export default Container;
