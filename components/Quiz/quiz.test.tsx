import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import Quiz from './quiz';
import {configureStore} from '@reduxjs/toolkit';
import userSlice, {changeUser} from '../../redux/userSlice';
import {User} from 'firebase/auth';
import {Provider} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList} from '../../types/types';
import * as firestore from 'firebase/firestore';
import {QuerySnapshot} from 'firebase/firestore';
import {Alert} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {debug} from 'console';

type timeout = ReturnType<typeof global.setTimeout>;

jest.mock('firebase/firestore');

const flushPromises = () => new Promise((res) => process.nextTick(res));

const mockDefinition = {
  word: 'test0',
  notes: 'this is a note',
  partOfSpeech: 'noun',
  definition: 'test definition',
  synonyms: ['tral'],
  antonyms: ['conclusion'],
};

const mockDef = {
  id: '0',
  data: () => mockDefinition,
};
const mockData = {
  forEach: (cb) => {
    cb(mockDef);
    cb({id: '1', data: () => ({...mockDefinition, word: 'test1'})});
    cb({id: '2', data: () => ({...mockDefinition, word: 'test2'})});
    cb({id: '3', data: () => ({...mockDefinition, word: 'test3'})});
    cb({id: '4', data: () => ({...mockDefinition, word: 'test4'})});
  },
};

const mockNavigate = jest.fn();
const mockRoute = {
  params: {
    album: {
      name: 'All',
      editable: false,
      id: '1234',
    },
  },
} as RouteProp<RootStackParamsList, 'Quiz'>;

let props = {
  navigation: {
    navigate: mockNavigate,
  },
  route: mockRoute,
} as unknown as NativeStackScreenProps<RootStackParamsList, 'Quiz'>;

const mockStore = configureStore({reducer: {user: userSlice}});
mockStore.dispatch(changeUser({uid: '1234'} as User));

const preRender = () =>
  render(
    <Provider store={mockStore}>
      <Quiz {...props} />
    </Provider>
  );

describe('Quiz component', () => {
  let getDocs;
  beforeEach(() => {
    getDocs = jest
      .spyOn(firestore, 'getDocs')
      .mockResolvedValue(mockData as unknown as QuerySnapshot);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  //!Modal is always seen by the renderer, add 2 buttons
  it('should render the page', async () => {
    const {getByText, getAllByRole} = preRender();
    await waitFor(() => expect(getAllByRole('button')).toHaveLength(6));
    expect(getByText('Score: 0/0'));
  });
  describe('fetching words', () => {
    it('should fetch the words', async () => {
      const {getAllByRole} = preRender();
      await waitFor(() => expect(getAllByRole('button')).toHaveLength(6));
      expect(getDocs).toHaveBeenCalledTimes(1);
    });
    it('should fetch from All if no params', async () => {
      const coll = jest.spyOn(firestore, 'collection');
      //change the props to make sure album changes to All
      props = {...props, route: {params: null}} as NativeStackScreenProps<
        RootStackParamsList,
        'Quiz'
      >;
      const {getAllByRole} = preRender();
      await waitFor(() => expect(getAllByRole('button')).toHaveLength(6));
      expect(coll.mock.calls[0][4]).toBe('All');
      //revert the props back to original
      props = {...props, route: mockRoute};
    });
    it('should fetch from All if no params', async () => {
      const coll = jest.spyOn(firestore, 'collection');
      const {getAllByRole} = preRender();
      await waitFor(() => expect(getAllByRole('button')).toHaveLength(6));
      expect(coll.mock.calls[0][4]).toBe('1234');
    });
    it('should catch error on fetch', async () => {
      getDocs.mockRejectedValue({message: 'test error'});
      const alert = jest.spyOn(Alert, 'alert');
      preRender();
      await waitFor(() =>
        expect(alert).toHaveBeenCalledWith('Error', 'test error')
      );
    });
    it('should go back home if no user signed in', async () => { 
      //remove the user
      mockStore.dispatch(changeUser(null));
      const {unmount} = preRender();
      expect(mockNavigate).toBeCalledWith('Home')
      //unmount so store change doesn't update component
      unmount();
      //change user back 
      mockStore.dispatch(changeUser({uid: '1234'} as User))
     })
  });
  describe('Quiz game portion', () => {
    let floor;
    beforeEach(() => {
      jest
        .spyOn(Math, 'floor')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2)
        .mockReturnValueOnce(3)
        .mockReturnValueOnce(0)
        .mockReturnValue(0);
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.spyOn(Math, 'floor').mockRestore();
      jest.useRealTimers();
      jest.clearAllMocks();
    });
    it('should show the definition', async () => {
      const {findByText, getByText} = preRender();
      const def = await findByText('test definition');
      expect(def).toBeTruthy();
    });
    it('should color the buttons correctly', async () => {
      //mock floor to give us the answer on the first button
      const {getAllByRole, findByText} = preRender();
      await findByText('test definition');
      const buttons = getAllByRole('button');
      //all buttons should be grey before clicking
      expect(buttons[0]).toHaveStyle({backgroundColor: 'grey'});
      expect(buttons[1]).toHaveStyle({backgroundColor: 'grey'});
      expect(buttons[2]).toHaveStyle({backgroundColor: 'grey'});
      expect(buttons[3]).toHaveStyle({backgroundColor: 'grey'});
      fireEvent.press(buttons[1]);
      fireEvent.press(buttons[2]);
      fireEvent.press(buttons[3]);
      fireEvent.press(buttons[0]);
      expect(buttons[0]).toHaveStyle({backgroundColor: 'green'});
      expect(buttons[1]).toHaveStyle({backgroundColor: 'red'});
      expect(buttons[2]).toHaveStyle({backgroundColor: 'red'});
      expect(buttons[3]).toHaveStyle({backgroundColor: 'red'});
      act(() => jest.runAllTimers());
    });

    it('should change the score on wrong answer', async () => {
      const {findByText, getByText, getAllByRole} = preRender();
      await findByText('test definition');
      const buttons = getAllByRole('button');
      fireEvent.press(buttons[1]);
      expect(getByText('Score: 0/1')).toBeTruthy();
    });
    it('should change the score on right answer', async () => {
      const {findByText, getAllByRole, getByText, debug} = preRender();
      await findByText('test definition');
      const buttons = getAllByRole('button');
      fireEvent.press(buttons[0]);
      act(() => jest.runAllTimers());
      expect(getByText('Score: 1/1')).toBeTruthy();
    });
    it('should not give points after wrong answer', async () => {
      const {findByText, getByText, getAllByRole, debug} = preRender();
      await findByText('test definition');
      const buttons = getAllByRole('button');
      fireEvent.press(buttons[1]);
      expect(getByText('Score: 0/1')).toBeTruthy();
      fireEvent.press(buttons[0]);
      act(() => jest.runAllTimers());
      expect(getByText('Score: 0/1')).toBeTruthy();
    });
  });
  describe('game over', () => {
    beforeEach(() => {
      jest.spyOn(Math, 'floor').mockReturnValue(0);
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.restoreAllMocks();
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });
    it('should bring up the modal', async () => {
      const {findByText, getAllByRole, getByLabelText} = preRender();
      await findByText('test definition');
      const button = getAllByRole('button')[0];
      //get the answer right every time
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      expect(getByLabelText('menu modal')).toHaveProp('visible', true);
    });
    it('should quit when clicked', async () => {
      const {findByText, getAllByRole, getByLabelText} = preRender();
      await findByText('test definition');
      const button = getByLabelText('Quit');
      fireEvent.press(button);
      expect(mockNavigate).toHaveBeenCalledWith('Albums');
    });
    it('should quit to home when no album', async () => {
      props = {...props, route: {params: null}} as NativeStackScreenProps<
        RootStackParamsList,
        'Quiz'
      >;
      const {findByText, getAllByRole, getByLabelText} = preRender();
      await findByText('test definition');
      const button = getByLabelText('Quit');
      fireEvent.press(button);
      expect(mockNavigate).toHaveBeenCalledWith('Home');
      props = {...props, route: mockRoute};
    });
    it('should replay', async () => { 
      const {findByText, getByText, getAllByRole, getByLabelText} = preRender();
      await findByText('test definition');
      const button = getAllByRole('button')[0];
      //get the answer right every time
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      expect(getByText('Score: 5/5')).toBeTruthy();
      const playAgain = getByLabelText('Play Again');
      fireEvent.press(playAgain);
      expect(getByText('Score: 0/0')).toBeTruthy();
     })
     it('should not respond to buttons when game is over', async () => { 
      const {findByText, getByText, getAllByRole, getByLabelText, debug} = preRender();
      await findByText('test definition');
      const to = jest.spyOn(global, 'setTimeout');
      const button = getAllByRole('button')[0];
      //get the answer right every time
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      fireEvent.press(button);
      act(() => jest.runAllTimers());
      expect(getByLabelText('menu modal')).toHaveProp('visible',true)
      fireEvent.press(button)
      act(()=>jest.runAllTimers())
      expect(button).toHaveStyle({backgroundColor: 'grey'});
      expect(getByText('Score: 5/5')).toBeTruthy();
     })
  });
});
