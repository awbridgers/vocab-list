import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  FlatList,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  RootStackParamsList,
  Album as AlbumType,
  TabParamList,
} from '../../types/types';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import Button from '../Button/Button';
import {addDoc, collection, deleteDoc, doc} from 'firebase/firestore';
import {database} from '../../firebaseConfig';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {getAuth} from 'firebase/auth';
import {useAppSelector} from '../../redux/hooks';
import {Feather} from '@expo/vector-icons';

type AlbumProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Albums'>,
  NativeStackScreenProps<RootStackParamsList>
>;

const Albums = ({navigation}: AlbumProps) => {
  const albumList = useAppSelector((state) => state.albums);
  const auth = getAuth();
  const user = auth.currentUser;
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const deleteAlbum = (album: AlbumType) => {
    if (!user) return;
    const {id, name} = album;
    const ref = doc(database, 'Users', user.uid, 'Albums', id);
    Alert.alert('Are you sure?', `Delete album *${name}* permanently?`, [
      {
        text: 'Ok',
        onPress: () =>
          deleteDoc(ref).catch((e) => Alert.alert('Error', e.message)),
        style: 'default',
      },
      {
        text: 'Cancel',
        onPress: () => console.log('Delete cancelled.'),
        style: 'cancel',
      },
    ]);
  };
  const addAlbum = async () => {
    if (!user) return;
    const ref = collection(database, 'Users', user.uid, 'Albums');
    const newAlbum = {name: newTitle};
    try {
      await addDoc(ref, newAlbum);
      Alert.alert('Success', 'Your album has been added.');
      resetModal();
    } catch (e) {
      Alert.alert('Error!', 'There was an error adding the album');
    }
  };
  const resetModal = () => {
    setShowAddModal(false);
    setNewTitle('');
  };
  const changeTitle = (text:string)=>{
    if(text.length <= 75){
      setNewTitle(text)
    }
  }
  return (
    <View style={styles.container}>
      <View style={{margin: 10}}>
        <Text style={styles.header}>Vocab Lists</Text>
      </View>
      <Modal
        visible={showAddModal}
        animationType="fade"
        transparent={true}
        onRequestClose={resetModal}
      >
        <View style={[styles.container, {backgroundColor: 'rgba(0,0,0,0.6)'}]}>
          <View style={styles.modal}>
            <View>
              <Text style={{fontSize: 25}}>Add Album</Text>
            </View>
            <TextInput
              value={newTitle}
              style={styles.input}
              onChangeText={(text)=>changeTitle(text)}
              placeholder="Enter Title Here"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={addAlbum} style={styles.btn}>
                <Text style={{fontSize: 25}}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetModal}
                style={[styles.btn, {backgroundColor: 'red'}]}
              >
                <Text style={{fontSize: 25}}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FlatList
        data={albumList}
        showsVerticalScrollIndicator={false}
        renderItem={({item, index}) => (
          <Pressable
            onPress={() => navigation.navigate('Album', {album: item.id} as never)}
            style={styles.card}
            key={item.id}
          >
            <Text style={styles.title} accessibilityLabel="title">
              {item.name}
            </Text>
          </Pressable>
        )}
      ></FlatList>
      <View style={{margin: 10}}>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.add}
        >
          <Feather name="plus-square" size={50} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Albums;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#dad0d0',
    borderColor: 'black',
    width: 300,
    height: 100,
    borderWidth: 2,
    borderRadius: 4,
    margin: 5,
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 3,
    overflow: 'hidden',
    alignContent: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardBody: {
    alignItems: 'center',
    marginBottom: 5,
    flex: 5,
  },
  button: {
    margin: 5,
  },
  add: {
    height: 75,
    width: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    height: 200,
    width: '75%',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    padding: 10,
    width: '95%',
    fontSize: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  btn: {
    height: 60,
    width: 135,
    margin: 5,
    backgroundColor: '#16ab13',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
