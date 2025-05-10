// navigation/StackNavigator.tsx
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {Onboarding, VideoPlayer, Directories} from './screens';
import {Videos} from './screens/Videos';
import * as SplashScreen from 'expo-splash-screen';
import {isOnboardingVisited} from './realm/schemas/actions';

SplashScreen.preventAutoHideAsync()
  .then(result =>
    console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`),
  )
  .catch(console.warn);

type RootStackParamList = {
  Onboarding: undefined;
  Directories: undefined;
  VideoPlayer: undefined;
  Videos: {
    album: any;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<
    'Onboarding' | 'Directories'
  >('Onboarding');

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const visited = isOnboardingVisited();
      setInitialRoute(visited ? 'Directories' : 'Onboarding');
      setIsReady(true);
      await SplashScreen.hideAsync();
    };

    checkOnboardingStatus();
  }, []);

  if (!isReady) {
    return null; // Show a loading indicator or keep the splash screen visible
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Directories"
          component={Directories}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Videos"
          component={Videos}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
