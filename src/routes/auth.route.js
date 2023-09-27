import {createStackNavigator} from '@react-navigation/stack';

import LoginScreen from '../pages/LoginScreen';

const Stack = createStackNavigator();

export default function AuthRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
