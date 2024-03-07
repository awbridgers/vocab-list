import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Word } from '../types/types';

const initialState : Word[] = [];
export const wordsSlice = createSlice({
  name: 'words',
  initialState,
  reducers:{
    updateWords: (state: Word[], action:PayloadAction<Word[]>)=>action.payload
  }
})

export const {updateWords} = wordsSlice.actions;
export default wordsSlice.reducer;