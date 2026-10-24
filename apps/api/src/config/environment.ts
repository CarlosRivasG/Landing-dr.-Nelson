export interface Environment {
  nodeEnv: 'development' | 'test' | 'production';
  apiHost: string;
  apiPort: number;
  database: { host: string; port: number; database: string; username: string; password: string };
}

export function readEnvironment(env: NodeJS.ProcessEnv): Environment {
  function required(name: string): string {
    const value = env[name];
    if (!value?.trim()) throw new Error(`Falta la variable ${name}`);
    return value;
  }
  function port(name: string, fallback: string): number {
    const value = env[name] ?? fallback;
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
      throw new Error(`Puerto inválido en ${name}`);
    }
    return Number(value);
  }
  const nodeEnv = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV debe ser development, test o production');
  }
  return {
    nodeEnv: nodeEnv as Environment['nodeEnv'],
    apiHost: env.API_HOST ?? '127.0.0.1',
    apiPort: port('API_PORT', '3001'),
    database: {
      host: required('POSTGRES_HOST'),
      port: port('POSTGRES_PORT', '5432'),
      database: required('POSTGRES_DB'),
      username: required('POSTGRES_USER'),
      password: required('POSTGRES_PASSWORD'),
    },
  };
}
