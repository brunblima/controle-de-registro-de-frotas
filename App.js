import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Routes from './src/routes';

export default function App() {
  return (
    <NavigationContainer initialRouteName="Login">
      <StatusBar backgroundColor="#319DD9" barStyle="light-content" />
      <Routes />
    </NavigationContainer>
  );
}
