export function extractAccountIdFromClaims(item: {
  claims: any;
}): string | undefined {
  let { claims } = item;

  return (
    claims.chatgpt_account_id ||
    claims['https://api.openai.com/auth']?.chatgpt_account_id ||
    claims.organizations?.[0]?.id
  );
}
