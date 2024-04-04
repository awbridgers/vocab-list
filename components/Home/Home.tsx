import {StyleSheet} from 'react-native';
//import {addWord} from '../../redux/wordSlice';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList, TabParamList} from '../../types/types';
import Albums from '../Albums/albums';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import WordList from '../Albums/wordList';
import {useAppSelector} from '../../redux/hooks';
import {Feather} from '@expo/vector-icons';
import Quiz from '../Quiz/quiz';

type HomeProps = NativeStackScreenProps<RootStackParamsList, 'Home'>;
const Tab = createBottomTabNavigator<TabParamList>();

const Home = ({navigation}: HomeProps) => {
  const words = useAppSelector((state) => state.words);

  return (
    <Tab.Navigator screenOptions={{headerShown: false, tabBarLabelStyle: {fontSize: 13}}}>
      <Tab.Screen
        name="WordList"
        options={{
          tabBarIcon: ({color, size}) => (
            <Feather name="align-justify" size={size} color={color} />
          ),
          title: "Words"
        }}
      >
        {(props) => <WordList {...props} data={words} />}
      </Tab.Screen>
      <Tab.Screen
        name="Albums"
        component={Albums}
        options={{
          tabBarIcon: ({size, color}) => (
            <Feather name="folder" size={size} color={color} />
          ),
          title: "Groups"
        }}
      />
      <Tab.Screen
        name="Quiz"
        options={{
          tabBarIcon: ({size, color}) => (
            <Feather name="play-circle" size={size} color={color} />
          ),
        }}
      >
        {(props)=><Quiz {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;
