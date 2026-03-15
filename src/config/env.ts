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
  NEXT_PUBLIC_APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
} as const;
