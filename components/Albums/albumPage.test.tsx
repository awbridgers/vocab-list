import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {Album, RootStackParamsList} from '../../types/types';
import {RouteProp} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import userSlice, {changeUser} from '../../redux/userSlice';
import AlbumPage from './wordList';
import {User} from 'firebase/auth';
import {Alert} from 'react-native';
import React from 'react';
import albumSlice, {updateAlbums} from '../../redux/albumSlice';
import * as firestore from 'firebase/firestore';
import {QuerySnapshot} from 'firebase/firestore';
import {check} from 'prettier';

const mockSubscribe = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchDelete = jest.fn();
const mockData = {
  forEach: (cb) => {
    cb({id: '2', data: () => ({...mockDefinition, word: 'space'})});
    cb({id: '3', data: () => ({...mockDefinition, word: 'space'})}),
      cb({id: '4', data: () => ({...mockDefinition, word: 'apple'})}),
      cb(mockDef);
  },
} as unknown as QuerySnapshot;

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  onSnapshot: jest.fn((ref, cb, error) => {
    cb(mockData);
    return mockSubscribe;
  }),
  updateDoc: jest.fn(),
  writeBatch: ()=>({
    delete:mockBatchDelete,
    commit: mockBatchCommit
  })
}));

const props = {
  navigation: {} as NativeStackNavigationProp<RootStackParamsList, 'AlbumPage'>,
  route: {
    key: 'test',
    name: 'AlbumPage',
    path: 'AlbumPage',
    params: {
      id: '1234',
    },
  } as RouteProp<RootStackParamsList, 'AlbumPage'>,
} as NativeStackScreenProps<RootStackParamsList, 'AlbumPage'>;

const albums: Album[] = [
  {name: 'All', editable: false, id: '4321'},
  {name: 'Test Album', editable: true, id: '1234'},
];

const store = configureStore({reducer: {user: userSlice, albums: albumSlice}});
//add a user
store.dispatch(changeUser({uid: 'test'} as User));
store.dispatch(updateAlbums(albums));

const mockDefinition = {
  word: 'test',
  notes: 'this is a note',
  partOfSpeech: 'noun',
  definition: 'a trial',
  synonyms: ['tral'],
  antonyms: ['conclusion'],
};

const mockDef = {
  id: '1',
  data: () => mockDefinition,
};

const preRender = () =>
  render(
    <Provider store={store}>
      <AlbumPage {...props} />
    </Provider>
  );

describe('album page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should render the page', () => {
    const {getByLabelText, debug} = preRender();
    expect(getByLabelText('Title')).toBeTruthy();
    expect(getByLabelText('Title')).toHaveTextContent('Test Album');
  });
  it('sets the data', async () => {
    const {findByText} = preRender();
    const word = await findByText('test');
    expect(word).toBeTruthy();
  });
  it('should not shorten POS', async () => {
    const {findAllByText} = preRender();
    const POS = await findAllByText('(noun)-');
    expect(POS[0]).toBeTruthy();
  });
  it('should shorten long POS', async () => {
    mockDefinition.partOfSpeech = 'adjective';
    const {findAllByText} = preRender();
    const text = await findAllByText('(adj)-');
    expect(text[0]).toBeTruthy();
    mockDefinition.partOfSpeech = 'noun';
  });
  it('should not fetch data if no user', async () => {
    const fetch = jest.spyOn(firestore, 'onSnapshot')
    act(() => {store.dispatch(changeUser(null))});
    const {getByRole} = preRender();
    expect(fetch).not.toBeCalled();
    expect(getByRole('list')).toHaveProp('data', []);
    act(() => {
      store.dispatch(changeUser({uid: '1245'} as User));
    });
  });
  it('should put the words in alphabetical order', () => {
    const {getByRole} = preRender();
    const list = getByRole('list');

    expect(list).toHaveProp('data', [
      {...mockDefinition, word: 'apple', id: '4'},
      {...mockDefinition, word: 'space', id: '2'},
      {...mockDefinition, word: 'space', id: '3'},
      {...mockDefinition, id: '1'},
    ]);
  });
  it('should catch error on fetch', () => { 
    const fetch = jest.spyOn(firestore, 'onSnapshot').mockImplementationOnce((ref, cb, error)=>{
      error({message:'fail'} as unknown as QuerySnapshot)
      return mockSubscribe
    })
    const alert = jest.spyOn(Alert, 'alert');
    preRender();
    expect(alert).toBeCalledWith('Error', 'fail')
   })
  describe('editing the page', () => {
    it('brings up the edit options', () => {
      const {getByLabelText, debug, getAllByLabelText} = preRender();
      fireEvent.press(getByLabelText('Edit'));
      expect(getByLabelText('Done')).toBeTruthy();
      expect(getByLabelText('edit title')).toBeTruthy();
      expect(getByLabelText('select all')).toBeTruthy();
      expect(getAllByLabelText('check box')).toHaveLength(4);
    });
    describe('change the title', () => {
      it('should open the modal', () => {
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        expect(modal).toHaveProp('visible', true);
      });
      it('should close the modal', () => {
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        expect(modal).toHaveProp('visible', true);
        fireEvent.press(getByLabelText('Cancel'));
        expect(modal).toHaveProp('visible', false);
      });
      it('should ask the user to confirm', () => {
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        fireEvent.changeText(getByLabelText('New Title'), 'New Title');
        fireEvent.press(getByLabelText('Accept'));
        expect(alert).toBeCalled();
        expect(alert.mock.calls[0][1]).toBe(
          'Change the name of Test Album to New Title?'
        );
      });
      it('should change the title', async () => {
        const update = jest.spyOn(firestore, 'updateDoc').mockResolvedValue({});
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        fireEvent.changeText(getByLabelText('New Title'), 'New Title');
        fireEvent.press(getByLabelText('Accept'));
        act(() => alert.mock.calls[0][2][0].onPress());
        expect(update).toBeCalled();
        await waitFor(() =>
          expect(getByLabelText('New Title')).toHaveProp('value', '')
        );
        expect(modal).toHaveProp('visible', false);
      });
      it('should catch error on title change', async () => {
        const update = jest
          .spyOn(firestore, 'updateDoc')
          .mockRejectedValue({message: 'fail'});
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        fireEvent.changeText(getByLabelText('New Title'), 'New Title');
        fireEvent.press(getByLabelText('Accept'));
        act(() => alert.mock.calls[0][2][0].onPress());
        expect(update).toBeCalled();
        await waitFor(() =>
          expect(alert).toHaveBeenLastCalledWith('Error', 'fail')
        );
      });
      it('should not change if title is blank', () => {
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        fireEvent.changeText(getByLabelText('New Title'), '');
        fireEvent.press(getByLabelText('Accept'));
        act(() => alert.mock.calls[0][2][0].onPress());
        expect(alert).toBeCalledWith('Name cannot be blank.');
      });
      it('should cancel change title', () => { 
        const alert = jest.spyOn(Alert, 'alert');
        const update = jest.spyOn(firestore, 'updateDoc')
        const {getByLabelText} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('edit title'));
        const modal = getByLabelText('change title modal');
        fireEvent.changeText(getByLabelText('New Title'), 'Test');
        fireEvent.press(getByLabelText('Accept'));
        act(() => alert.mock.calls[0][2][1].onPress());
        expect(update).not.toBeCalled()
       })
    });
    describe('deleting a word', () => {
      it('should (de)select all words', () => {
        const {getByLabelText, getAllByLabelText, debug} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        const selectAll = getByLabelText('select all');
        fireEvent(selectAll, 'click');
        expect(selectAll).toHaveProp('accessibilityState', {
          disabled: undefined,
          checked: true,
        });
        const checkBoxes = getAllByLabelText('check box');
        checkBoxes.forEach((box) =>
          expect(box).toHaveProp('accessibilityState', {
            disabled: undefined,
            checked: true,
          })
        );
        fireEvent(selectAll, 'click');
        expect(selectAll).toHaveProp('accessibilityState', {
          disabled: undefined,
          checked: false,
        });
        checkBoxes.forEach((box) =>
          expect(box).toHaveProp('accessibilityState', {
            disabled: undefined,
            checked: false,
          })
        );
      });
      it('should (de)select single words', () => { 
        const {getByLabelText, getAllByLabelText, debug} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        const checks = getAllByLabelText('check box');
        expect(checks[0]).toHaveProp('accessibilityState', {
          disabled: undefined,
          checked: false,
        })
        fireEvent(checks[0],'click');
        expect(checks[0]).toHaveProp('accessibilityState', {
          disabled: undefined,
          checked: true,
        })
        fireEvent(checks[0],'click');
        expect(checks[0]).toHaveProp('accessibilityState', {
          disabled: undefined,
          checked: false,
        })
      })
      it('should show the trash can/edit title icon', () => {
        const {getByLabelText, getAllByLabelText, getByTestId, queryByTestId} =
          preRender();
        expect(queryByTestId('trashIcon')).toBeFalsy();
        expect(queryByTestId('editIcon')).toBeFalsy();
        fireEvent.press(getByLabelText('Edit'));
        expect(getByTestId('trashIcon')).toBeTruthy();
        expect(getByTestId('editIcon')).toBeTruthy();
      });
      it('should change color of trash can if a word is selected', () => {
        const off = [
          {color: 'grey', fontSize: 32},
          undefined,
          {fontFamily: 'feather', fontStyle: 'normal', fontWeight: 'normal'},
          {},
        ];
        const on = [...off];
        on[0] = {color: 'red', fontSize: 32};
        const {getByLabelText, getAllByLabelText, getByTestId} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        const trash = getByTestId('trashIcon');
        const checks = getAllByLabelText('check box');
        expect(trash).toHaveStyle(off);
        fireEvent(checks[0], 'click');
        expect(trash).toHaveStyle(on);
      });
      it('should not allow delete if no word selected', () => {
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText, getAllByLabelText, getByTestId} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        fireEvent.press(getByLabelText('delete word'));
        expect(alert).toBeCalledWith(
          'Select a Word first.',
          'You must select one or more words to delete first.'
        );
      });
      it('should delete word', async () => { 
        mockBatchCommit.mockResolvedValue({})
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText, getAllByLabelText, getByTestId} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        const check = getAllByLabelText('check box');
        fireEvent(check[0], 'click');
        fireEvent(check[1], 'click');
        fireEvent.press(getByLabelText('delete word'));
        act(()=>alert.mock.calls[0][2][0].onPress());
        expect(mockBatchDelete).toBeCalledTimes(2);
        expect(mockBatchCommit).toBeCalledTimes(1);
        await waitFor(()=>expect(check[0]).toHaveProp('accessibilityState', {
          disabled: undefined,
          checked: false,
        }))
      })
      it('should catch error on delete', async () => { 
        mockBatchCommit.mockRejectedValue({message: 'fail'})
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText, getAllByLabelText, getByTestId} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        const check = getAllByLabelText('check box');
        fireEvent(check[0], 'click');
        fireEvent(check[1], 'click');
        fireEvent.press(getByLabelText('delete word'));
        act(()=>alert.mock.calls[0][2][0].onPress());
        expect(mockBatchDelete).toBeCalledTimes(2);
        expect(mockBatchCommit).toBeCalledTimes(1);
        await waitFor(()=>expect(alert).lastCalledWith('Error', 'fail'))
       })
       it('should cancel deleting word', () => { 
        const alert = jest.spyOn(Alert, 'alert');
        const {getByLabelText, getAllByLabelText, getByTestId} = preRender();
        fireEvent.press(getByLabelText('Edit'));
        const check = getAllByLabelText('check box');
        fireEvent(check[0], 'click');
        fireEvent(check[1], 'click');
        fireEvent.press(getByLabelText('delete word'));
        act(()=>alert.mock.calls[0][2][1].onPress());
        expect(mockBatchDelete).not.toHaveBeenCalled();
        expect(mockBatchCommit).not.toHaveBeenCalled();
        })
    });
  });
  it('should unsubscirbe', () => { 
    const {unmount} = preRender();
    unmount();
    expect(mockSubscribe).toBeCalled();
    
   })
});
