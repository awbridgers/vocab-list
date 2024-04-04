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
import {useTheme} from '@react-navigation/native';
import AppText from '../AppText/AppText';

type Props = NativeStackScreenProps<RootStackParamsList, 'LogIn'>;
const LogIn = ({navigation}: Props) => {
  const {colors} = useTheme();
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
    <View style={[style.container, {backgroundColor: colors.background}]}>
      
      <View style={style.form}>
      <View style = {style.titleContainer}>
        <AppText style={style.title}>Login</AppText>
      </View>
        <Input
          value={email}
          label={'Email'}
          showError={false}
          error={''}
          onChangeText={(text)=>setEmail(text)}
          textContentType="emailAddress"
        />
        <Input
          value={password}
          label={'Password'}
          showError={error !== ''}
          error={'Invalid Email or Password'}
          onChangeText={(text)=>setPassword(text)}
          textContentType="password"
          secureTextEntry
        />
        <Button
          height={75}
          width={200}
          onPress={submit}
          text={'Log In'}
          bgColor={'#59fa14'}
          fontSize={35}
          margin={10}
        />
        <View>
        <AppText style={{fontSize: 22, margin: 5}}>
          Don't have an account?{' '}
          <Text style={{color: '#005CA9'}} onPress={()=>navigation.navigate('Create')}>Sign Up!</Text>
        </AppText>
      </View>
      </View>
      
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainer:{
    padding: 100
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    width: '85%',
    alignItems: 'center',

  },
  create: {
    flexDirection: 'row',
  },
});

export default LogIn;
