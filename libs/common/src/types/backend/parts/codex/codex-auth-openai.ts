export type CodexAuthOpenai = {
  type: 'oauth';
  refresh: string;
  expires: number;
  access?: string;
  accountId?: string;
};
