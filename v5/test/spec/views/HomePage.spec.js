import { Button } from 'antd';
import { configure, mount, render, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React, { useCallback, useState } from 'react';
import HomePage from '../../../src/views/HomePage';

configure({ adapter: new Adapter() });

const setup = () => {
  const props = {
    onAddClick: jest.fn(),
  };
  const wrapper = shallow(<HomePage {...props} />);
  return {
    props,
    wrapper,
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
    const DefaultButton = (props) => {
      const [loading, setLoading] = useState(false);

      const onClick = useCallback(() => {
        setLoading(!loading);
      }, [loading]);

      return (
        <Button loading={loading} onClick={onClick}>
          Button
        </Button>
      );
    };
    const wrapper = mount(<DefaultButton />);
    wrapper.simulate('click');
    expect(wrapper.find('.ant-btn-loading').length).toBe(1);
  });
});
