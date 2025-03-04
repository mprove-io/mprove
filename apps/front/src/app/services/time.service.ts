import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimeService {
  timeAgoFromNow(ts: number) {
    let time = new Date(ts).getTime();

    let now = new Date().getTime();

    let seconds = Math.floor((now - time) / 1000);

    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) {
      return interval + ' years ago';
    }

    interval = Math.floor(seconds / 2592000);

    if (interval >= 1) {
      return interval + ' months ago';
    }

    interval = Math.floor(seconds / 86400);

    if (interval >= 1) {
      return interval + ' days ago';
    }

    interval = Math.floor(seconds / 3600);

    if (interval >= 1) {
      return interval + ' hours ago';
    }

    interval = Math.floor(seconds / 60);

    if (interval >= 1) {
      return interval + ' minutes ago';
    }

    return 'less than a minute ago';
  }

  secondsAgoFromNow(ts: number) {
    let time = new Date(ts).getTime();

    let now = new Date().getTime();

    let seconds = Math.floor((now - time) / 1000);

    return seconds;
  }

  getYearStr(item: { dateValue: string }) {
    let year = item.dateValue.split('-')[0];

    return `${year}`;
  }

  getMonthStr(item: { dateValue: string }) {
    let year = item.dateValue.split('-')[0];
    let month = item.dateValue.split('-')[1];

    return `${year}/${month}`;
  }

  getDayStr(item: { dateValue: string }) {
    let date = item.dateValue.split('-').join('/');

    return `${date}`;
  }

  getHourStr(item: { dateValue: string; timeValue: string }) {
    let date = item.dateValue.split('-').join('/');
    let hour = item.timeValue.split(':')[0];

    return `${date} ${hour}`;
  }

  getMinuteStr(item: { dateValue: string; timeValue: string }) {
    let date = item.dateValue.split('-').join('/');
    let hour = item.timeValue.split(':')[0];
    let minute = item.timeValue.split(':')[1];

    return `${date} ${hour}:${minute}`;
  }

  getDateTimeStrFromEpochMs(item: { ts: number }) {
    let ts = item.ts;

    let date = new Date(ts);

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1; // Months are zero-based in JavaScript
    let day = date.getUTCDate();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = 0;

    let monthD = month.toString().length === 1 ? `0${month}` : `${month}`;
    let dayD = day.toString().length === 1 ? `0${day}` : `${day}`;
    let hourD = hour.toString().length === 1 ? `0${hour}` : `${hour}`;
    let minuteD = minute.toString().length === 1 ? `0${minute}` : `${minute}`;
    let secondD = second.toString().length === 1 ? `0${second}` : `${second}`;

    let dateStr = `${year}-${monthD}-${dayD}`;
    let timeStr = `${hourD}:${minuteD}:${secondD}`;

    let dateUtcMs = new Date(`${dateStr}T00:00:00Z`).getTime();

    return { date, dateStr, timeStr, dateUtcMs };
  }
}
