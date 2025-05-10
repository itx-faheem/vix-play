import React from 'react';
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {fonts} from '../assets';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
  showBackButton?: boolean;
};

const PreviewLayout: React.FC<Props> = ({
  children,
  style,
  title,
  showBackButton = false,
}) => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      start={{x: 1.5, y: 0}}
      end={{x: 3, y: 10}}
      colors={['#FFF', '#5e17eb']}
      style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
        )}

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Spacer to balance layout */}
        <View style={{width: 32}} />
      </View>

      {/* Content */}
      {children}
    </LinearGradient>
  );
};

export {PreviewLayout};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(247, 244, 244, 0.3)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    boxShadow: '5 5 5 0 rgba(0,0,0,.05)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    flex: 1, // Makes the title take up available space
    fontFamily: fonts.BOLD,
  },
});
