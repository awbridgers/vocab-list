import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {configureStore} from '@reduxjs/toolkit';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import albumSlice, {updateAlbums} from '../../redux/albumSlice';
import {Album, RootStackParamsList} from '../../types/types';
import Albums from './albums';
import * as firestore from 'firebase/firestore';
import {Alert} from 'react-native';
import userSlice, {changeUser} from '../../redux/userSlice';
import {User} from 'firebase/auth';

jest.mock('firebase/firestore');

const mockNavigate = jest.fn();
const navigation = {
  navigate: mockNavigate,
} as unknown as NativeStackNavigationProp<RootStackParamsList, 'Albums'>;

const props = {
  navigation,
  route: {} as RouteProp<RootStackParamsList, 'Albums'>,
};

const albums: Album[] = [
  {name: 'All', editable: false, id: '1234'},
  {name: 'Test', editable: true, id: '4321'},
];

const preRender = () =>
  render(
    <Provider store={mockStore}>
      <Albums {...props} />
    </Provider>
  );

const mockStore = configureStore({
  reducer: {albums: albumSlice, user: userSlice},
});

describe('Albums component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      mockStore.dispatch(updateAlbums(albums));
      mockStore.dispatch(changeUser({uid: '1234'} as User));
    });
  });
  it('should load the screen', () => {
    const {getByText} = preRender();
    expect(getByText('Albums')).toBeTruthy();
  });
  it('should show the album cards', () => {
    const {getByText} = preRender();
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Test')).toBeTruthy();
  });
  it('should navigate when button clicked', () => {
    const {getAllByRole} = preRender();
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]);
    fireEvent.press(buttons[1]);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });
  it('should delete album', async () => {
    const del = jest.spyOn(firestore, 'deleteDoc').mockResolvedValue();
    const alert = jest.spyOn(Alert, 'alert');
    const {getByLabelText} = preRender();
    const button = getByLabelText('Delete');
    fireEvent.press(button);
    await act(() => alert.mock.calls[0][2][0].onPress());
    expect(del).toBeCalled();
  });
  it('should catch error on delete', async () => { 
    const del = jest.spyOn(firestore, 'deleteDoc').mockRejectedValue({message: 'fail'});
    const alert = jest.spyOn(Alert, 'alert');
    const {getByLabelText} = preRender();
    const button = getByLabelText('Delete');
    fireEvent.press(button);
    act(() => {alert.mock.calls[0][2][0].onPress()});
    await waitFor(()=>expect(alert).lastCalledWith('Error', 'fail'))
   })
   it('should cancel the delete', () => { 
    const del = jest.spyOn(firestore, 'deleteDoc')
    const log = jest.spyOn(console, 'log');
    const alert = jest.spyOn(Alert, 'alert');
    const {getByLabelText} = preRender();
    const button = getByLabelText('Delete');
    fireEvent.press(button);
    act(() => {alert.mock.calls[0][2][1].onPress()});
    expect(del).not.toBeCalled();
    expect(log).toBeCalledWith('Delete cancelled.')
    })
    it('should not have delete option if not editable',()=>{
      const newAlbums = [...albums];
      newAlbums[1] = {...albums[1], editable: false}
      mockStore.dispatch(updateAlbums(newAlbums));
      const {queryByLabelText} = preRender();
      const buttons = queryByLabelText('Delete');
      expect(buttons).toBeFalsy();
    })
});
