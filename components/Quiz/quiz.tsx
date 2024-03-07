import {Alert, Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList, Word} from '../../types/types';
import {collection, getDocs} from 'firebase/firestore';
import {database} from '../../firebaseConfig';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import Button from '../Button/Button';

type iProps = NativeStackScreenProps<RootStackParamsList, 'Quiz'>;

const Quiz = ({navigation, route}: iProps) => {
  const [wordList, setWordList] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word>();
  const [answers, setAnswers] = useState<Word[]>([]);
  const [selection, setSelection] = useState<Word | null>();
  const [clicked, setClicked] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [newWord, setNewWord] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state.user);
  const album = route.params ? route.params.album : null;
  const index = useRef<number>();
  const active = useRef<boolean>(false);
  const allWords = useRef<Word[]>([]);

  const restart = () => {
    setNewWord(true);
    setGameOver(false);
    setScore(0);
    setAttempts(0);
    setWordList(allWords.current);
  };
  const selectWord = (word: Word, index: number) => {
    //block use of buttons until result is determined
    active.current = false
    setSelection(word);
    setClicked((prev) => [...prev, index]);
  };
  const styleButton = (index: number) => {
    if (clicked.includes(index)) {
      //this button has been clicked
      if (currentWord && answers[index].word === currentWord.word) {
        //this is the correct answer
        return 'green';
      } else {
        //this is the wrong answer
        return 'red';
      }
    }
    return 'grey';
  };
  useEffect(() => {
    //fetch the words from the album
    let mounted = true;
    const results: Word[] = [];
    if (user) {
      const ref = collection(
        database,
        'Users',
        user.uid,
        'Albums',
        `${album ? album.id : 'All'}`,
        'Words'
      );
      getDocs(ref)
        .then((data) => {
          data.forEach((def) =>
            results.push({...def.data(), id: def.id} as Word)
          );
          if (mounted) {
            setWordList(results);
            setNewWord(true);
            //store a copy for wrong answers
            allWords.current = results;
          }
        })
        .catch((e) => Alert.alert('Error', e.message));
    }else{
      navigation.navigate('Home')
    }
    return () => {
      mounted = false;
    };
  }, [album, user, navigation]);
  useEffect(() => {
    const setWord = () => {
      //pick a random word from the total list
      const random = Math.floor(Math.random() * wordList.length);
      const chosenWord = {...wordList[random]};
      //select 3 random answers from the total words list
      const answersArray: Word[] = [];
      const remainingWords = allWords.current.filter(
        (x) => x.word !== chosenWord.word
      );
      for (let i = 0; i < 4; i++) {
        const temp = Math.floor(Math.random() * remainingWords.length);
        answersArray.push({...remainingWords[temp]});
      }
      //replace 1 of the words at random with the actual answer
      const answerIndex = Math.floor(Math.random() * 4);
      answersArray[answerIndex] = chosenWord;
      //store the index of the selected word so it can be removed easily later
      index.current = random;
      setCurrentWord(wordList[random]);
      setAnswers(answersArray);
      setNewWord(false);
      active.current = true;
    };
    if(!gameOver){
      if (newWord) {
        if(wordList.length > 0 || allWords.current.length === 0){
          //fetch a new word if there are no words (i.e) init render
          //or if there are still words in the list
          setWord();
        }
        else{
          //if wordList is 0 and allWord is not,
          //all words have been answered correctly
          setGameOver(true)
        }
      }
    }
    
  }, [newWord, wordList, gameOver]);
  useEffect(() => {
    //check for a correct answer
    if (selection && currentWord) {
      if (selection.word === currentWord.word) {
        //the answer is correct!
        if (clicked.length === 1) {
          //right on the first guess
         
          const newWordList = wordList.filter((x, i) => i !== index.current);
          setTimeout(() => {
            setScore((prev) => prev + 1);
            setAttempts((prev) => prev + 1);
            setNewWord(true);
            setSelection(null);
            setWordList(newWordList);
            setClicked([]);
          }, 2000);
        } else {
          setTimeout(() => {
            setNewWord(true);
            setSelection(null);
            setClicked([]);
          }, 2000);
        }
      } else {
        //re-activate buttons
        active.current = true;
        //the answer is wrong!
        if (clicked.length === 1) {
          setAttempts((prev) => prev + 1);
        }
      }
    }
  }, [selection, currentWord, wordList, clicked]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Score: {score}/{attempts}
      </Text>
      <View style={styles.quizArea}>
        <View style={styles.definitionContainer}>
          <Text style={styles.definition}>{currentWord?.definition}</Text>
        </View>
      </View>
      <View style={styles.answers}>
        {answers.map((word, i) => (
          <Button
            key={i}
            margin={5}
            height={50}
            width={300}
            onPress={() => {
              if (active.current) {
                selectWord(word, i);
                
              }
            }}
            text={word.word}
            bgColor={styleButton(i)}
            fontSize={25}
          />
        ))}
      </View>

      <Modal
        accessibilityLabel="menu modal"
        visible={gameOver}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalParent}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Game Over</Text>
            <Text style={styles.modalScore}>
              Your Score: {score}/{attempts} (
              {Math.round((score / attempts) * 100)})
            </Text>
            <Button
              height={75}
              width={200}
              onPress={() => restart()}
              text={'Play Again'}
              bgColor={'yellow'}
              fontSize={20}
              margin={5}
            />
            <Button
              height={75}
              width={200}
              onPress={
                album
                  ? () => navigation.navigate('Albums')
                  : () => navigation.navigate('Home')
              }
              text={'Quit'}
              bgColor={'green'}
              fontSize={20}
              margin={5}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Quiz;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  quizArea: {
    flex: 1,
  },
  definitionContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#dcdcdc',
    alignContent: 'center',
  },
  definition: {
    fontSize: 25,
  },
  answers: {
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  modalParent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
