import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import Create from './Create';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {RootStackParamsList} from '../../types/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import word from '../../redux/wordSlice';
import * as auth from 'firebase/auth';
import * as firestore from 'firebase/firestore';
import * as reactRedux from 'react-redux';
import {User, UserCredential} from 'firebase/auth';
import {Alert} from 'react-native';
import UserSlice, {changeUser} from '../../redux/userSlice';

const mockDispatch = jest.fn();
const mockReset = jest.fn();

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  createUserWithEmailAndPassword: jest.fn(),
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const mockDoc = {} as firestore.DocumentReference;

//only need 1 navigation method, mock type to match
const navigation = {
  reset: mockReset,
} as any as NativeStackNavigationProp<RootStackParamsList, 'Create', undefined>;
const props = {
  route: {} as RouteProp<RootStackParamsList, 'Create'>,
  navigation,
};
const mockStore = configureStore({reducer: {user: UserSlice}});
const mockUserCred = {user: {uid: '12346'} as User} as UserCredential;

const preRender = () =>
  render(
    <Provider store={mockStore}>
      <Create {...props} />
    </Provider>
  );

describe('Create Account Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockReset.mockClear();
  });
  it('should render the page', () => {
    const {getByText} = preRender();
    expect(getByText('Email')).toBeDefined();
  });
  it('should show error on password mismatch', () => {
    const {getByLabelText, queryByText, getByRole} = preRender();
    const pass = getByLabelText('Password');
    const repeat = getByLabelText('Confirm Password');
    fireEvent.changeText(pass, 'a');
    fireEvent.changeText(repeat, 'b');
    fireEvent.press(getByRole('button'));
    expect(queryByText('Passwords do not match.')).toBeDefined();
  });
  describe('creating user', () => {
    beforeEach(() => {
      const doc = jest.spyOn(firestore, 'doc').mockReturnValue(mockDoc);
      const setDoc = jest.spyOn(firestore, 'setDoc').mockResolvedValue();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    describe('showing Errors', () => {
      it('should create user', async () => {
        const {getByLabelText, queryByText, getByRole, debug} = preRender();
        const create = jest
          .spyOn(auth, 'createUserWithEmailAndPassword')
          .mockResolvedValue(mockUserCred);
        const pass = getByLabelText('Password');
        const repeat = getByLabelText('Confirm Password');
        const email = getByLabelText('Email');
        fireEvent.changeText(pass, 'a');
        fireEvent.changeText(repeat, 'a');
        fireEvent.changeText(email, 'test');
        fireEvent.press(getByRole('button'));
        await waitFor(() => expect(create).toBeCalled());
      });
      it('should catch errors on creation', async () => {
        const create = jest
          .spyOn(auth, 'createUserWithEmailAndPassword')
          .mockRejectedValue({message: 'Test Error'});
        const {getByLabelText, debug, getByRole, findAllByText} = preRender();
  
        const pass = getByLabelText('Password');
        const repeat = getByLabelText('Confirm Password');
        const email = getByLabelText('Email');
        fireEvent.changeText(pass, 'a');
        fireEvent.changeText(repeat, 'a');
        fireEvent.changeText(email, 'test');
        fireEvent.press(getByRole('button'));
        const error = await findAllByText('Test Error');
        expect(error).toHaveLength(1);
      });
      it('should catch errors with word match', async () => {
        const create = jest
          .spyOn(auth, 'createUserWithEmailAndPassword')
          .mockRejectedValue({message: 'password match'});
        const {getByLabelText, debug, getByRole, findAllByText} = preRender();
  
        const pass = getByLabelText('Password');
        const repeat = getByLabelText('Confirm Password');
        const email = getByLabelText('Email');
        fireEvent.changeText(pass, 'a');
        fireEvent.changeText(repeat, 'a');
        fireEvent.changeText(email, 'test');
        fireEvent.press(getByRole('button'));
        const error = await findAllByText('password match');
        expect(error).toHaveLength(2);
      });
      it('should catch errors for password', async () => {
        const {getByLabelText, debug, getByRole, findAllByText} = preRender();
  
        const pass = getByLabelText('Password');
        const repeat = getByLabelText('Confirm Password');
        const email = getByLabelText('Email');
        fireEvent.changeText(pass, 'a');
        fireEvent.changeText(repeat, 'b');
        fireEvent.changeText(email, 'test');
        fireEvent.press(getByRole('button'));
        const error = await findAllByText('Passwords do not match.');
        expect(error).toHaveLength(1);
      });
      it('should catch errors on email', async () => {
        const create = jest
          .spyOn(auth, 'createUserWithEmailAndPassword')
          .mockRejectedValue({message: 'Email Error'});
        const {getByLabelText, debug, getByRole, findAllByText} = preRender();
  
        const pass = getByLabelText('Password');
        const repeat = getByLabelText('Confirm Password');
        const email = getByLabelText('Email');
        fireEvent.changeText(pass, 'a');
        fireEvent.changeText(repeat, 'a');
        fireEvent.changeText(email, 'test');
        fireEvent.press(getByRole('button'));
        const error = await findAllByText('Email Error');
        expect(error).toHaveLength(1);
      });
      it('should catch errors on pass', async () => {
        const create = jest
          .spyOn(auth, 'createUserWithEmailAndPassword')
          .mockRejectedValue({message: 'Password Error'});
        const {getByLabelText, debug, getByRole, findAllByText} = preRender();
  
        const pass = getByLabelText('Password');
        const repeat = getByLabelText('Confirm Password');
        const email = getByLabelText('Email');
        fireEvent.changeText(pass, 'a');
        fireEvent.changeText(repeat, 'a');
        fireEvent.changeText(email, 'test');
        fireEvent.press(getByRole('button'));
        const error = await findAllByText('Password Error');
        expect(error).toHaveLength(1);
      });
    });
    it('should not set the user if there is an issue', async () => {
      jest
        .spyOn(firestore, 'setDoc')
        .mockRejectedValue({message: 'test error'});
      const alert = jest.spyOn(Alert, 'alert');
      const {getByLabelText, queryByText, getByRole, debug} = preRender();
      const create = jest
        .spyOn(auth, 'createUserWithEmailAndPassword')
        .mockResolvedValue(mockUserCred);
      const pass = getByLabelText('Password');
      const repeat = getByLabelText('Confirm Password');
      const email = getByLabelText('Email');
      fireEvent.changeText(pass, 'a');
      fireEvent.changeText(repeat, 'a');
      fireEvent.changeText(email, 'test');
      fireEvent.press(getByRole('button'));
      await waitFor(()=>{
        expect(queryByText('test error')).toBeTruthy();
      });
    });
    describe('redirect', () => {
      afterEach(() => {
        act(() => {
          mockStore.dispatch(changeUser(null));
        });
      });
      it('should alert and redirect once user is created', async () => {
        const {getByLabelText, queryByText, getByRole, debug} = preRender();
        const alert = jest.spyOn(Alert, 'alert');
        act(() => {
          mockStore.dispatch(changeUser(mockUserCred.user));
        });
        await waitFor(() => {
          expect(mockReset).toHaveBeenCalled();
          expect(alert).toHaveBeenCalledWith('Your account has been created');
        });
      });
      it('should not redirect if user is not changed', async () => {
        const {getByLabelText, queryByText, getByRole, debug} = preRender();
        const alert = jest.spyOn(Alert, 'alert');
        act(() => {
          mockStore.dispatch(changeUser(null));
        });
        await waitFor(() => {
          expect(mockReset).not.toHaveBeenCalled();
          expect(alert).not.toHaveBeenCalledWith(
            'Your account has been created'
          );
        });
      });
    });
  });
});
