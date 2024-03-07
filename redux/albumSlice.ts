import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { Album } from '../types/types';


const initialState: Album[] = [];


export const albumSlice = createSlice({
  name: 'albums',
  initialState,
  reducers:{
    updateAlbums: (state, action: PayloadAction<Album[]>)=>action.payload
  }
})

export const {updateAlbums} = albumSlice.actions;
export default albumSlice.reducer;