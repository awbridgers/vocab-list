import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import {
  Definition,
  RootStackParamsList,
  TabParamList,
  Word,
} from '../../types/types';
import {RootState} from '../../redux/store';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import InputLine from '../InputLine/InputLine';
import Button from '../Button/Button';
import {Data} from '../../types/types';
import Picker from 'react-native-picker-select';
import {doc, addDoc, collection, writeBatch, setDoc, getFirestore} from 'firebase/firestore';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {useAppSelector} from '../../redux/hooks';
import {getAuth} from 'firebase/auth';
import { useTheme } from '@react-navigation/native';
import AppText from '../AppText/AppText';

type Props = {
  albumID : undefined | string;
  cancel: ()=>void
};

const AddWord = ({albumID, cancel}: Props) => {
  const [word, setWord] = useState<string>('');
  const [data, setData] = useState<Definition[]>([]);
  const [error, setError] = useState<string>('');
  const [def, setDef] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const auth = getAuth();
  const database = getFirestore();
  const user = auth.currentUser;
  const albumList = useAppSelector((state) => state.albums);
  const dispatch = useDispatch();
  const api = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const {colors} = useTheme();
  const getWord = async () => {
    setError('');
    setData([]);
    setDef(0);
    try {
      const res = await fetch(api + word);
      const [data] = await res.json();
      const meaning = (data as Data).meanings;
      //for now, just grab the first definition in each part of speech setting
      const results: Definition[] = meaning.map((def) => ({
        partOfSpeech: def.partOfSpeech,
        definition: def.definitions[0],
        synonyms: def.synonyms,
        antonyms: def.antonyms,
      }));
      setData(results);
    } catch (e) {
      setError('Unable to get word');
    }
  };
  const clearForm = () => {
    setWord('');
    setData([]);
    setError('');
    setDef(0);
    setNotes('');
  };
  const submitWord = async () => {
    //build the word object
    if (!user) return;
    const newWord = {
      word,
      definition: data[def].definition.definition,
      partOfSpeech: data[def].partOfSpeech,
      synonyms: data[def].synonyms,
      antonyms: data[def].antonyms,
      notes,
      albums: albumID ? [albumID] : []
    };
    const docRef = doc(collection(database, 'Users', user.uid, 'VocabList'));
    try {
      await setDoc(docRef, newWord);
      Alert.alert(
        'Success',
        'Word successfully added',
        [{text: 'OK', onPress: () => cancel()}],
        {
          cancelable: true,
        }
      );
    } catch (e) {
      Alert.alert(
        'Error',
        'There was an error adding the word. Please try again.',
        [{text: 'OK'}],
        {cancelable: true}
      );
    }
  };
useEffect(()=>{
  //anytime the word is changed, remove the definitions
  setData([])
  setDef(0)
},[word])
  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View>
        <AppText style={styles.title}>Add Word</AppText>
      </View>
      <View style={styles.form}>
        <InputLine
          label={'Word'}
          value={word}
          showError={!!error}
          error={error}
          onChangeText={(text)=>setWord(text)}
          onSubmitEditing={getWord}
        />

        <AppText style={styles.label}>Select a definition</AppText>
        <Picker
          onValueChange={(value) => setDef(value)}
          items={data.map((x, i) => ({
            label: `${x.partOfSpeech}: ${x.definition.definition}`,
            value: i,
            key: i,
          }))}
          placeholder={
            data.length === 0
              ? {label: 'Enter a word to see definitions', value: null}
              : {}
          }
          disabled={data.length === 0}
          value={def}
          style={pickerSelectStyles}
          textInputProps={{
            multiline: true,
            numberOfLines: 3,
            textAlignVertical: 'center',
          }}
          useNativeAndroidPickerStyle={false}
          pickerProps={{accessibilityLabel: 'definitionPicker'}}
        />
        <View style={styles.submit}>
          <TouchableOpacity
            style={styles.button}
            onPress={
              data.length > 0
                ? () =>
                    Alert.alert('Confirm', `Add ${word}?`, [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancelled'),
                        style: 'cancel',
                      },
                      {text: 'Yes', onPress: () => submitWord()},
                    ])
                : () => Alert.alert('Enter a word first.')
            }
          >
            <Text style={{fontSize: 25}}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'red'}]}
            onPress={cancel}
          >
            <Text style={{fontSize: 25}}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddWord;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',

  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    padding: 20
  },
  form: {
    width: '85%',
    flex: 1,
  },
  label: {
    fontSize: 20,
    margin: 5,
  },
  submit: {
    margin: 15,
    alignItems: 'center',
  },
  button: {
    height: 75,
    width: 150,
    backgroundColor: '#59fa14',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 8
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 20,
    marginBottom: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: 'white'
  },
  inputAndroid: {
    fontSize: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: 'white'
  },
});
