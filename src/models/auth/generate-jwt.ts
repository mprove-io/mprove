import * as jsonwebtoken from 'jsonwebtoken';

export function generateJwt(userId: string) {
  let expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  let token = jsonwebtoken.sign(
    {
      email: userId,
      exp: parseInt((expiry.getTime() / 1000).toString(), 10)
    },
    process.env.BACKEND_JWT_SECRET
  );

  return token;
}
