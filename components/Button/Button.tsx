import {TouchableOpacity, Text, StyleProp, ViewStyle} from 'react-native';

interface Props {
  height: number;
  width: number;
  onPress: () => any;
  text: string;
  bgColor: string;
  fontSize: number;
  center?: boolean;
  margin?: number;
  disabled? : boolean;
  style? : StyleProp<ViewStyle>
  color? : string
}
const Button = ({color,style,disabled,margin,center,height, width, onPress, text, bgColor, fontSize}: Props) => {
  return (
    <TouchableOpacity
    accessibilityRole='button'
    disabled = {disabled}
    accessibilityLabel={text}
      style={[{
        height: height,
        width: width,
        backgroundColor: bgColor,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: center ? 'center' : 'auto',
        margin: margin ? margin : 0
      },style ]}
      onPress={onPress}
    >
      <Text style = {{fontSize: fontSize, color: color}}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
