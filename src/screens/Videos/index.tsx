/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Animated,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {useRoute, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from '../utils';
import {PreviewLayout} from '../../reuseable';
import {fonts} from '../../assets';
import {Video, ResizeMode} from 'expo-av';
import Slider from '@react-native-community/slider';
import * as ScreenOrientation from 'expo-screen-orientation';

type RouteParams = {
  album: MediaLibrary.Album;
};

type Asset = MediaLibrary.Asset;

const Videos: React.FC = () => {
  const route = useRoute();
  const {album} = route.params as RouteParams;
  const navigation = useNavigation();
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

  const [videoState, setVideoState] = useState({
    videos: [] as Asset[],
    loading: false,
    refreshing: false,
  });

  const [fullscreen, setfullscreen] = useState(false);

  const updateState = (updatedState: Partial<typeof videoState>) => {
    setVideoState(prevState => ({...prevState, ...updatedState}));
  };

  useEffect(() => {
    const fetchVideos = async () => {
      updateState({loading: true});
      const {assets} = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: MediaLibrary.MediaType.video,
        first: 50,
      });
      updateState({videos: assets, loading: false, refreshing: false});
    };
    fetchVideos();
  }, [album.id, videoState.refreshing]);

  const onRefresh = () => {
    updateState({refreshing: true});
  };
  const renderVideo = ({item}: {item: Asset}) => (
    <Pressable
      style={styles.videoContainer}
      onPress={() => navigation.navigate('VideoPlayer', {video: item})}>
      <Image source={{uri: item.uri}} style={styles.videoThumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.filename}</Text>
        <Text style={styles.videoDetails}>
          {(item.duration / 60).toFixed(2)} min | {Math.round(item.duration)}{' '}
          sec
        </Text>
      </View>
    </Pressable>
  );
  const HeaderComponent = () => {
    if (videoState.videos.length === 0) return null;

    const item = videoState.videos[0];
    const videoRef = useRef<Video>(null);

    const [iconShow, setIconShow] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [soundPlay, setSoundPlay] = useState(false);
    const [progress, setProgress] = useState({
      positionMillis: 0,
      seekableDuration: 100,
    });

    const handleIcons = () => {
      setIconShow(prevState => !prevState);
    };

    const togglePlayPause = async () => {
      if (!videoRef.current) return;
      const status = await videoRef.current.getStatusAsync();

      if (status?.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    };

    const toggleSound = () => {
      setSoundPlay(!soundPlay);
    };

    return (
      <Pressable onPress={handleIcons} style={styles.headerContainer}>
        <Video
          ref={videoRef}
          source={{uri: item.uri}}
          style={{
            width: '100%',
            height: 250,
            flex: 1,
          }}
          shouldPlay={isPlaying}
          isLooping
          isMuted={soundPlay}
          resizeMode={ResizeMode.COVER}
          onPlaybackStatusUpdate={status => {
            if (status?.positionMillis !== undefined) {
              setProgress(status);
            }
          }}
        />

        {iconShow && (
          <View style={styles.overlay}>
            <Icon
              name="rewind-10"
              size={36}
              color="#FFF"
              onPress={() => {
                videoRef.current?.setPositionAsync(
                  Math.max(0, progress.positionMillis - 10000),
                );
              }}
            />
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={48}
              color="#FFF"
              onPress={togglePlayPause}
            />
            <Icon
              name="fast-forward-10"
              size={36}
              color="#FFF"
              onPress={() => {
                videoRef.current?.setPositionAsync(
                  progress.positionMillis + 10000,
                );
              }}
            />
          </View>
        )}
        {iconShow && (
          <>
            <View style={styles.fullscreenIconContainer}>
              <Icon
                onPress={() => {
                  setIsPlaying(false);
                  navigation.navigate('VideoPlayer', {
                    video: videoState.videos[0],
                  });
                }}
                color={'#FFF'}
                name={fullscreen ? 'fullscreen-exit' : 'fullscreen'}
                size={26}
              />
            </View>
            <View style={styles.sliderSideContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={progress.seekableDuration}
                minimumTrackTintColor="#E50914"
                maximumTrackTintColor="#888"
                thumbTintColor="#E50914"
                value={progress.positionMillis}
                onValueChange={x => videoRef.current?.setPositionAsync(x)}
              />
              <Icon
                onPress={toggleSound}
                name={soundPlay ? 'volume-mute' : 'volume-high'}
                color={'#fff'}
                size={26}
              />
            </View>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <PreviewLayout showBackButton title={`Videos in ${album?.title}`}>
      {videoState.loading && !videoState.refreshing ? (
        <ActivityIndicator size="large" color="gray" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={videoState.videos}
          keyExtractor={item => item.id}
          renderItem={renderVideo}
          contentContainerStyle={{marginTop: 16}}
          ListHeaderComponent={<HeaderComponent />}
          refreshControl={
            <RefreshControl
              refreshing={videoState.refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </PreviewLayout>
  );
};
export {Videos};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // headerVideo: {
  //   width: '100%',
  //   height: 250,
  // },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  videoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 8,
    boxShadow: '5 5 5 0 rgba(0,0,0,.05)',
  },
  videoThumbnail: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  videoInfo: {
    marginLeft: 10,
    flex:1
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  videoDetails: {
    fontSize: 14,
    color: 'gray',
  },

  fullscreenIconContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  sliderSideContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  slider: {
    flex: 1,
    height: 4,
    marginHorizontal: 10,
  },
});



