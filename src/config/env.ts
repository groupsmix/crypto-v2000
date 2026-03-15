function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  UPSTASH_REDIS_REST_URL: getEnvVar("UPSTASH_REDIS_REST_URL", ""),
  UPSTASH_REDIS_REST_TOKEN: getEnvVar("UPSTASH_REDIS_REST_TOKEN", ""),
  REDIS_URL: getEnvVar("REDIS_URL", "redis://localhost:6379"),
  NEXT_PUBLIC_APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  NEWSAPI_KEY: getEnvVar("NEWSAPI_KEY", ""),
  ANTHROPIC_API_KEY: getEnvVar("ANTHROPIC_API_KEY", ""),
  HUGGINGFACE_API_KEY: getEnvVar("HUGGINGFACE_API_KEY", ""),
} as const;
