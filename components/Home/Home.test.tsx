import {act, fireEvent, render} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import Home from './Home';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList} from '../../types/types';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import userSlice, {changeUser} from '../../redux/userSlice';
import {store} from '../../redux/store';
import {User} from 'firebase/auth';
import albumSlice, { updateAlbums } from '../../redux/albumSlice';
import * as firestore from 'firebase/firestore'


const mockNavigate = jest.fn();
const mockStore = configureStore({
  reducer: {user: userSlice},
});
mockStore.dispatch(changeUser({uid: '1234'} as User));
//store.dispatch(updateAlbums([{name: 'Test Album', id: '1234', editable: true}]))

const props = {
  navigation: {
    navigate: mockNavigate,
  },
} as unknown as NativeStackScreenProps<RootStackParamsList, 'Home'>;

const preRender = () =>
  render(
    <Provider store={mockStore}>
      <Home {...props} />
    </Provider>
  );

describe('Home Page', () => {
  beforeEach(()=>{
    jest.clearAllMocks();
  })
  it('should render', () => { 
    const {getByLabelText} = preRender();
    expect(getByLabelText('Add Word')).toBeTruthy();
   })
   it('navigates on button press',()=>{
    const {getAllByRole} = preRender();
    const buttons =  getAllByRole('button');
    expect(buttons).toHaveLength(3)
    fireEvent.press(buttons[0]);
    expect(mockNavigate).toHaveBeenLastCalledWith('AddWord')
    fireEvent.press(buttons[1]);
    expect(mockNavigate).toHaveBeenLastCalledWith('Albums')
    fireEvent.press(buttons[2])
    expect(mockNavigate).toHaveBeenLastCalledWith('Quiz')
   })
   it('should show login page if no user',()=>{
    const {getByLabelText} = preRender();
    act(()=>{mockStore.dispatch(changeUser(null))});
    expect(getByLabelText('Log In')).toBeTruthy();

    act(()=>{mockStore.dispatch(changeUser({uid: '1234'} as User));})
   })
   it('should navigate on login buttons press', () => { 
    const {getByLabelText} = preRender();
    act(()=>{mockStore.dispatch(changeUser(null))});
    const log = getByLabelText('Log In')
    const create = getByLabelText('Create Account');
    fireEvent.press(log);
    expect(mockNavigate).toHaveBeenLastCalledWith('LogIn');
    fireEvent.press(create);
    expect(mockNavigate).toHaveBeenLastCalledWith('Create')

    act(()=>{mockStore.dispatch(changeUser({uid: '1234'} as User));})
    })
});
