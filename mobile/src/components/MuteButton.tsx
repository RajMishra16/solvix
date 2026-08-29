import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '../constants/theme';

interface MuteButtonProps {
  isMuted: boolean;
  onPress: () => void;
  size?: number;
}

export function MuteButton({ isMuted, onPress, size = 56 }: MuteButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          isMuted && styles.buttonMuted,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <MicrophoneIcon size={size * 0.45} isMuted={isMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function MicrophoneIcon({ size, isMuted }: { size: number; isMuted: boolean }) {
  const iconColor = isMuted ? '#ffffff' : Colors.foreground;
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[
          styles.micBody,
          {
            width: size * 0.45,
            height: size * 0.65,
            borderRadius: size * 0.225,
            borderColor: iconColor,
          },
        ]}
      />
      <View
        style={[
          styles.micStand,
          {
            width: size * 0.65,
            height: size * 0.35,
            borderColor: iconColor,
            borderRadius: size * 0.15,
          },
        ]}
      />
      <View
        style={[
          styles.micBase,
          {
            width: size * 0.08,
            height: size * 0.2,
            backgroundColor: iconColor,
          },
        ]}
      />
      {isMuted && (
        <View
          style={[
            styles.muteLine,
            {
              width: size * 1.1,
              height: 2.5,
              backgroundColor: '#ffffff',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderColor: 'rgba(239, 68, 68, 0.9)',
  },
  micBody: {
    position: 'absolute',
    top: '10%',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  micStand: {
    position: 'absolute',
    top: '35%',
    borderWidth: 2,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  micBase: {
    position: 'absolute',
    bottom: '10%',
  },
  muteLine: {
    position: 'absolute',
  },
});
