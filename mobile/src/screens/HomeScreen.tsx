import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useConversation } from '@elevenlabs/react-native';
import { AudioSession } from '@livekit/react-native';
import { CallButton } from '../components/CallButton';
import { CallModal } from './CallModal';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';
import { ELEVENLABS_AGENT_ID } from '@env';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<ConnectionStatus>('disconnected');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setCallStatus('connected');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      resetCallState();
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    },
    onModeChange: ({ mode }) => {
      console.log('Mode changed:', mode);
      setIsAgentSpeaking(mode === 'speaking');
    },
    onStatusChange: ({ status }) => {
      console.log('Status changed:', status);
      setCallStatus(status as ConnectionStatus);
    },
  });

  const handleStartCall = useCallback(async () => {
    console.log('Starting call with agent:', ELEVENLABS_AGENT_ID);
    setIsCallModalVisible(true);
    setCallStatus('connecting');
    try {
      // Configure iOS audio session for voice chat
      await AudioSession.setAppleAudioConfiguration({
        audioCategory: 'playAndRecord',
        audioMode: 'voiceChat',
        audioCategoryOptions: [
          'allowBluetooth',
          'allowBluetoothA2DP',
          'defaultToSpeaker',
        ],
      });
      console.log('Audio session configured');
      
      const session = await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
      });
      console.log('Session started:', session);
    } catch (error) {
      console.error('Failed to start session:', error);
      console.error('Error type:', typeof error);
      console.error('Error string:', String(error));
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      setIsCallModalVisible(false);
    }
  }, [conversation]);

  const resetCallState = useCallback((status: ConnectionStatus = 'disconnected') => {
    setIsCallModalVisible(false);
    setIsMuted(false);
    setCallStatus(status);
    setIsAgentSpeaking(false);
  }, []);

  const handleEndCall = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
    resetCallState();
  }, [conversation, resetCallState]);

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    conversation.setMicMuted(newMuted);
  }, [isMuted, conversation]);

  const handleCloseModal = useCallback(() => {
    if (conversation.status === 'connected') {
      handleEndCall();
    } else {
      resetCallState('disconnected');
    }
  }, [conversation.status, handleEndCall, resetCallState]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#ffffff', '#f0fdfa']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={[styles.content, { paddingTop: insets.top + Spacing.md }]}>
          {/* Branding - Top Center */}
          <Animated.View 
            entering={FadeIn.duration(600)}
            style={styles.header}
          >
            <View style={styles.brandContainer}>
              <LeafIcon size={20} />
              <Text style={styles.brandName}>Solvix</Text>
            </View>
          </Animated.View>

          {/* Main Content - Centered */}
          <View style={styles.mainContent}>
            <Animated.View 
              entering={FadeIn.duration(600).delay(200)}
              style={styles.centerContainer}
            >
              <CallButton
                onPress={handleStartCall}
                isConnecting={conversation.status === 'connecting'}
                size={120}
              />
              <View style={styles.textContainer}>
                <Text style={styles.hintText}>Tap to talk</Text>
                <Text style={styles.subHintText}>Ask about your energy system</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </LinearGradient>

      <CallModal
        visible={isCallModalVisible}
        onClose={handleCloseModal}
        status={callStatus}
        isSpeaking={isAgentSpeaking}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onEndCall={handleEndCall}
        agentName="Solvix Assistant"
      />
    </View>
  );
}

function LeafIcon({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.65,
          height: size * 0.8,
          backgroundColor: Colors.primary,
          borderTopLeftRadius: size * 0.45,
          borderTopRightRadius: size * 0.08,
          borderBottomLeftRadius: size * 0.08,
          borderBottomRightRadius: size * 0.45,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    opacity: 0.9,
  },
  brandName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xxl * 2, // Push it up slightly visually to account for optical center
  },
  centerContainer: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  hintText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.foreground,
  },
  subHintText: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
});
