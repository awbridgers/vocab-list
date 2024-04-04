import {render} from '@testing-library/react-native';
import AddWord from './addWord';
import {getReactNativePersistence, initializeAuth} from 'firebase/auth'

jest.mock('firebase/firestore')

describe('test', () => { 
  it('should test', () => { 
    render(<AddWord cancel = {jest.fn()} albumID='123456'/>)
   })
 })