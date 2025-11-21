import { Canvas, Circle, Group, Image, Mask, Rect, useImage } from '@shopify/react-native-skia';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Easing, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/theme.context';

const { width, height } = Dimensions.get('window');
const MAX_RADIUS = Math.hypot(width, height);

export const ThemeTransitionOverlay = () => {
  const { transitionImage, completeTransition, nextTheme } = useTheme();
  const image = useImage(transitionImage);
  const radius = useSharedValue(0);
  const [pointerEvents, setPointerEvents] = useState<'none' | 'auto'>('none');

  useEffect(() => {
    console.log("Overlay Effect:", { hasImage: !!image, nextTheme });
    if (image && transitionImage && nextTheme) {
      console.log("🚀 Starting animation...");
      setPointerEvents('auto');
      radius.value = 0;
      radius.value = withTiming(MAX_RADIUS, { duration: 800, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) {
            console.log("🏁 Animation finished");
            runOnJS(finishTransition)();
        }
      });
    }
  }, [image, transitionImage, nextTheme]);

  const finishTransition = () => {
    completeTransition();
    setPointerEvents('none');
    // Do NOT reset radius here to avoid flash of old theme before unmount
  };

  if (!image || !transitionImage) {
    return null;
  }

  return (
    <View style={[styles.container, { pointerEvents }]} pointerEvents={pointerEvents}>
      <Canvas style={styles.canvas}>
        <Mask
          mode="luminance"
          mask={
            <Group>
              {/* White Rect = Show the Image (Old Theme) */}
              <Rect x={0} y={0} width={width} height={height} color="white" />
              {/* Black Circle = Hide the Image (Reveal New Theme underneath) */}
              <Circle cx={width / 2} cy={height / 2} r={radius} color="black" />
            </Group>
          }
        >
          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Mask>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Ensure it's on top
  },
  canvas: {
    flex: 1,
  },
});
