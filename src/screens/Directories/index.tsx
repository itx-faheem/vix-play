import React, {useState, useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StyleSheet} from 'react-native';
import {SCREEN_WIDTH} from '../utils';
import {PreviewLayout} from '../../reuseable';
import {fonts} from '../../assets';
type Album = MediaLibrary.Album;

const Directories: React.FC = () => {
  const navigation = useNavigation();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      if (!permissionResponse || permissionResponse.status !== 'granted') {
        const newPermission = await requestPermission();
        if (!newPermission || newPermission.status !== 'granted') {
          setLoading(false);
          return;
        }
      }

      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });

      const albumsWithVideos = await Promise.all(
        fetchedAlbums.map(async album => {
          const {totalCount} = await MediaLibrary.getAssetsAsync({
            album,
            mediaType: MediaLibrary.MediaType.video,
          });
          return totalCount > 0 ? album : null;
        }),
      );

      setAlbums(albumsWithVideos.filter(Boolean) as Album[]);
      setLoading(false);
    };

    fetchAlbums();
  }, []);

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('Videos', {album});
  };

  const renderAlbum = ({item}: {item: Album}) => (
    <TouchableOpacity
      style={styles.albumContainer}
      onPress={() => handleAlbumPress(item)}>
      <Icon name="folder" size={40} color="rgba(0,0,0,.4)" />
      <View style={{marginLeft: 12}}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.albumDetails}>{item.assetCount ?? 0} videos</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <PreviewLayout title="Your Video Collections">
      {loading ? (
        <ActivityIndicator size="large" color="gray" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={albums}
          keyExtractor={item => item.id}
          renderItem={renderAlbum}
          contentContainerStyle={{padding: 16}}
        />
      )}
    </PreviewLayout>
  );
};

export {Directories};
export const styles = StyleSheet.create({
  albumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    boxShadow: '5 5 5 0 rgba(0,0,0,.05)',
  },
  albumTitle: {
    fontSize: 16,
    color: '#333',
    fontFamily: fonts.BOLD,
  },
  albumDetails: {
    fontSize: 14,
    color: '#777',
    fontFamily: fonts.MEDIUM,
  },
  videoContainer: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: (SCREEN_WIDTH - 40) / 2,
    height: 120,
    borderRadius: 8,
  },
  videoTitle: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
