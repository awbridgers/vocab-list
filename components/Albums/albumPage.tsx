import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Album, RootStackParamsList} from '../../types/types';
import {useAppSelector} from '../../redux/hooks';
import {useMemo} from 'react';
import WordList from './wordList';

type Props = NativeStackScreenProps<RootStackParamsList, 'Album'>;

const AlbumPage = ({navigation, route}: Props) => {
  const words = useAppSelector((state) => state.words);
  const {album} = route.params;
  const list = useAppSelector((state) => state.albums);
  const albumInfo = useMemo<Album | undefined>(() => {
    return list.find((x) => x.id === album);
  }, [album, list]);

  const data = useMemo(
    () => words.filter((x) => x.albums.includes(album)),
    [words]
  );
  return (
    <WordList
      data={data}
      back={() => navigation.goBack()}
      album={albumInfo}
    />
  );
};

export default AlbumPage;
