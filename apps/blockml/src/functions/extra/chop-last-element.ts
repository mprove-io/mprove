export function chopLastElement(x: string[]) {
  let lastIndex = x.length - 1;
  x[lastIndex] = x[lastIndex].slice(0, -1);
  return;
}
