
/// <reference types="express" />

// Add RequestValidation Interface on to Express's Request Interface.

// tslint:disable-next-line:no-namespace
declare namespace Express {
  interface Request extends Flash { }
}

interface Flash {
  flash(type: string, message: any): void;
}

declare module 'express-flash';

