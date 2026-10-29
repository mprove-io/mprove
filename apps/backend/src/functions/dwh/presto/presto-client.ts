import _PrestoClientModule from '@prestodb/presto-js-client';

// CJS interop: default import gets module.exports object, unwrap to get the class.
export const PrestoClient = (_PrestoClientModule as any)
  .default as typeof _PrestoClientModule;
