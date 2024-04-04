import React, {Dispatch, SetStateAction} from 'react';
import {View, TextInput, Text, StyleSheet, TextInputProps} from 'react-native';
import {autoCompleteType, textContentType} from '../../types/types';
import AppText from '../AppText/AppText';

interface iProps extends TextInputProps {
  label: string;
  showError: boolean;
  error: string;
}

const InputLine = ({
  label,
  showError,
  error,
  ...props
}: iProps) => {
  return (
    <View style={[defaultStyle.container]}>
      <AppText style={[defaultStyle.label]}>{label}</AppText>
      <TextInput
        style={[defaultStyle.input]}
        accessibilityLabel={label}
        {...props}
      />
      <Text style={[defaultStyle.error]}>{showError && error}</Text>
    </View>
  );
};

const defaultStyle = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
  },
  input: {
    height: 45,
    borderWidth: 1,
    padding: 10,
    flexGrow: 1,
    fontSize: 20,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 22,
    margin: 5,
  },
  error: {
    color: 'red',
    minHeight: 15,
  },
});

export default InputLine;
