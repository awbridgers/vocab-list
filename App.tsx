import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './components/Home/Home';
import * as SplashScreen from 'expo-splash-screen';
import Create from './components/Create/Create';
import LogIn from './components/LogIn/LogIn';
import {Album, RootStackParamsList, Word} from './types/types';
import {RootState, store} from './redux/store';
import {Provider, useDispatch, useSelector} from 'react-redux';
import React, {useCallback, useEffect, useState} from 'react';
import {
  QuerySnapshot,
  collection,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {database} from './firebaseConfig';
import AddWord from './components/AddWord/addWord';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import {changeUser} from './redux/userSlice';
import Albums from './components/Albums/albums';
import Quiz from './components/Quiz/quiz';
import {updateAlbums} from './redux/albumSlice';
import {useAppDispatch, useAppSelector} from './redux/hooks';
import { updateWords } from './redux/wordsSlice';
import WordList from './components/Albums/wordList';
import AlbumPage from './components/Albums/albumPage';

const Stack = createNativeStackNavigator<RootStackParamsList>();

export const Nav = () => {
  const dispatch = useAppDispatch();
  const [navReady, setNavReady] = useState<boolean>(false);
  const [isLoggedIn, setisLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const albums = useSelector((state: RootState) => state.albums);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const navigationRef = useNavigationContainerRef();
  //listen for auth changes
  useEffect(() => {
    const unlisten = onAuthStateChanged(auth, (userInfo) => {
      if (userInfo) {
        //the user is logged in
        //console.log(userInfo);
        setisLoggedIn(true);
      } else {
        //the user is logged out
        setisLoggedIn(false);
      }
      setIsLoading(false);
    });
    return () => unlisten();
  }, []);
  //listen for album changes
  useEffect(() => {
    if (isLoggedIn) {
      const ref = collection(db, 'Users', user!.uid, 'Albums');
      const unsub = onSnapshot(ref, (refSnapshot) => {
        const albumArray: Album[] = [];
        refSnapshot.forEach((album) => {
          albumArray.push({id: album.id, name: album.data().name});
        });
        albumArray.sort((a, b) =>
          a.name < b.name ? -1 : a.name > b.name ? 1 : 0
        );
        dispatch(updateAlbums(albumArray));
      });
      return () => unsub();
    }
  }, [isLoggedIn]);
  //listen for word changes
  useEffect(() => {
    if (isLoggedIn) {
      console.log('user')
      const ref = collection(db, 'Users', user!.uid, 'VocabList');
      const unsub = onSnapshot(ref, (refSnapshot) => {
        const wordArray: Word[] = [];
        refSnapshot.forEach((item) => {
          const {
            albums,
            antonyms,
            definition,
            notes,
            partOfSpeech,
            synonyms,
            word,
          } = item.data();
          wordArray.push({
            id: item.id,
            albums,
            antonyms,
            definition,
            notes,
            partOfSpeech,
            synonyms,
            word,
          });
        });
        dispatch(updateWords(wordArray.sort((a,b)=>a.word > b.word ? 1 : b.word > a.word ? -1 :0)));
        return ()=> unsub()
      });
    }
  },[isLoggedIn]);
  const logOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to Sign Out?', [
      {
        text: 'Sign Out',
        onPress: () => signOut(auth),
        style: 'default',
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => console.log('Cancelled'),
      },
    ]);
  };
  if (isLoading) {
    return null;
  }
  return (
    <NavigationContainer theme={DefaultTheme}>
      <Stack.Navigator
        screenOptions={
          isLoggedIn
            ? {
                headerRight: () => (
                  <TouchableOpacity
                    onPress={logOut}
                    accessibilityLabel="log out"
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: '#007575',
                        fontWeight: 'bold',
                      }}
                    >
                      Log Out
                    </Text>
                  </TouchableOpacity>
                ),
              }
            : {}
        }
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Home" component={Home}></Stack.Screen>
            <Stack.Screen name="Album" component={AlbumPage}/>
            <Stack.Screen name="Quiz" component={Quiz} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="LogIn"
              component={LogIn}
              options={{headerShown: false}}
            />

            <Stack.Screen name="Create" component={Create} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Nav />
    </Provider>
  );
}
