import axios from 'axios';
import { PUBLIC_BACKEND_URL } from './validateEnv';

const API_BASE_URL = PUBLIC_BACKEND_URL || 'http://localhost:3001/api/v1';

/**
 * Client for interacting with the Anthropic Claude API through our backend
 */
export const claudeClient = {
  /**
   * Send a message to Claude through the backend API
   * 
   * @param message - The message to send to Claude
   * @param options - Additional options for the Claude API
   * @returns The API response
   */
  sendMessage: async (message: string, options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/anthropic/claude`, {
        message,
        options
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error calling Claude API:', error.message || 'Unknown error');
      throw new Error(error.response?.data?.error || error.message || 'Failed to communicate with Claude API');
    }
  }
};
