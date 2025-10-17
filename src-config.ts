import { config } from 'dotenv';

// Load environment variables
config();

export interface ServerConfig {
  easypost: {
    apiKey: string;
    timeout: number;
  };
  context7: {
    apiKey?: string;
    baseUrl: string;
    timeout: number;
  };
  circuitBreaker: {
    threshold: number;
    timeout: number;
  };
  retry: {
    maxRetries: number;
    baseDelay: number;
  };
  logging: {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  };
}

export const serverConfig: ServerConfig = {
  easypost: {
    apiKey: process.env.EASYPOST_API_KEY || '',
    timeout: parseInt(process.env.EASYPOST_TIMEOUT || '30000'),
  },
  context7: {
    apiKey: process.env.CONTEXT7_API_KEY,
    baseUrl: process.env.CONTEXT7_BASE_URL || 'https://api.context7.ai/v1',
    timeout: parseInt(process.env.CONTEXT7_TIMEOUT || '30000'),
  },
  circuitBreaker: {
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || '5'),
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT || '60000'),
  },
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    baseDelay: parseInt(process.env.BASE_RETRY_DELAY || '2000'),
  },
  logging: {
    level: (process.env.LOG_LEVEL as ServerConfig['logging']['level']) || 'info',
  },
};

export function validateConfig(): void {
  if (!serverConfig.easypost.apiKey) {
    throw new Error('EASYPOST_API_KEY environment variable is required');
  }

  if (serverConfig.easypost.timeout < 1000) {
    throw new Error('EASYPOST_TIMEOUT must be at least 1000ms');
  }

  if (serverConfig.context7.timeout < 1000) {
    throw new Error('CONTEXT7_TIMEOUT must be at least 1000ms');
  }

  if (serverConfig.circuitBreaker.threshold < 1) {
    throw new Error('CIRCUIT_BREAKER_THRESHOLD must be at least 1');
  }

  if (serverConfig.circuitBreaker.timeout < 1000) {
    throw new Error('CIRCUIT_BREAKER_TIMEOUT must be at least 1000ms');
  }
}

// Validate configuration on module load
validateConfig();