import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface CallButtonProps {
  onPress: () => void;
  isConnecting: boolean;
  size?: number;
}

export function CallButton({ onPress, isConnecting, size = 80 }: CallButtonProps) {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 1.6 }]}>
      <Animated.View
        style={[
          styles.pulse,
          pulseStyle,
          { width: size * 1.4, height: size * 1.4, borderRadius: size * 0.7 },
        ]}
      />
      <Animated.View style={buttonStyle}>
        <TouchableOpacity
          style={[
            styles.button,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator color={Colors.primaryForeground} size="large" />
          ) : (
            <PhoneIcon size={size * 0.4} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function PhoneIcon({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.phoneIcon, { width: size, height: size }]}>
        <View
          style={[
            styles.phoneReceiver,
            {
              width: size * 0.9,
              height: size * 0.35,
              borderRadius: size * 0.175,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    backgroundColor: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  phoneIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
  },
  phoneReceiver: {
    backgroundColor: Colors.primaryForeground,
  },
});
