import React, { Dispatch, SetStateAction } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import {autoCompleteType, textContentType} from '../../types/types'

interface iProps {
  label: string,
  value: string
  showError: boolean,
  error: string,
  style?: {
    container? : {},
    label? : {}

  },
  onChange: Dispatch<SetStateAction<string>>,
  autocompleteType? : autoCompleteType,
  textContentType? : textContentType,
  secureTextEntry? : boolean
  onSubmit?: ()=>any
}

const InputLine = ({onSubmit, value,label, showError,error,style,onChange,autocompleteType, textContentType, secureTextEntry}:iProps) => (
  <View style={[defaultStyle.container]}>
    <Text style={[defaultStyle.label]}>{label}</Text>
    <TextInput
      style={[defaultStyle.input]}
      value={value}
      onChangeText={(text)=>onChange(text)}
      textContentType={textContentType}
      autoComplete = {autocompleteType}
      secureTextEntry = {secureTextEntry}
      accessibilityLabel = {label}
      onSubmitEditing = {onSubmit}
    />
    <Text style = {[defaultStyle.error]}>{showError && error}</Text>
  </View>
);

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
  },
  label: {
    fontSize: 20,
    margin: 5,
  },
  error:{
    color: 'red',
    minHeight: 15
  }
})

export default InputLine