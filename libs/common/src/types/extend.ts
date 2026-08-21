type Simplify<TValue> = {
  [TKey in keyof TValue]: TValue[TKey];
};

export type Extend<TBase, TExtension> = Simplify<
  Omit<TBase, keyof TExtension> & TExtension
>;
