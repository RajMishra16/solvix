import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { EndCallButton } from '../components/EndCallButton';
import { MuteButton } from '../components/MuteButton';
import { useCallTimer } from '../hooks/useCallTimer';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

interface CallModalProps {
  visible: boolean;
  onClose: () => void;
  status: ConnectionStatus;
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  agentName?: string;
}

export function CallModal({
  visible,
  onClose,
  status,
  isSpeaking,
  isMuted,
  onToggleMute,
  onEndCall,
  agentName = 'Solvix Assistant',
}: CallModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const { formattedDuration } = useCallTimer(status === 'connected');

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return isSpeaking ? 'Speaking' : 'Listening';
      default:
        return 'Disconnected';
    }
  };

  const handleEndCall = () => {
    onEndCall();
    setTimeout(onClose, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.container, animatedStyle]}>
        <LinearGradient
          colors={['#0a4a3d', '#042f27', '#021a15']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={[styles.content, { paddingTop: insets.top + Spacing.lg }]}>
            <View style={styles.header}>
              <View style={styles.agentInfo}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.avatar}
                  >
                    <LeafIcon size={32} />
                  </LinearGradient>
                  {status === 'connected' && (
                    <View style={styles.statusDot} />
                  )}
                </View>
                <Text style={styles.agentName}>{agentName}</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusIndicator,
                      status === 'connected' && styles.statusIndicatorActive,
                      status === 'connecting' && styles.statusIndicatorConnecting,
                    ]}
                  />
                  <Text style={styles.statusText}>{getStatusText()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.visualizerContainer}>
              <WaveformVisualizer
                isActive={status === 'connected'}
                isSpeaking={isSpeaking}
              />
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timer}>{formattedDuration}</Text>
            </View>

            <View style={[styles.controls, { paddingBottom: insets.bottom + Spacing.xl }]}>
              <MuteButton
                isMuted={isMuted}
                onPress={onToggleMute}
                size={60}
              />
              <EndCallButton onPress={handleEndCall} size={72} />
              <View style={{ width: 60 }} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

function LeafIcon({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.7,
          height: size * 0.85,
          backgroundColor: Colors.primaryForeground,
          borderTopLeftRadius: size * 0.5,
          borderTopRightRadius: size * 0.1,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.5,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021a15',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  agentInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#0a4a3d',
  },
  agentName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mutedForeground,
  },
  statusIndicatorActive: {
    backgroundColor: '#22c55e',
  },
  statusIndicatorConnecting: {
    backgroundColor: '#eab308',
  },
  statusText: {
    fontSize: FontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  visualizerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timer: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
});
