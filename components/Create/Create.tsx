import {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TextInput, Alert} from 'react-native';
import { database} from '../../firebaseConfig';
import {changeUser} from '../../redux/userSlice';
import {createUserWithEmailAndPassword, getAuth} from 'firebase/auth';
import Button from '../Button/Button';
import InputLine from '../InputLine/InputLine';
import {doc, setDoc} from 'firebase/firestore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList} from '../../types/types';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../redux/store';

type createProps = NativeStackScreenProps<RootStackParamsList, 'Create'>;

const Create = ({navigation}: createProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const auth = getAuth();



  const createUser = () => {
    //clear the current error
    setError('');
    //block if passwords don't match
    if (password === confirm) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCred) => {
          Alert.alert('Success', 'Your account has been created!');
        })
        .catch((e) => setError(e.message.replace('Firebase: ', '')));
    } else {
      setError('Passwords do not match.');
    }
  };
  return (
    <View style={style.container}>
      <Text style={style.title}>Create Account</Text>
      <View style={style.form}>
        <InputLine
          label="Email"
          value={email}
          showError={error.includes('email')}
          error={error}
          onChange={setEmail}
        />

        <InputLine
          label="Password"
          value={password}
          showError={error.includes('password')}
          error={error}
          onChange={setPassword}
          secureTextEntry
        />
        <InputLine
          label="Confirm Password"
          value={confirm}
          showError={
            error !== '' &&
            !error.includes('email') &&
            (!error.includes('password') || error.includes('match'))
          }
          error={error}
          onChange={setConfirm}
          secureTextEntry
        />
      </View>
      <Button
        onPress={() => createUser()}
        height={75}
        width={200}
        text={'Sign Up'}
        bgColor={'#5da2ca'}
        fontSize={30}
      />
    </View>
  );
};

export default Create;

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    margin: 10,
  },
  form: {
    width: '85%',
    marginBottom: 20,
  },
});
