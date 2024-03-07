import React from 'react';
import {Alert} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import AddWord from './addWord';
import {configureStore} from '@reduxjs/toolkit';
import userSlice, {changeUser} from '../../redux/userSlice';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {Album, RootStackParamsList} from '../../types/types';
import '@testing-library/jest-native/extend-expect';
import albumSlice, {updateAlbums} from '../../redux/albumSlice';
import * as firestore from 'firebase/firestore';
import {DocumentReference} from 'firebase/firestore';
import {User} from 'firebase/auth';
import {writeBatch} from 'firebase/firestore';

const api = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const store = configureStore({reducer: {user: userSlice, albums: albumSlice}});
//add user and albums to the store
const albums: Album[] = [
  {name: 'All', editable: false, id: 'All'},
  {name: 'Test', editable: true, id: '4321'},
];
store.dispatch(updateAlbums(albums));
store.dispatch(changeUser({uid: 123456} as unknown as User));
//mock data
const unmockedFetch = global.fetch;
const mockDictionaryData = [
  {
    word: 'hello',
    phonetic: 'həˈləʊ',
    phonetics: [
      {
        text: 'həˈləʊ',
        audio:
          '//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3',
      },
      {
        text: 'hɛˈləʊ',
      },
    ],
    origin: 'early 19th century: variant of earlier hollo ; related to holla.',
    meanings: [
      {
        partOfSpeech: 'exclamation',
        definitions: [
          {
            definition: 'used as a greeting or to begin a phone conversation.',
            example: 'hello there, Katie!',
            synonyms: [],
            antonyms: [],
          },
        ],
      },
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'an utterance of ‘hello’; a greeting.',
            example: 'she was getting polite nods and hellos from people',
            synonyms: [],
            antonyms: [],
          },
        ],
      },
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'say or shout ‘hello’.',
            example: 'I pressed the phone button and helloed',
            synonyms: [],
            antonyms: [],
          },
        ],
      },
    ],
  },
];
const mockDefs = [
  {
    label: 'exclamation: used as a greeting or to begin a phone conversation.',
    testID: undefined,
    textColor: undefined,
    value: 0,
  },
  {
    label: 'noun: an utterance of ‘hello’; a greeting.',
    testID: undefined,
    textColor: undefined,
    value: 1,
  },
  {
    label: 'verb: say or shout ‘hello’.',
    testID: undefined,
    textColor: undefined,
    value: 2,
  },
];

//mock functions
jest.mock('firebase/firestore');
const mockReset = jest.fn();
const mockSet = jest.fn();
const mockCommit = jest.fn();
const mockJson = jest.fn().mockResolvedValue(mockDictionaryData);
const navigation = {
  reset: mockReset,
} as any as NativeStackNavigationProp<
  RootStackParamsList,
  'AddWord',
  undefined
>;

//props
const props = {
  route: {} as RouteProp<RootStackParamsList, 'AddWord'>,
  navigation,
};

const preRender = () =>
  render(
    <Provider store={store}>
      <AddWord {...props} />
    </Provider>
  );

describe('AddWord Componenet', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: mockJson,
      } as unknown as Response)
    );
  });
  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = unmockedFetch;
  });
  it('should render the page', () => {
    const {getByText} = preRender();
    expect(getByText('Add Word')).toBeDefined();
  });
  describe('input lines', () => {
    it('should change the word', () => {
      const {getByA11yLabel} = preRender();
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'based');
      expect(word).toHaveProp('value', 'based');
    });
  });
  describe('fetching the word', () => {
    it('should fetch the word', async () => {
      const {getByA11yLabel, getByRole} = preRender();
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(`${api}test`);
      });
    });
    it('should display error on word not found', async () => {
      mockJson.mockResolvedValue({});
      const {getByA11yLabel, getByRole, findByText} = preRender();
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      const error = await findByText('Unable to get word');
      expect(error).toBeTruthy();
    });
    it('should catch error on fetch', async () => {
      const {getByA11yLabel, getByRole, findByText, debug} = preRender();
      global.fetch = jest.fn(() => Promise.reject({message: 'fetch error'}));
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      const error = await findByText('Unable to get word');
      expect(error).toBeTruthy();
    });
    it('should catch error on Json', async () => {
      mockJson.mockRejectedValue({message: 'json error'});
      const {getByA11yLabel, getByRole, findByText} = preRender();
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      const error = await findByText('Unable to get word');
      expect(error).toBeTruthy();
    });
  });
  describe('picking a definition', () => {
    beforeEach(() => {
      mockJson.mockResolvedValue(mockDictionaryData);
    });
    it('should have placeholder text if no options', () => {
      const {getAllByTestId, debug} = preRender();
      const picker = getAllByTestId('text_input');
      expect(picker[0]).toHaveProp('value', 'Enter a word to see definitions');
    });
    it('should be disabled if no options', () => {
      mockJson.mockResolvedValue([{meanings: []}]);
      const {getAllByTestId, debug} = preRender();
      const picker = getAllByTestId('ios_touchable_wrapper')[0];
      fireEvent(picker, 'click');
      expect(getAllByTestId('ios_modal')[0]).toHaveProp('visible', false);
    });
    it('should show first def if there is data', async () => {
      const {getAllByTestId, getByA11yLabel} = preRender();
      const picker = getAllByTestId('text_input')[0];
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      await waitFor(() => {
        expect(getAllByTestId('text_input')[0]).toHaveProp(
          'value',
          'exclamation: used as a greeting or to begin a phone conversation.'
        );
      });
    });
    it('should be enabled if there are options', async () => {
      const {getAllByTestId, getByA11yLabel} = preRender();
      const picker = getAllByTestId('ios_touchable_wrapper')[0];
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      await waitFor(() => {
        fireEvent(picker, 'click');
        expect(getAllByTestId('ios_modal')[0]).toHaveProp('visible', false);
      });
    });
    it('should have the definition list', async () => {
      const {getAllByTestId, getByA11yLabel} = preRender();
      const picker = getAllByTestId('ios_picker')[0];
      const word = getByA11yLabel('Word');
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      await waitFor(() => {
        expect(picker).toHaveProp('items', mockDefs);
      });
    });
  });
  describe('album picker', () => {
    it('should show the album list', () => {
      const {getAllByTestId} = preRender();
      const picker = getAllByTestId('ios_picker')[1];
      expect(picker).toHaveProp('items', [
        {label: 'All', testID: undefined, textColor: undefined, value: 0},
        {label: 'Test', testID: undefined, textColor: undefined, value: 1},
        {
          label: 'Create New Album',
          testID: undefined,
          textColor: undefined,
          value: -1,
        },
      ]);
    });
    it('should select the album', () => {
      const {getAllByTestId, getByTestId, debug} = preRender();
      const picker = getByTestId('albumPicker');
      const text = getAllByTestId('text_input')[1];
      fireEvent(picker, 'onValueChange', 1);
      expect(text).toHaveProp('value', 'Test');
    });
  });
  describe('adding a word', () => {
    beforeEach(() => {
      jest.spyOn(firestore, 'writeBatch').mockImplementation(() => ({
        set: mockSet,
        commit: mockCommit,
        update: jest.fn(),
        delete: jest.fn(),
      }));
    });
    it('should add the word to All album', (done) => {
      const alert = jest.spyOn(Alert, 'alert');
      mockCommit.mockResolvedValue({});
      const {debug, getByText, getByRole, getAllByTestId, getByA11yLabel} =
        preRender();
      const word = getByA11yLabel('Word');
      const def = getAllByTestId('ios_picker')[0];
      const button = getByRole('button');

      //type the word
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      //wait for definitions
      waitFor(() => expect(def).toHaveProp('items', mockDefs)).then(() => {
        //add the word
        fireEvent.press(button);
        expect(alert).toHaveBeenCalled();
        act(() => alert.mock.calls[0][2][1].onPress());
        waitFor(() => expect(alert.mock.calls[1][0]).toBe('Success')).then(
          () => {
            expect(mockSet).toBeCalledTimes(1);
            act(() => alert.mock.calls[1][2][0].onPress());
            expect(word).toHaveProp('value', '');
            done();
          }
        );
      });
    });
    it('should add the word to both All and album', (done) => {
      const alert = jest.spyOn(Alert, 'alert');
      mockCommit.mockResolvedValue({});
      const {debug, getByTestId, getByRole, getAllByTestId, getByA11yLabel} =
        preRender();
      const word = getByA11yLabel('Word');
      const def = getAllByTestId('ios_picker')[0];
      const button = getByRole('button');
      const picker = getByTestId('albumPicker');
      //change the album
      fireEvent(picker, 'onValueChange', 1);
      //type the word
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');

      //wait for definitions
      waitFor(() => expect(def).toHaveProp('items', mockDefs)).then(() => {
        //add the word
        fireEvent.press(button);
        expect(alert).toHaveBeenCalled();
        act(() => alert.mock.calls[0][2][1].onPress());
        waitFor(() => expect(alert.mock.calls[1][0]).toBe('Success')).then(
          () => {
            expect(mockSet).toBeCalledTimes(2);
            act(() => alert.mock.calls[1][2][0].onPress());
            expect(word).toHaveProp('value', '');
            done();
          }
        );
      });
    });
    it('should not add if not confirmed', async () => {
      const alert = jest.spyOn(Alert, 'alert');
      const addDoc = jest
        .spyOn(firestore, 'addDoc')
        .mockResolvedValue({} as DocumentReference);
      const {debug, getByText, getByRole, getAllByTestId, getByA11yLabel} =
        preRender();
      const word = getByA11yLabel('Word');
      const def = getAllByTestId('ios_picker')[0];
      const button = getByRole('button');
      //add the word
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      //wait for definitions
      await waitFor(() => {
        expect(def).toHaveProp('items', mockDefs);
        fireEvent.press(button);
        expect(alert).toHaveBeenCalled();
        alert.mock.calls[0][2][0].onPress();
        expect(addDoc).not.toHaveBeenCalled();
      });
    });
    it('should catch error on add', (done) => {
      const alert = jest.spyOn(Alert, 'alert');
      mockCommit.mockRejectedValue({message: 'total fail'});
      const {debug, getByText, getByRole, getAllByTestId, getByA11yLabel} =
        preRender();
      const word = getByA11yLabel('Word');
      const def = getAllByTestId('ios_picker')[0];
      const button = getByRole('button');
      //add the word
      fireEvent.changeText(word, 'test');
      fireEvent(word, 'submitEditing');
      //wait for definitions
      waitFor(() => expect(def).toHaveProp('items', mockDefs)).then(() => {
        fireEvent.press(button);
        expect(alert).toHaveBeenCalled();
        act(() => alert.mock.calls[0][2][1].onPress());
        waitFor(() => expect(alert.mock.calls[1][0]).toBe('Error')).then(() => {
          expect(alert.mock.calls[1][1]).toBe('total fail');
          done();
        });
      });
    });

    it('should not push if no data', async () => {
      const alert = jest.spyOn(Alert, 'alert');
      const addDoc = jest
        .spyOn(firestore, 'addDoc')
        .mockResolvedValue({} as DocumentReference);
      const {debug, getByText, getByRole, getAllByTestId, getByA11yLabel} =
        preRender();
      const word = getByA11yLabel('Word');
      const def = getAllByTestId('ios_picker')[0];
      const button = getByRole('button');
      //add the word
      fireEvent.changeText(word, 'test');
      fireEvent.press(button);
      expect(alert).toHaveBeenCalledWith('Enter a word first.');
    });
  });
  describe('add an Album', () => {
    afterEach(() => {
      //reset the store
      act(() => {
        store.dispatch(updateAlbums(albums));
      });
    });
    it('should add an Album', async () => {
      const alert = jest.spyOn(Alert, 'prompt');
      const add = jest
        .spyOn(firestore, 'addDoc')
        .mockResolvedValue({} as DocumentReference);
      const {getByTestId, getAllByTestId} = preRender();
      const picker = getByTestId('albumPicker');
      const text = getAllByTestId('text_input')[1];
      fireEvent(picker, 'onValueChange', -1);
      expect(alert.mock.calls[0][0]).toBe('Create Album');
      const cb = alert.mock.calls[0][2] as (string) => void;
      await waitFor(() => {
        cb('New Album');
        expect(alert.mock.calls[1][1]).toBe(
          'Album New Album has been created.'
        );
      });
    });
    it('should not add album if name already exists', async () => {
      const alert = jest.spyOn(Alert, 'prompt');
      const add = jest
        .spyOn(firestore, 'addDoc')
        .mockResolvedValue({} as DocumentReference);
      const {getByTestId, getAllByTestId} = preRender();
      const picker = getByTestId('albumPicker');
      const text = getAllByTestId('text_input')[1];
      fireEvent(picker, 'onValueChange', -1);
      expect(alert.mock.calls[0][0]).toBe('Create Album');
      const cb = alert.mock.calls[0][2] as (string) => void;
      await waitFor(() => {
        cb('Test');
        expect(alert).toHaveBeenCalledTimes(1);
      });
    });
    it('should not add album if nothing is entered', async () => {
      const alert = jest.spyOn(Alert, 'prompt');
      const add = jest
        .spyOn(firestore, 'addDoc')
        .mockResolvedValue({} as DocumentReference);
      const {getByTestId, getAllByTestId} = preRender();
      const picker = getByTestId('albumPicker');
      const text = getAllByTestId('text_input')[1];
      fireEvent(picker, 'onValueChange', -1);
      expect(alert.mock.calls[0][0]).toBe('Create Album');
      const cb = alert.mock.calls[0][2] as (string) => void;
      await waitFor(() => {
        cb('');
        expect(alert).toHaveBeenCalledTimes(1);
      });
    });
    it('should alert user if there is error', async () => {
      const alert = jest.spyOn(Alert, 'prompt');
      const add = jest.spyOn(firestore, 'addDoc').mockRejectedValue({});
      const {getByTestId, getAllByTestId} = preRender();
      const picker = getByTestId('albumPicker');
      const text = getAllByTestId('text_input')[1];
      fireEvent(picker, 'onValueChange', -1);
      expect(alert.mock.calls[0][0]).toBe('Create Album');
      const cb = alert.mock.calls[0][2] as (string) => void;
      await waitFor(() => {
        cb('Star Wars');
        expect(alert.mock.calls[1][0]).toBe('Error');
      });
    });
    it('should change the value to the new album', async () => {
      const alert = jest.spyOn(Alert, 'prompt');
      const add = jest
        .spyOn(firestore, 'addDoc')
        .mockResolvedValue({} as DocumentReference);
      const {getByTestId, getAllByTestId} = preRender();
      //add the album
      const picker = getByTestId('albumPicker');
      const text = getAllByTestId('text_input')[1];
      fireEvent(picker, 'onValueChange', -1);
      expect(alert.mock.calls[0][0]).toBe('Create Album');
      const cb = alert.mock.calls[0][2] as (string) => void;

      await waitFor(() => {
        cb('New Album');
        //simulate update from listener
        act(() => {
          store.dispatch(
            updateAlbums([
              ...albums,
              {name: 'New Album', id: '12', editable: true},
            ])
          );
        });
        expect(text).toHaveProp('value', 'New Album');
      });
    });
  });
});
