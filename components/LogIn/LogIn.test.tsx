import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import LogIn from './LogIn';
import userSlice, { changeUser } from '../../redux/userSlice';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamsList} from '../../types/types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {User, UserCredential} from 'firebase/auth';
import * as auth from 'firebase/auth';

const mockReset = jest.fn();

jest.mock('firebase/auth', () => ({
  ...jest.requireActual('firebase/auth'),
  signInWithEmailAndPassword: jest.fn(),
}));

const navigation = {
  reset: mockReset,
} as any as NativeStackNavigationProp<RootStackParamsList, 'LogIn', undefined>;
const init = {reducer: {user: userSlice}}
let mockStore = configureStore(init);

const mockUserCred = {user: {uid: '12346'} as User} as UserCredential;
const props = {
  route: {} as RouteProp<RootStackParamsList, 'LogIn'>,
  navigation,
};

const preRender = () =>
  render(
    <Provider store={mockStore}>
      <LogIn {...props} />
    </Provider>
  );

describe('LogIn Component', () => {
  beforeEach(()=>{
    mockStore = configureStore(init);
  })
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should render the log in page', () => {
    const {getByText} = preRender();
    expect(getByText(/Sign In/i)).toBeDefined();
  });
  describe('changing input', () => {
    it('should change the email input', () => {
      const {getByLabelText} = preRender();
      const email = getByLabelText('Email');
      fireEvent(email, 'changeText', 'TestEmail');
      expect(email).toHaveProp('value', 'TestEmail');
    });
    it('should change the password input', () => {
      const {getByLabelText} = preRender();
      const pass = getByLabelText('Password');
      fireEvent(pass, 'changeText', 'TestPass');
      expect(pass).toHaveProp('value', 'TestPass');
    });
  });
  describe('logging in', () => {
    it('should log the user in', async () => {
      const log = jest
        .spyOn(auth, 'signInWithEmailAndPassword')
        .mockResolvedValue(mockUserCred);
      const {getByLabelText, getByRole} = preRender();
      const email = getByLabelText('Email');
      const pass = getByLabelText('Password');
      const button = getByRole('button');
      fireEvent(email, 'changeText', 'test@test.com');
      fireEvent(pass, 'changeText', 'password');
      fireEvent.press(button);
      expect(log).toBeCalled();
      
    });
    it('should catch and show email error', async () => {
      const log = jest
        .spyOn(auth, 'signInWithEmailAndPassword')
        .mockRejectedValue({message: 'invalid email'});
      const {findAllByText, getByLabelText, getByRole} = preRender();
      const email = getByLabelText('Email');
      const pass = getByLabelText('Password');
      const button = getByRole('button');
      fireEvent(email, 'changeText', 'test@test.com');
      fireEvent(pass, 'changeText', 'password');
      fireEvent.press(button);
      const error = await findAllByText('Invalid Email or Password');
      expect(error).toHaveLength(1);
    });
    it('should redirect on user', () => { 
      preRender();
      act(()=>{mockStore.dispatch(changeUser(mockUserCred.user))})
      expect(mockReset).toHaveBeenCalledWith({index:0, routes:[{name: 'Home'}]})
     })
    it('should catch and show password error', async () => {
      const log = jest
        .spyOn(auth, 'signInWithEmailAndPassword')
        .mockRejectedValue({message: 'password error'});
      const {findAllByText, getByLabelText, getByRole} = preRender();
      const email = getByLabelText('Email');
      const pass = getByLabelText('Password');
      const button = getByRole('button');
      fireEvent(email, 'changeText', 'test@test.com');
      fireEvent(pass, 'changeText', 'password');
      fireEvent.press(button);
      const error = await findAllByText('Invalid Email or Password');
      expect(error).toHaveLength(1);
    });
    it('should not redirect if no user', async () => {
      
      const log = jest
        .spyOn(auth, 'signInWithEmailAndPassword')
        .mockResolvedValue({user: null} as UserCredential);
      const {findAllByText, getByLabelText, getByRole} = preRender();
      const email = getByLabelText('Email');
      const pass = getByLabelText('Password');
      const button = getByRole('button');
      fireEvent(email, 'changeText', 'test@test.com');
      fireEvent(pass, 'changeText', 'password');
      fireEvent.press(button);
      await waitFor(() => {
        expect(mockReset).not.toHaveBeenCalled();
      });
    });
  });
});
