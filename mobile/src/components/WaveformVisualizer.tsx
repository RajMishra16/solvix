import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_COUNT = 40;
const BAR_WIDTH = 4;
const BAR_GAP = 3;
const MAX_BAR_HEIGHT = 120;
const MIN_BAR_HEIGHT = 8;

interface WaveformVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export function WaveformVisualizer({ isActive, isSpeaking }: WaveformVisualizerProps) {
  const vadScore = isSpeaking ? 0.7 : 0.2;
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => i);
  
  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {bars.map((_, index) => (
          <WaveformBar
            key={index}
            index={index}
            isActive={isActive}
            vadScore={vadScore}
            isSpeaking={isSpeaking}
            totalBars={BAR_COUNT}
          />
        ))}
      </View>
    </View>
  );
}

interface WaveformBarProps {
  index: number;
  isActive: boolean;
  vadScore: number;
  isSpeaking: boolean;
  totalBars: number;
}

function WaveformBar({ index, isActive, vadScore, isSpeaking, totalBars }: WaveformBarProps) {
  const height = useSharedValue(MIN_BAR_HEIGHT);
  const opacity = useSharedValue(0.3);
  
  const centerDistance = Math.abs(index - totalBars / 2) / (totalBars / 2);
  const baseMultiplier = 1 - centerDistance * 0.6;

  useEffect(() => {
    if (!isActive) {
      height.value = withTiming(MIN_BAR_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0.3, { duration: 300 });
      return;
    }

    if (isSpeaking) {
      const randomDelay = index * 30;
      const randomDuration = 400 + Math.random() * 200;
      
      const targetHeight = MIN_BAR_HEIGHT + (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * baseMultiplier * (0.5 + vadScore * 0.5);
      
      height.value = withRepeat(
        withSequence(
          withTiming(targetHeight * (0.7 + Math.random() * 0.3), {
            duration: randomDuration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          withTiming(MIN_BAR_HEIGHT + 10, {
            duration: randomDuration * 0.8,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        ),
        -1,
        true
      );
      opacity.value = withTiming(0.8 + vadScore * 0.2, { duration: 200 });
    } else {
      height.value = withSpring(MIN_BAR_HEIGHT + 4, {
        damping: 15,
        stiffness: 100,
      });
      opacity.value = withTiming(0.4, { duration: 200 });
    }
  }, [isActive, isSpeaking, vadScore, index, baseMultiplier]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        animatedStyle,
        {
          backgroundColor: isSpeaking ? Colors.primary : Colors.primaryLight,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_BAR_HEIGHT + 40,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BAR_GAP,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
  },
});
