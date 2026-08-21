export type EnumValues<TEnum extends Record<string, string | number>> =
  TEnum[keyof TEnum];
