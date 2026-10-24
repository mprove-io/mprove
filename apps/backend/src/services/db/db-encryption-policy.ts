export const dbEncryptionPolicyValues = [
  'regular',
  'metadata',
  'none'
] as const;

export type DbEncryptionPolicy = (typeof dbEncryptionPolicyValues)[number];
