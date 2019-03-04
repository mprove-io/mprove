import { MyError } from '@app/models/my-error';

/**
 * This function coerces a string into a string literal type.
 * Using tagged union types in TypeScript 2.0, this enables
 * powerful typechecking of our reducers.
 *
 * Since every action label passes through this function it
 * is a good place to ensure all of our action labels
 * are unique.
 */

let typeCache: { [label: string]: boolean } = {};

export function ngrxType<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new MyError({
      name: `Action type is not unique`,
      message: `type is ${label}`
    });

    // throw new Error(`Action type "${label}" is not unique"`);
  }

  typeCache[<string>label] = true;

  return <T>label;
}
