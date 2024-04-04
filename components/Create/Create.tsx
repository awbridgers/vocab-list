import {useState} from 'react';
import {View, Text, StyleSheet, Alert, useColorScheme} from 'react-native';
import {createUserWithEmailAndPassword, getAuth} from 'firebase/auth';
import Button from '../Button/Button';
import InputLine from '../InputLine/InputLine';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList} from '../../types/types';
import AppText from '../AppText/AppText';

type createProps = NativeStackScreenProps<RootStackParamsList, 'Create'>;

const Create = ({navigation}: createProps) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const auth = getAuth();
  const scheme = useColorScheme();



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
    <View style={[style.container, {backgroundColor: scheme === 'dark' ? 'black' : 'white'}]}>
      <AppText style={style.title}>Create Account</AppText>
      <View style={style.form}>
        <InputLine
          label="Email"
          value={email}
          showError={error.includes('email')}
          error={error}
          onChangeText={(text)=>setEmail(text)}
        />

        <InputLine
          label="Password"
          value={password}
          showError={error.includes('password')}
          error={error}
          onChangeText={(text)=>setPassword(text)}
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
          onChangeText={(text)=>setConfirm(text)}
          secureTextEntry
        />
      </View>
      <Button
        onPress={() => createUser()}
        height={75}
        width={200}
        text={'Sign Up'}
        bgColor={'#59fa14'}
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
    textAlign: 'center',
    margin: 10,
  },
  form: {
    width: '85%',
    marginBottom: 20,
  },
});
