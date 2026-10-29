
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Image, type ImageSource } from 'expo-image';

type Props = {
  imageSize: number;
  stickerSource: ImageSource;
};

const IMAGE_WIDTH = 320;
const IMAGE_HEIGHT = 440;

export default function EmojiSticker({
  imageSize,
  stickerSource,
}: Props) {
  const scaleImage = useSharedValue(imageSize);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      const size =
        scaleImage.value === imageSize
          ? imageSize * 2
          : imageSize;

      scaleImage.value = withSpring(size);

      translateX.value = clamp(
        translateX.value,
        0,
        Math.max(0, IMAGE_WIDTH - size)
      );

      translateY.value = clamp(
        translateY.value,
        0,
        Math.max(0, IMAGE_HEIGHT - size)
      );
    });

  const drag = Gesture.Pan()
    .onChange((event) => {
      const size = scaleImage.value;

      translateX.value = clamp(
        translateX.value + event.changeX,
        0,
        Math.max(0, IMAGE_WIDTH - size)
      );

      translateY.value = clamp(
        translateY.value + event.changeY,
        0,
        Math.max(0, IMAGE_HEIGHT - size)
      );
    });

  const gesture = Gesture.Simultaneous(drag, doubleTap);

  const stickerStyle = useAnimatedStyle(() => ({
    width: withSpring(scaleImage.value),
    height: withSpring(scaleImage.value),
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.sticker, stickerStyle]}>
        <Image
          source={stickerSource}
          style={styles.image}
          contentFit="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sticker: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
});
