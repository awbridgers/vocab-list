import {
  NavigationContainer,
  DefaultTheme,
  useNavigationContainerRef,
  DarkTheme,
} from '@react-navigation/native';
import {Text, TouchableOpacity, Alert, Appearance, useColorScheme} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './components/Home/Home';
import Create from './components/Create/Create';
import LogIn from './components/LogIn/LogIn';
import {Album, RootStackParamsList, Word} from './types/types';
import {RootState, store} from './redux/store';
import {Provider, useSelector} from 'react-redux';
import React, {useEffect, useState} from 'react';
import {
  collection,
  getFirestore,
  onSnapshot,
} from 'firebase/firestore';
import {getAuth, onAuthStateChanged, signOut} from 'firebase/auth';
import {updateAlbums} from './redux/albumSlice';
import {useAppDispatch} from './redux/hooks';
import { updateWords } from './redux/wordsSlice';
import AlbumPage from './components/Albums/albumPage';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator<RootStackParamsList>();

const lightTheme = {...DefaultTheme,colors:{
  ...DefaultTheme.colors,
  primary: '#FAFF0C',
  card:'#00235D',
  text: '#f1f1f1',
  border: '#000000',
}, dark: false}
const darkTheme = {
  ...DarkTheme, colors:{
    ...DarkTheme.colors,
    primary: "#FAFF0C",
    background: '#000000',
    card: '#00235D',
    text: '#f1f1f1',
  },
  dark: true
}

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
  const scheme = useColorScheme();
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
      //console.log('user')
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
    <NavigationContainer theme={scheme === 'dark' ? darkTheme : lightTheme}>
      <StatusBar style = 'light'/>
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
                        color: '#FAFF0C',
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
            {/* <Stack.Screen name="Quiz" component={Quiz} /> */}
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
