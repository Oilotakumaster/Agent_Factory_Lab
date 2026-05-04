export interface TranscriptMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
