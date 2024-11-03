import type { Config } from 'drizzle-kit';

export default {
  dialect: 'postgresql',
  schema: 'apps/backend/src/drizzle/postgres/schema',
  out: 'apps/backend/src/drizzle/postgres/migrations',
  dbCredentials: {
    // TODO: check parameters vs url, ssl, BACKEND_IS_POSTGRES_TLS
    url: process.env.CLI_DRIZZLE_POSTGRES_DATABASE_URL
  }
} satisfies Config;

//   dbCredentials: ({
//     host: string;
//     port?: number;
//     user?: string;
//     password?: string;
//     database: string;
//     ssl?: boolean | 'require' | 'allow' | 'prefer' | 'verify-full' | ConnectionOptions;
// } & {}) | {
//     url: string;
// };
