import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamsList, TabParamList, Word} from '../../types/types';
import Button from '../Button/Button';
import {useAppSelector} from '../../redux/hooks';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import AppText from '../AppText/AppText';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Quiz'>,
  NativeStackScreenProps<RootStackParamsList>
>;

const Quiz = ({navigation, route}: Props) => {
  const allWords = useAppSelector((state) => state.words);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentWord, setCurrentWord] = useState<Word>();
  const [answers, setAnswers] = useState<Word[]>([]);
  const [clicked, setClicked] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const correctIndex = useRef<number>();
  const active = useRef<boolean>(false);
  const guessCount = useRef<number>(0);
  const wordList = useRef<Word[]>(allWords);
  const scheme = useColorScheme();
  const restart = () => {
    setGameOver(false);
    wordList.current = allWords;
    setGameStarted(false);
    setScore(0);
    setAttempts(0);
  };
  const setWord = () => {
    //pick a random word from the total list
    const random = Math.floor(Math.random() * wordList.current.length);
    const chosenWord = {...wordList.current[random]};
    //select 4 random answers from the total words list
    const answersArray: Word[] = [];
    let remainingWords = allWords.filter((x) => x.word !== chosenWord.word);
    for (let i = 0; i < 4; i++) {
      const temp = Math.floor(Math.random() * remainingWords.length);
      const answerWord = {...remainingWords[temp]};
      answersArray.push(answerWord);
      remainingWords = remainingWords.filter((x) => x.word !== answerWord.word);
    }
    //replace 1 of the words at random with the actual answer
    const answerIndex = Math.floor(Math.random() * 4);
    answersArray[answerIndex] = chosenWord;
    //store the index of the selected word so it can be removed easily later
    correctIndex.current = random;
    active.current = true;
    setCurrentWord(chosenWord);

    setAnswers(answersArray);

    guessCount.current = 0;
  };
  const selectWord = (word: Word, index: number) => {
    if (!currentWord) return;
    active.current = false;
    setClicked((prev) => [...prev, index]);
    //if the answer is correct
    if (word.word === currentWord.word) {
      wordList.current =
        guessCount.current === 0
          ? wordList.current.filter((x, i) => i !== correctIndex.current)
          : wordList.current;
      setTimeout(() => {
        setScore((prev) => (guessCount.current === 0 ? prev + 1 : prev));
        setAttempts((prev) => (guessCount.current === 0 ? prev + 1 : prev));
        setClicked([]);
        if (wordList.current.length) setWord();
        else {
          setGameOver(true);
          setGameStarted(false);
        }
      }, 2000);
    } else {
      //wrong answer!
      guessCount.current += 1;
      //only count attempts on first wrong guess. Per word, not per guess.
      setAttempts((prev) => (guessCount.current === 1 ? prev + 1 : prev));
      active.current = true;
    }
  };
  const startGame = () => {
    setGameStarted(true);
    setWord();
  };
  const styleButton = (index: number) => {
    if (clicked.includes(index)) {
      //this button has been clicked
      if (currentWord && answers[index].word === currentWord.word) {
        //this is the correct answer
        return '#59fa14';
      } else {
        //this is the wrong answer
        return 'red';
      }
    }
    return '#c0c0c0';
  };
  if (allWords.length < 5) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}
      >
        <AppText style={{fontSize: 30, textAlign: 'center'}}>
          Add more words to start the quiz.
        </AppText>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.title}>
          Score: {score}/{attempts}
        </AppText>
      </View>
      <View style={styles.quizArea}>
        {!gameStarted ? (
          <View>
            <TouchableOpacity style={styles.button} onPress={startGame}>
              <Text style={{fontSize: 30}}>Start</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.definitionContainer}>
              <AppText style={styles.definition}>
                {currentWord?.definition}
              </AppText>
            </View>
            <View style={styles.answers}>
              {answers.map((word, i) => (
                <TouchableOpacity
                  style={[styles.wordChoice, {backgroundColor: styleButton(i)}]}
                  key={i}
                  onPress={() => selectWord(word, i)}
                  disabled={clicked.includes(i) || !active.current}
                >
                  <Text style={{fontSize: 25}}>{word.word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      <Modal
        accessibilityLabel="menu modal"
        visible={!gameStarted && gameOver}
        animationType="slide"
        transparent={true}
      >
        <View style={[
              styles.modalParent,
              {
                backgroundColor:
                  scheme === 'dark'
                    ? ' rgba(149, 148, 148, 0.6)'
                    : 'rgba(85, 81, 81, 0.6)',
              },
            ]}>
          <View style={[styles.modal, {backgroundColor: scheme === 'dark' ?  '#222222' : '#efeeee'}]}>
            <AppText style={styles.modalTitle}>Game Over</AppText>
            <AppText style={styles.modalScore}>
              Your Score: {score}/{attempts} (
              {Math.round((score / attempts) * 100)})
            </AppText>
            <Button
              height={75}
              width={200}
              onPress={() => restart()}
              text={'Done'}
              bgColor={'#59fa14'}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  definitionContainer: {
    flexGrow: 1,
    margin: 5,
    justifyContent: 'center',
    alignContent: 'center',
  },
  definition: {
    fontSize: 25,
  },
  answers: {
    alignItems: 'center',
    paddingBottom: 10,
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
  button: {
    height: 75,
    width: 150,
    backgroundColor: '#59fa14',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  wordChoice: {
    margin: 5,
    height: 50,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
