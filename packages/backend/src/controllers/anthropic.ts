import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

// The Anthropic client will be initialized when needed
let anthropic: Anthropic;

/**
 * Controller to handle Claude API requests
 */
export const processClaudeRequest = async (req: Request, res: Response) => {
  try {
    // Validate that API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'API key not configured',
        message: 'Anthropic API key is not configured in the environment variables.'
      });
    }
    
    // Initialize the Anthropic client with the validated API key
    if (!anthropic) {
      anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY as string,
      });
    }

    // Extract request parameters
    const { message, options } = req.body;

    // Validate message is a non-empty string
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Message must be a non-empty string'
      });
    }

      // Set default or custom model
  const model = options?.model ?? 'claude-3-opus-20240229';

    // Send message to Claude API
    const response = await anthropic.messages.create({
          model,
    max_tokens: Math.min(Math.max(options?.max_tokens ?? 1024, 1), 4096), // Clamp between 1 and 4096 tokens
    messages: [{ role: 'user', content: message }],
    temperature: Math.min(Math.max(options?.temperature ?? 0.7, 0), 1), // Clamp between 0 and 1
    });

    // Return the response
    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error: any) {
    // Log only essential error information without sensitive details
    console.error('Error processing Claude request:', {
      name: error.name,
      message: error.message,
      statusCode: error.response?.status || 'N/A'
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process request',
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
};
