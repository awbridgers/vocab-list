// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {initializeFirestore} from 'firebase/firestore'
import {
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDunwps5KruaWnRLA1IYe6Cvi0Itz1sVFc",
  authDomain: "vocabapp-b5b92.firebaseapp.com",
  projectId: "vocabapp-b5b92",
  storageBucket: "vocabapp-b5b92.appspot.com",
  messagingSenderId: "162651252895",
  appId: "1:162651252895:web:8375946db7732246925aaa",
  measurementId: "G-KYK5DDGMQR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = initializeFirestore(app,{
  experimentalForceLongPolling: true,
  
});
const auth = initializeAuth(app, {persistence:getReactNativePersistence(ReactNativeAsyncStorage)})

