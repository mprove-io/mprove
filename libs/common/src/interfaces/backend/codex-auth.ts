export class CodexAuthOpenai {
  type: 'oauth';
  refresh: string;
  expires: number;
  access?: string;
  accountId?: string;
}

export class CodexAuth {
  openai: CodexAuthOpenai;
}
