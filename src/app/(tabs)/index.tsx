import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import type { ImageSource } from 'expo-image';

import Button from '@/components/button';
import ImageViewer from '@/components/image-viewer';
import IconButton from '@/components/icon-button';
import CircleButton from '@/components/circle-button';
import EmojiPicker from '@/components/emoji-picker';
import EmojiList from '@/components/emoji-list';
import EmojiSticker from '@/components/emoji-sticker';

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState<ImageSource | undefined>(
    undefined
  );

  const imageRef = useRef<ComponentRef<typeof View>>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cancelled = false;

    const requestMediaPermission = async () => {
      try {
        const MediaLibrary = await import('expo-media-library');
        const permission = await MediaLibrary.getPermissionsAsync({
          writeOnly: true,
        });

        if (!cancelled && !permission.granted) {
          await MediaLibrary.requestPermissionsAsync({
            writeOnly: true,
          });
        }
      } catch (error) {
        console.error('Media permission error:', error);
      }
    };

    requestMediaPermission();

    return () => {
      cancelled = true;
    };
  }, []);

  const pickImageAsync = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setPickedEmoji(undefined);
        setShowAppOptions(true);
      } else {
        Alert.alert('No image selected', 'Please select an image.');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Unable to open the image picker.');
    }
  };

  const onReset = () => {
    setShowAppOptions(false);
    setSelectedImage(undefined);
    setPickedEmoji(undefined);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    try {
      if (!imageRef.current) {
        throw new Error('The image container is not available.');
      }

      if (Platform.OS === 'web') {
        const dataUrl = await captureRef(imageRef.current, {
          format: 'jpg',
          quality: 0.95,
          result: 'data-uri',
        });

        const link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();

        return;
      }

      const localUri = await captureRef(imageRef.current, {
        format: 'jpg',
        quality: 1,
      });

      const MediaLibrary = await import('expo-media-library');

      await MediaLibrary.saveToLibraryAsync(localUri);

      Alert.alert('Saved', 'Your image was saved successfully.');
    } catch (error) {
      console.error('Save image error:', error);
      Alert.alert(
        'Save failed',
        'Unable to save your image. Please check the console for details.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer
            imgSource={PlaceholderImage}
            selectedImage={selectedImage}
          />

          {pickedEmoji && (
            <EmojiSticker
              imageSize={40}
              stickerSource={pickedEmoji}
            />
          )}
        </View>
      </View>

      {showAppOptions ? (
        <View style={styles.footerContainer}>
          <View style={styles.optionsRow}>
            <IconButton
              icon={{
                android: require('@expo/material-symbols/refresh.xml'),
                ios: 'arrow.counterclockwise',
                web: 'refresh',
              }}
              label="Reset"
              onPress={onReset}
            />

            <CircleButton onPress={onAddSticker} />

            <IconButton
              icon={{
                android: require('@expo/material-symbols/download.xml'),
                ios: 'square.and.arrow.down',
                web: 'download',
              }}
              label="Save"
              onPress={onSaveImageAsync}
            />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button
            theme="primary"
            label="Choose a photo"
            onPress={pickImageAsync}
          />

          <Button
            label="Use this photo"
            onPress={() => setShowAppOptions(true)}
          />
        </View>
      )}

      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList
          onSelect={setPickedEmoji}
          onCloseModal={onModalClose}
        />
      </EmojiPicker>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: Platform.select({ web: 96, default: 20 }),
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});