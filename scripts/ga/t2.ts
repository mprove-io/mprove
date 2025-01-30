const ivm = require('isolated-vm');

const inputSub = `
${yearsUtcMsX.toString()}

${monthsUtcMsX.toString()}

${weeksMondayUtcMsX.toString()}

${weeksSundayUtcMsX.toString()}

${daysUtcMsX.toString()}

${hoursUtcMsX.toString()}

${minutesUtcMsX.toString()}

let details = [
  {
    unit: 'years',
    dimension: 'year',
    utcMs: yearsUtcMsX
  },
  {
    unit: 'months',
    dimension: 'yearMonth',
    utcMs: monthsUtcMsX
  },
  {
    unit: 'weeksMonday',
    dimension: 'isoYearIsoWeek',
    utcMs: weeksMondayUtcMsX
  },
  {
    unit: 'weeksSunday',
    dimension: 'yearWeek',
    utcMs: weeksSundayUtcMsX
  },
  {
    unit: 'days',
    dimension: 'date',
    utcMs: daysUtcMsX
  },
  {
    unit: 'hours',
    dimension: 'dateHour',
    utcMs: hoursUtcMsX
  },
  {
    unit: 'minutes',
    dimension: 'dateHourMinute',
    utcMs: minutesUtcMsX
  }
];

let exampleRows = [
  {
    year: '2025',
    yearMonth: '202501',
    isoYearIsoWeek: '202504',
    yearWeek: '202505',
    date: '20250126',
    dateHour: '2025012622',
    dateHourMinute: '202501262223'
  },
  {
    year: '2025',
    yearMonth: '202501',
    isoYearIsoWeek: '202505',
    yearWeek: '202505',
    date: '20250127',
    dateHour: '2025012722',
    dateHourMinute: '202501272212'
  }
];

let resultRows = [];

exampleRows.forEach(row => {
  let resultRow = {};

  Object.keys(row).forEach(key => {
    let value = row[key];
    let detail = details.find(u => u.dimension === key);

    resultRow[key] = {
      value: value,
      unit: detail?.unit,
      utcMs: detail?.utcMs(value)
    };
  });
  resultRows.push(resultRow);
});

return resultRows;
`;

let uCode = `JSON.stringify((function() {
${inputSub}
})())`;

async function runInIsolatedVm(userCode: string) {
  const isolate = new ivm.Isolate({ memoryLimit: 8 });
  const context = await isolate.createContext();

  try {
    let timeoutMs = 500;
    let script = await isolate.compileScript(userCode);
    let result = await script.run(context, { timeout: timeoutMs });
    return { outValue: result };
  } catch (error: any) {
    return { outError: error.message };
  } finally {
    isolate.dispose();
  }
}

runInIsolatedVm(uCode).then(console.log);

function yearsUtcMsX(value: string) {
  let date = new Date(`${value}-01-01T00:00:00Z`);
  return date.getTime();
}

function monthsUtcMsX(value: string) {
  let date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-01T00:00:00Z`);
  return date.getTime();
}

function weeksMondayUtcMsX(value: string) {
  // Parse ISO year and week (e.g., "202504" → year=2025, week=4)
  let year = parseInt(value.slice(0, 4), 10);
  let week = parseInt(value.slice(4, 6), 10);

  // Create a date in week 1 of the ISO year (January 4th is always in week 1)
  let date = new Date(Date.UTC(year, 0, 4));

  // Get the Monday of week 1
  let day = date.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));

  // Add weeks to reach the target week
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);

  return date.getTime();
}

function weeksSundayUtcMsX(value: string) {
  // Parse year and week (e.g., "202505" → year=2025, week=5)
  let year = parseInt(value.slice(0, 4), 10);
  let week = parseInt(value.slice(4, 6), 10);

  // Find the first Sunday of the year
  let firstDay = new Date(Date.UTC(year, 0, 1));
  let day = firstDay.getUTCDay(); // 0 (Sunday) to 6 (Saturday)
  let firstSunday = new Date(firstDay);
  firstSunday.setUTCDate(firstDay.getUTCDate() - day);

  // Add weeks to reach the target week
  let date = new Date(firstSunday);
  date.setUTCDate(firstSunday.getUTCDate() + (week - 1) * 7);

  return date.getTime();
}

function daysUtcMsX(value: string) {
  let date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`
  );
  return date.getTime();
}

function hoursUtcMsX(value: string) {
  let date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(
      6,
      8
    )}T${value.slice(8, 10)}:00:00Z`
  );
  return date.getTime();
}

function minutesUtcMsX(value: string) {
  let date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(
      6,
      8
    )}T${value.slice(8, 10)}:${value.slice(10, 12)}:00Z`
  );
  return date.getTime();
}
