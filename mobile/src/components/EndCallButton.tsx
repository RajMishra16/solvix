import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius } from '../constants/theme';

interface EndCallButtonProps {
  onPress: () => void;
  size?: number;
}

export function EndCallButton({ onPress, size = 64 }: EndCallButtonProps) {
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
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.phoneIcon, { width: size * 0.4, height: size * 0.4 }]}>
          <View
            style={[
              styles.phoneReceiver,
              {
                width: size * 0.36,
                height: size * 0.14,
                borderRadius: size * 0.07,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.destructive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  phoneIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
  },
  phoneReceiver: {
    backgroundColor: '#ffffff',
  },
});
