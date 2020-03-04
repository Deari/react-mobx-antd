import React, { Component } from 'react';
import { Menu, Icon, Row, Col } from 'antd';
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { Link } from 'react-router-dom';

const Container = (WrappedComponent) => {
  @inject('appStore')
  @observer
  class RefsHOC extends React.Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return RefsHOC;
};

export default Container;
