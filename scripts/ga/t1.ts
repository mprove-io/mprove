interface PreparedRow {
  year: string;
  yearMonth: string;
  isoYearIsoWeek: string;
  yearWeek: string;
  date: string;
  dateHour: string;
  dateHourMinute: string;
}

interface ResultRowData {
  unit: string;
  value: string;
  utcMs: number;
}

interface ResultRow {
  [key: string]: ResultRowData;
}

async function t1() {
  try {
    let details = [
      {
        unit: 'years',
        dimension: 'year',
        utcMs: yearsUtcMs
      },
      {
        unit: 'months',
        dimension: 'yearMonth',
        utcMs: monthsUtcMs
      },
      {
        unit: 'weeksMonday',
        dimension: 'isoYearIsoWeek',
        utcMs: weeksMondayUtcMs
      },
      {
        unit: 'weeksSunday',
        dimension: 'yearWeek',
        utcMs: weeksSundayUtcMs
      },
      {
        unit: 'days',
        dimension: 'date',
        utcMs: daysUtcMs
      },
      {
        unit: 'hours',
        dimension: 'dateHour',
        utcMs: hoursUtcMs
      },
      {
        unit: 'minutes',
        dimension: 'dateHourMinute',
        utcMs: minutesUtcMs
      }
    ];

    let exampleRows: PreparedRow[] = [
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

    let resultRows: ResultRow[] = [];

    exampleRows.forEach(row => {
      let resultRow: ResultRow = {};

      Object.keys(row).forEach(key => {
        let value = row[key as keyof PreparedRow];
        let detail = details.find(u => u.dimension === key);

        resultRow[key] = {
          value: value,
          unit: detail?.unit,
          utcMs: detail?.utcMs(value)
        };
      });
      resultRows.push(resultRow);
    });

    console.log('resultRows');
    console.log(resultRows);
  } catch (error: any) {
    console.log(error);
  }
}

t1();

function yearsUtcMs(value: string) {
  let date = new Date(`${value}-01-01T00:00:00Z`);
  return date.getTime();
}

function monthsUtcMs(value: string) {
  let date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-01T00:00:00Z`);
  return date.getTime();
}

function weeksMondayUtcMs(value: string) {
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

function weeksSundayUtcMs(value: string) {
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

function daysUtcMs(value: string) {
  let date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00Z`
  );
  return date.getTime();
}

function hoursUtcMs(value: string) {
  let date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(
      6,
      8
    )}T${value.slice(8, 10)}:00:00Z`
  );
  return date.getTime();
}

function minutesUtcMs(value: string) {
  let date = new Date(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(
      6,
      8
    )}T${value.slice(8, 10)}:${value.slice(10, 12)}:00Z`
  );
  return date.getTime();
}
