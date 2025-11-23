export interface AiMessage {
  from: 'user' | 'assistant';
  question?: string;
  summary?: string;
  sql?: string;
  result?: any;
  loading?: boolean;
  error?: string;
  createdAt?: string;
}
