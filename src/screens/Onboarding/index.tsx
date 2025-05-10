import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Install this via `react-native-vector-icons`
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../utils';
import {imageAssets} from '../../assets';
import {PreviewLayout} from '../../reuseable';
import {markOnboardingVisited} from '../../realm/schemas/actions';

const {width, height} = Dimensions.get('window');

// Font configuration
const fonts = {
  BOLD: 'Nunito-Bold',
  MEDIUM: 'Nunito-Medium',
  REGULAR: 'Nunito-Regular',
  SEMI_BOLD: 'Nunito-SemiBold',
};

// Dummy onboarding data
const onboardingData = [
  {
    id: '1',
    image: imageAssets.ob1, // Replace with your actual image path
    title: 'Welcome to VideoPlayer',
    description:
      'Stream and explore videos with ease and high-quality playback.',
  },
  {
    id: '2',
    image: imageAssets.ob2,
    title: 'Organized Directories',
    description:
      'Keep all your videos well-organized in customized directories.',
  },
  {
    id: '3',
    image: imageAssets.ob3,
    title: 'Enjoy Seamless Playback',
    description:
      'Experience buffer-free streaming and adaptive playback settings.',
  },
];

type Props = {
  navigation: any;
};

const Onboarding = ({navigation}: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));
  const translateX = useSharedValue(0);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{translateX: withTiming(translateX.value, {duration: 500})}],
    opacity: withTiming(translateX.value === 0 ? 1 : 0.5, {duration: 500}),
  }));
  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      scale.value = withTiming(1.2, {duration: 150}, () => {
        scale.value = withTiming(1);
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      markOnboardingVisited();
      navigation.replace('Directories');
      console.log('Finish onboarding');
    }
  };

  const renderItem = ({item}: {item: (typeof onboardingData)[0]}) => (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <Image source={item.image} style={styles.image} />

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={[onboardingData[currentIndex]]}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
      />
      <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Icon
            name={
              currentIndex === onboardingData.length - 1
                ? 'check'
                : 'arrow-right'
            }
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#ffffff',
    height: '70%',
    marginTop: 24,
  },
  image: {
    width: '100%',
    height: height * 0.4,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.BOLD,
    fontSize: 24,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.REGULAR,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `3 3 3 0 rgba(0, 0, 0, 0.5)`,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
});

export {Onboarding};
