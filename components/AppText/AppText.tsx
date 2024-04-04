import { ReactElement, ReactNode } from 'react';
import { Appearance, StyleProp, ViewStyle, TextStyle, TextProps } from 'react-native'
import { Text } from 'react-native';


interface Props extends TextProps{
  children: string |string[] | undefined | ReactNode;
}

export const AppText = ({children, style, ...rest}:Props)=>{
  const scheme = Appearance.getColorScheme();
  return (
    <Text style = {[{color: scheme === 'dark' ? 'white' : 'black'}, style ? style : {}]} {...rest}>
      {children}
    </Text>
  )
}

export default AppText