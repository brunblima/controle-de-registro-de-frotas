import 'react-native-gesture-handler'


import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Routes from './src/routes/index';
import {AuthProvider} from './src/context/AuthContext';

export default function App() {
  return (
   
      <NavigationContainer initialRouteName="Login">
        <AuthProvider>
          <StatusBar backgroundColor="#319DD9" barStyle="light-content" />
          <Routes />
        </AuthProvider>
      </NavigationContainer>
    
  );
}
