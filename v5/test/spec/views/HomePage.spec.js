import { Button } from 'antd';
import { configure, mount, render, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import React, { Component } from 'react';
import HomePage from '../../../src/views/HomePage';
configure({ adapter: new Adapter() });

const setup = () => {
  const props = {
    onAddClick: jest.fn()
  };
  const wrapper = shallow(<HomePage {...props} />);
  return {
    props,
    wrapper
  };
};

describe('HomePage', () => {
  const { wrapper } = setup();
  it('HomePage Component should be render', () => {
    expect(wrapper.find('.container').length).toBe(1);
  });
});

describe('Button', () => {
  it('按钮测试', () => {
    const wrapper = render(<Button>测试</Button>);
    expect(wrapper).toMatchSnapshot();
  });

  it('测试加载中', () => {
    class DefaultButton extends Component {
      state = {
        loading: false
      };
      enterLoading = () => {
        this.setState({ loading: true });
      };
      render() {
        return (
          <Button loading={this.state.loading} onClick={this.enterLoading}>
            Button
          </Button>
        );
      }
    }
    const wrapper = mount(<DefaultButton />);
    wrapper.simulate('click');
    expect(wrapper.find('.ant-btn-loading').length).toBe(1);
  });
});

describe('not.arrayContaining', () => {
  const expected = ['Samantha'];

  it('matches if the actual array does not contain the expected elements', () => {
    expect(['Alice', 'Bob', 'Eve']).toEqual(expect.not.arrayContaining(expected));
  });
});
