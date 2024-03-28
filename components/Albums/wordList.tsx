import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  BackHandler,
  Pressable,
} from 'react-native';
import CheckBox from 'expo-checkbox';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Album,
  RootStackParamsList,
  TabParamList,
  Word,
} from '../../types/types';
import {database} from '../../firebaseConfig';
import {
  collection,
  doc,
  updateDoc,
  writeBatch,
  onSnapshot,
  WriteBatch,
} from 'firebase/firestore';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import Button from '../Button/Button';
import InputLine from '../InputLine/InputLine';
import {Feather, FontAwesome6} from '@expo/vector-icons';
import {getAuth} from 'firebase/auth';
import {useAppSelector} from '../../redux/hooks';
import {CompositeScreenProps, useFocusEffect} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import AddWord from '../AddWord/addWord';

type Props = {
  data: Word[];
  album?: Album;
  back?: () => void;
};

const WordList = ({data, album, back}: Props) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [edit, setEdit] = useState<boolean>(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [layoutHeight, setLayoutHeight] = useState<number>(0);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // );
  const changeName = () => {
    if (!user || !album) return;
    if (newTitle.length > 0) {
      const ref = doc(database, 'Users', user.uid, 'Albums', album.id);
      updateDoc(ref, {name: newTitle})
        .then(() => {
          setNewTitle('');
          setShowNameModal(false);
        })
        .catch((e) => Alert.alert('Error', e.message));
    } else {
      Alert.alert('Name cannot be blank.');
    }
  };
  const selectWord = (value: boolean, id: string) => {
    if (value) {
      //box is checked, add to list
      setSelected((prev) => new Set(prev).add(id));
    } else {
      //box is unchecked, remove from list
      setSelected((prev) => {
        const updatedSet = new Set(prev);
        updatedSet.delete(id);
        return updatedSet;
      });
    }
  };
  const deleteWords = () => {
    if (!user) return;
    if (selected.size > 0) {
      const ref = collection(database, 'Users', user.uid, 'VocabList');
      if (!album) {
        //if this is the list of all words, ask for confirmation
        Alert.alert(
          'Delete Words',
          `Are you sure you want to delete ${selected.size} words?`,
          [
            {
              onPress: () => {
                const batch = writeBatch(database);
                selected.forEach((wordID) => batch.delete(doc(ref, wordID)));
                batch
                  .commit()
                  .then(() => setSelected(new Set()))
                  .catch((e) => Alert.alert('Error', e.message));
              },
              text: 'Ok',
              style: 'default',
            },
            {
              onPress: () => console.log('Delete Cancelled'),
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Select a Word first.',
          'You must select one or more words to delete first.'
        );
      }
    }
  };

  const handleSelectAll = () => {
    if (!selectAll) {
      setSelected(new Set(data.map((x) => x.id)));
      setSelectAll(true);
    } else {
      setSelected(new Set());
      setSelectAll(false);
    }
  };

  const deleteAlbum = () => {
    if (!album || !user) return;
    Alert.alert(
      `Delete ${album.name}`,
      `Do you want to save the words from ${album.name} or delete them as well?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Keep Words',
          onPress: () => {
            //delete album and remove id from each words id
            const batch = writeBatch(database);
            for (const word of data) {
              const docRef = doc(
                database,
                'Users',
                user.uid,
                'VocabList',
                word.id
              );
              batch.update(docRef, {
                ...word,
                albums: word.albums.filter((x) => x !== album.id),
              });
            }
            batch.delete(doc(database, 'Users', user.uid, 'Albums', album.id));
            batch
              .commit()
              .then(() => back!())
              .catch((e) => console.log(e));
          },
        },
        {
          text: 'Delete Words',
          onPress: () => {
            //delete all words and then album
            const batch = writeBatch(database);
            for (const word of data) {
              const docRef = doc(
                database,
                'Users',
                user.uid,
                'VocabList',
                word.id
              );
              batch.delete(docRef);
            }
            batch.delete(doc(database, 'Users', user.uid, 'Albums', album.id));
            batch
              .commit()
              .then(() => back!())
              .catch((e) => console.log(e));
          },
        },
      ],
      {cancelable: true}
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {/* Spacer to keep the actual title in the middle of the page */}
        <View style={styles.controlButton}>
          {
            <TouchableOpacity
              onPress={() => setEdit(!edit)}
              accessibilityLabel="delete word"
            >
              {edit ? (
                <FontAwesome6 name="check" size={32} testId="editIcon" />
              ) : (
                <FontAwesome6 name="edit" size={32} testID="addIcon" />
              )}
            </TouchableOpacity>
          }
        </View>

        <View style={styles.title}>
          <Text style={styles.titleText} accessibilityLabel="Title">
            {album ? album.name : 'All'}
          </Text>
          {edit && album && (
            <TouchableOpacity
              accessibilityLabel="edit title"
              onPress={() => setShowNameModal(true)}
            >
              <Feather name="edit" size={24} color="black" testID="editIcon" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.controlButton}>
          {edit ? (
            <TouchableOpacity
              onPress={() => deleteWords()}
              accessibilityLabel="delete word"
            >
              <Feather
                name="trash-2"
                size={32}
                color={selected.size > 0 ? 'red' : 'grey'}
                testID="trashIcon"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              accessibilityLabel="delete word"
              style={{marginLeft: 10}}
            >
              <Feather name="plus-square" size={32} testID="addIcon" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{width: '100%'}}>
        {edit && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <CheckBox
              style={styles.checkBox}
              value={selectAll}
              onValueChange={handleSelectAll}
              accessibilityLabel="select all"
            />
            <Text style={{fontSize: 20}}>Select All</Text>
          </View>
        )}
      </View>
      <View style={{flex: 1}}>
        <FlatList
          contentContainerStyle={{paddingBottom: 100, paddingTop: 5}}
          style={{height: layoutHeight}}
          onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
          data={data}
          renderItem={({item}) => (
            <View style={{flexDirection: 'row'}}>
              {edit && (
                <CheckBox
                  accessibilityLabel="check box"
                  style={styles.checkBox}
                  value={selected.has(item.id)}
                  onValueChange={(value) => selectWord(value, item.id)}
                />
              )}
              <Pressable disabled={edit} onPress={() => setSelectedWord(item)}>
                <View style={styles.wordContainer}>
                  <Text style={styles.word} accessibilityLabel="word">
                    {item.word}
                  </Text>
                  <Text style={styles.pos}>
                    (
                    {item.partOfSpeech.length > 5
                      ? item.partOfSpeech.slice(0, 3)
                      : item.partOfSpeech}
                    )-
                  </Text>
                  <Text style={styles.def} accessibilityLabel="definition">
                    {item.definition}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        />
      </View>
      {edit && album && (
        <View>
          <TouchableOpacity onPress={deleteAlbum} style={styles.deleteAlbum}>
            <Text>Delete Album</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={showAddModal}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <AddWord albumID={album?.id} cancel={() => setShowAddModal(false)} />
      </Modal>
      <Modal
        visible={!!selectedWord}
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
        statusBarTranslucent
        transparent
      >
        <View style={styles.modal}>
          <View
            style={[
              styles.modalBody,
              {minHeight: 350, width: '90%', justifyContent: 'space-between'},
            ]}
          >
            <View>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{selectedWord?.word}</Text>
              </View>
              <View>
                <View style={{margin: 5}}>
                  <Text style={{fontSize: 20, fontStyle: 'italic'}}>
                    {selectedWord?.partOfSpeech}
                  </Text>
                </View>
                <View style={{margin: 5}}>
                  <Text style={{fontSize: 20}}>{selectedWord?.definition}</Text>
                </View>
                <View style={{margin: 5}}>
                  <Text style={{fontSize: 20}}>
                    Synonyms: {selectedWord?.synonyms.join(', ')}
                  </Text>
                </View>
                <View style={{margin: 5}}>
                  <Text style={{fontSize: 20}}>
                    Antonyms: {selectedWord?.antonyms.join(', ')}
                  </Text>
                </View>
              </View>
            </View>
            <Button
              height={50}
              onPress={() => setSelectedWord(null)}
              width={115}
              text={'Done'}
              bgColor="#59fa14"
              fontSize={25}
              margin={5}
            />
          </View>
        </View>
      </Modal>
      {album && (
        <Modal
          visible={showNameModal}
          transparent
          animationType="slide"
          accessibilityLabel="change title modal"
          statusBarTranslucent
        >
          <View style={styles.modal}>
            <View style={styles.modalBody}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Change Title of </Text>
                <Text style={[styles.modalTitle, styles.modalOldTitle]}>
                  {album.name}
                </Text>
              </View>
              <InputLine
                label={'New Title'}
                value={newTitle}
                showError={false}
                error={''}
                onChange={setNewTitle}
              />
              <View style={styles.modalButtons}>
                <Button
                  height={50}
                  width={100}
                  onPress={() => setOpenModal(false)}
                  text={'Cancel'}
                  bgColor={'#f94545'}
                  fontSize={20}
                  margin={10}
                />
                <Button
                  height={50}
                  width={100}
                  onPress={() =>
                    Alert.alert(
                      'Confirm Name Change',
                      `Change the name of ${album.name} to ${newTitle}?`,
                      [
                        {
                          onPress: () => changeName(),
                          text: 'Ok',
                          style: 'default',
                        },
                        {
                          onPress: () => console.log('Name Change Cancelled'),
                          text: 'Cancel',
                          style: 'cancel',
                        },
                      ]
                    )
                  }
                  text={'Accept'}
                  bgColor={'#0c8e3d'}
                  fontSize={20}
                  margin={10}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
      {}
    </View>
  );
};

export default WordList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 0,
    borderWidth: 1,
    borderColor: 'grey',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    margin: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  edit: {
    color: 'cyan',
    fontSize: 20,
    backgroundColor: 'grey',
    width: 60,
    height: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 10,
  },
  title: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
  },
  titleText: {
    fontSize: 35,
    textAlign: 'center',
    marginLeft: 5,
    marginRight: 5,
  },
  wordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  pos: {
    fontSize: 20,
  },
  def: {
    fontSize: 20,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(85, 81, 81, 0.6)',
  },
  modalBody: {
    backgroundColor: 'white',
    width: 300,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  modalOldTitle: {
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  checkBox: {
    margin: 5,
    padding: 10,
  },
  controlButton: {
    margin: 5,
    marginTop: 8,
  },
  deleteAlbum: {
    backgroundColor: 'red',
    justifyContent: 'center',
    height: 50,
    width: 125,
    alignItems: 'center',
    borderRadius: 8,
    margin: 5,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
});
