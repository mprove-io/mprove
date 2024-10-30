import { RData } from '../services/query.service';

function isNumber(str: string) {
  const num = Number(str);
  return typeof str === 'string' && str.trim() !== '' && !isNaN(num);
}

export function makeAgData(qData: RData[]) {
  const newData = new Array(qData.length); // Pre-size the array

  for (let i = 0; i < qData.length; i++) {
    const cells = qData[i];
    const res: { [k: string]: any } = {};

    for (const cellKey in cells) {
      if (Object.prototype.hasOwnProperty.call(cells, cellKey)) {
        // Filter unwanted prototype properties
        const cell = cells[cellKey];
        // If string is a number, then convert to number
        if (isNumber(cell.value)) {
          res[cell.id] = Number(cell.value);
        } else {
          res[cell.id] = cell.value;
        }
      }
    }

    newData[i] = res;
  }

  return newData;
}
