import {createStackNavigator} from '@react-navigation/stack';

import LoginScreen from '../pages/LoginScreen';
import HomeScreen from '../pages/HomeScreen';

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
