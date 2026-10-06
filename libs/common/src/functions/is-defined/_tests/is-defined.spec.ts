import test from 'ava';
import { isDefined } from '#common/functions/is-defined/is-defined';

let testPrefix: string = 'isDefined';

test(`${testPrefix} returns false for undefined`, t => {
  t.false(isDefined(undefined));
});

test(`${testPrefix} returns false for null`, t => {
  t.false(isDefined(null));
});

test(`${testPrefix} returns true for defined falsy values`, t => {
  t.true(isDefined(false));

  t.true(isDefined(0));

  t.true(isDefined(''));

  t.true(isDefined(Number.NaN));
});

test(`${testPrefix} returns true for objects`, t => {
  t.true(isDefined({}));
});
