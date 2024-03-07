import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {User} from 'firebase/auth'

type userType = User|null

const initialState: userType = null as userType;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers:{
    changeUser: (state, action:PayloadAction<User|null>) => action.payload
  }
})

export const {changeUser} = userSlice.actions;
export default userSlice.reducer;