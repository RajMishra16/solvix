export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type AgentMode = 'listening' | 'speaking';

export interface ConversationState {
  status: ConnectionStatus;
  isMuted: boolean;
  agentMode: AgentMode;
  callDuration: number;
  vadScore: number;
}
