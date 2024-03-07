import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import Button from './Button';

const props = {
  height: 100,
  width: 100,
  onPress: jest.fn(),
  text: 'Test Button',
  bgColor: 'blue',
  fontSize: 20,
};

describe('custom button componenet', () => {
  it('should render the button', () => {
    const {getByText} = render(<Button {...props} />);
    expect(getByText('Test Button')).toBeDefined();
  });
  it('should run the onPress function', () => {
    const {getByRole} = render(<Button {...props} />);
    const button = getByRole('button');
    fireEvent(button, 'onPress');
    expect(props.onPress).toHaveBeenCalled();
  });
  it('should style the button', () => {
    const {getByRole} = render(<Button {...props} />);
    const button = getByRole('button');
    expect(button).toHaveStyle({
      height: 100,
      width:100,
      backgroundColor: 'blue',
      borderRadius:8,
      justifyContent: 'center',
      alignItems: 'center'
    })
  });
  it('should have the fontSize given', () => { 
    const {getByText} = render(<Button {...props} />);
    expect(getByText('Test Button')).toHaveStyle({fontSize: 20})
   })
});
