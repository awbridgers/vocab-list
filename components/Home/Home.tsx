import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Button from '../Button/Button';
import {
  getDocs,
  collection,
  onSnapshot,
  collectionGroup,
} from 'firebase/firestore';
//import {addWord} from '../../redux/wordSlice';
import {Word, Album} from '../../types/types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList, TabParamList} from '../../types/types';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {database} from '../../firebaseConfig';
import {RootState} from '../../redux/store';
import {updateAlbums} from '../../redux/albumSlice';
import Albums from '../Albums/albums';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AddWord from '../AddWord/addWord';
import AlbumPage from '../Albums/wordList';
import WordList from '../Albums/wordList';
import {useAppSelector} from '../../redux/hooks';
import {Feather} from '@expo/vector-icons';
import Quiz from '../Quiz/quiz';

type HomeProps = NativeStackScreenProps<RootStackParamsList, 'Home'>;
const Tab = createBottomTabNavigator<TabParamList>();

const Home = ({navigation}: HomeProps) => {
  const words = useAppSelector((state) => state.words);

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="WordList"
        options={{
          tabBarIcon: ({color, size}) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      >
        {(props) => <WordList {...props} data={words} />}
      </Tab.Screen>
      <Tab.Screen
        name="Albums"
        component={Albums}
        options={{
          tabBarIcon: ({size, color}) => (
            <Feather name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Quiz"
        options={{
          tabBarIcon: ({size, color}) => (
            <Feather name="folder" size={size} color={color} />
          ),
        }}
      >
        {(props)=><Quiz {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;
