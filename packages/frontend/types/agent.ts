/**
 * Types for the AI Agent API
 */

// Request types
export interface AgentRequest {
  prompt: string;
  options?: AgentOptions;
}

export interface AgentOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

// Response types
export interface AgentResponse {
  success: boolean;
  data?: AgentResponseData;
  error?: string;
}

export interface AgentResponseData {
  id: string;
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Timestamp when the limit resets
}

// Stream response format
export interface StreamChunk {
  id: string;
  type: 'content_block_delta' | 'message_stop';
  index: number;
  delta?: {
    type: 'text_delta';
    text: string;
  };
}
