import {fireEvent, render} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import InputLine from './InputLine';

const mockOnChange = jest.fn();
const mockSubmit = jest.fn();
const props = {
  label: 'Label',
  value: '',
  showError: false,
  error: '',
  style: {},
  onChange: mockOnChange,
  autoCompleteType: 'name',
  secureTextEntry: false,
  onSubmit: mockSubmit,
};

describe('Input Line Component', () => {
  it('should render with label', () => { 
    const {getByText} = render(<InputLine {...props}/>)
    expect(getByText('Label')).toBeTruthy();
   })
   it('should change the text', () => { 
    const {getByLabelText} = render(<InputLine {...props}/>)
    fireEvent.changeText(getByLabelText('Label'), 'test');
    expect(mockOnChange).toBeCalledWith('test')
    })
    it('should submit the changes', () => { 
      const {getByLabelText} = render(<InputLine {...props}/>);
      const input = getByLabelText('Label');
      fireEvent(input, 'onSubmitEditing');
      expect(mockSubmit).toBeCalled();
     })
});
