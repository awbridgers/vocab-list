import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {RootStackParamsList} from '../../types/types';
import Button from '../Button/Button';
import Input from '../InputLine/InputLine';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import {changeUser} from '../../redux/userSlice';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

type Props = NativeStackScreenProps<RootStackParamsList, 'LogIn'>;

const LogIn = ({navigation}: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();
  const auth = getAuth();
  const submit = () => {
    signInWithEmailAndPassword(auth, email, password).catch((e) =>
      setError(e.message.replace('Firebase: ', ''))
    );
  };
  return (
    <View style={style.container}>
      <View style = {{flex:1, justifyContent: 'center'}}>
        <Text style={style.title}>Sign In</Text>
      </View>
      <View style={style.form}>
        <Input
          value={email}
          label={'Email'}
          showError={false}
          error={''}
          onChange={setEmail}
          textContentType="emailAddress"
        />
        <Input
          value={password}
          label={'Password'}
          showError={error !== ''}
          error={'Invalid Email or Password'}
          onChange={setPassword}
          textContentType="password"
          secureTextEntry
        />
        <Button
          height={75}
          width={200}
          onPress={submit}
          text={'Log In'}
          bgColor="#70da37"
          fontSize={20}
        />
      </View>
      <View style = {style.create}>
      <Button
          height={75}
          width={200}
          onPress={()=>navigation.navigate('Create')}
          text={'Create Account'}
          bgColor="yellow"
          fontSize={20}
        />
      </View>
      
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    margin: 0,
  },
  form: {
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2
  },
  create:{
    flex: 2
  }
});

export default LogIn;
