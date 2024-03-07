import { configureStore } from '@reduxjs/toolkit';
import {database} from '../firebaseConfig'
import thunk from 'redux-thunk'
import user from './userSlice';
import albums from './albumSlice'
import words from './wordsSlice'

export const store = configureStore({
  reducer:{
    user: user,
    albums: albums,
    words: words
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch