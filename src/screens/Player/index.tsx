import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  TouchableOpacity,
  Pressable,
  StatusBar,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { fonts, imageAssets } from '../../assets';
import { SCREEN_WIDTH } from '../utils';
import { PreviewLayout } from '../../reuseable';

const screenWidth = Dimensions.get('window').width;
const screenHeight  = Dimensions.get('window').height;

const VideoPlayer: React.FC = ({route}) => {
  const video = useRef<Video>(null);
  
  const [seekValue] = useState(new Animated.Value(0));
  const [state, setState] = useState({
    isPlaying: true,
    playbackRate: 1,
    brightness: 0.5,
    volume: 1,
    overlayVisible: false,
    playbackPosition: 0,
    playbackDuration: 1,
    is2xFaster: false,
  });

  // Update state helper
  const updateState = (updated: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updated }));
  };

  // Screen orientation management
  useEffect(() => {
    StatusBar.setHidden(true);
    const changeScreenOrientation = async orientation => {
      console.log({ orientation });
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    };

    changeScreenOrientation();
    const orientationListener = ScreenOrientation.addOrientationChangeListener(
      orientation => changeScreenOrientation(orientation),
    );

    return async () => {
      ScreenOrientation.removeOrientationChangeListener(orientationListener);
      StatusBar.setHidden(false);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.DEFAULT,
      );
    };
  }, []);

  useEffect(() => {
    if (state.playbackPosition && state.playbackDuration) {
      Animated.timing(seekValue, {
        toValue:
          (state.playbackPosition / state.playbackDuration) * SCREEN_WIDTH,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [state.playbackPosition, state.playbackDuration]);

  // Toggle overlay visibility
  const toggleOverlay = () => {
    updateState({ overlayVisible: true });
    setTimeout(() => updateState({ overlayVisible: false }), 8000);
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    if (state.isPlaying) {
      video.current?.pauseAsync();
    } else {
      video.current?.playAsync();
    }
    updateState({ isPlaying: !state.isPlaying });
  };

  // Long press for 2x playback speed  ---
  const handleLongPress = () => {
    video.current?.setRateAsync(2, true);
    updateState({ is2xFaster: true });
  };

  const handlePressRelease = () => {
    video.current?.setRateAsync(state.playbackRate, true);
    updateState({ is2xFaster: false });
  };

  // Adjust volume and brightness  --
  const handleVolumeChange = (value: number) => {
    updateState({ volume: value });
    video.current?.setVolumeAsync(value);
  };
  // handle seekVeo
  const handleSeekVideoPosition = (value: number) => {
    updateState({ playbackPosition: value });
    video.current?.setPositionAsync(value);
  };

  // Skip forward/backward
  const skipSeconds = (seconds: number) => {
    if (video.current) {
      const newPosition = Math.max(
        0,
        Math.min(
          state.playbackPosition + seconds * 1000,
          state.playbackDuration,
        ),
      );
      video.current.setPositionAsync(newPosition);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPressOut={handlePressRelease}
        onLongPress={handleLongPress}
        onPress={toggleOverlay}
        style={{ flex: 1, }}
        >
        <Video
          ref={video}
          style={styles.video}
          source={{ uri: route.params.video.uri }}
          useNativeControls={false}
          resizeMode='contain'
          isLooping
          shouldPlay={true}
          volume={state.volume}
          onPlaybackStatusUpdate={status =>
            updateState({
              playbackPosition: status.positionMillis || 0,
              playbackDuration: status.durationMillis || 1,
            })
          }
        />
      </Pressable>
      {/* 2x Speed Tag -- */}
      {state.is2xFaster && (
        <View style={styles.fasterTag}>
          <Text style={styles.fasterText}>2x Faster</Text>
        </View>
      )}

      {/* Overlay  ---  */}
      {state.overlayVisible && (
        <View style={styles.overlay}>
          {/* Play/Pause Button --- */}
          <TouchableOpacity onPress={togglePlayPause} style={styles.playPause}>
            <Icon
              name={state.isPlaying ? 'pause' : 'play'}
              size={48}
              color="#FFF"
            />
          </TouchableOpacity>

          {/* Skip Buttons --- */}
          <TouchableOpacity
            onPress={() => skipSeconds(-10)}
            style={[styles.skipButton, styles.skipBack]}>
            <Icon name="rewind-10" size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => skipSeconds(10)}
            style={[styles.skipButton, styles.skipForward]}>
            <Icon name="fast-forward-10" size={36} color="#FFF" />
          </TouchableOpacity>

          {/* Settings --- */}
          <TouchableOpacity style={styles.settingsButton}>
            <Icon name="cog" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Animated Seek Bar --- */}
          <View style={styles.seekBarContainer}>
            <Slider
              style={styles.slider}
              value={state.playbackPosition}
              onSlidingComplete={handleSeekVideoPosition}
              minimumValue={0}
              maximumValue={state.playbackDuration}
              minimumTrackTintColor="#E50914"
              maximumTrackTintColor="#888"
              thumbTintColor="#E50914"
            />
            <Text style={styles.timeText}>
              {Math.floor(state.playbackPosition / 1000) || 0}s /{' '}
              {Math.floor(state.playbackDuration / 1000) || 0}s
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: '#000'},
  video: { flex: 1, width:'100%'},
  fasterTag: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
  fasterText: { color: '#FFF', fontSize: 10, fontFamily: fonts.MEDIUM },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPause: { alignSelf: 'center' },
  skipButton: { position: 'absolute', top: '50%' },
  skipBack: { left: '25%' },
  skipForward: { right: '25%' },
  settingsButton: { position: 'absolute', top: 20, right: 20 },
  slidersContainer: { position: 'absolute', bottom: 50, width: '80%' },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sliderLabel: { color: '#FFF', fontSize: 14, marginRight: 10 },
  slider: { flex: 1,height: 5, },

  seekBarContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 5,
    justifyContent: 'center',
  },
  seekBar: {
    height: 5,
    backgroundColor: '#FFF',
  },
  timeText: {
    position: 'absolute',
    right: 10,
    top: -25,
    color: '#FFF',
    fontSize: 12,
  },
});

export { VideoPlayer };