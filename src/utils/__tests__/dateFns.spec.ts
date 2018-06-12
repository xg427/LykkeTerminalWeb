import {timeZones} from '../../constants/chartTimezones';
import dates from '../../constants/dateKeys';
import {
  convertMinutesToMs,
  convertMsToMinutes,
  convertMsToSeconds,
  convertResolutionToMs,
  convertSecondsToMs,
  getDiffDays,
  getFromByCandlesLimit,
  getStartTimeForCandles
} from '../dateFns';
import {dateFns} from '../index';

describe('Date functions', () => {
  describe('Bar request splitter', () => {
    const to = new Date().getTime();
    let from;
    let resolution;
    let periods;

    it('date splitter function should be defined', () => {
      expect(dateFns.splitter).toBeDefined();
    });

    it('splitter should return only one object in array for 5 minutes resolution and 1 week time interval', () => {
      from = new Date().getTime() - dates.week;
      resolution = '5';

      periods = dateFns.splitter(from, to, resolution);

      expect(periods instanceof Array).toBeTruthy();
      expect(periods!.length).toBe(1);
      expect(periods![0].from).toBe(from);
      expect(periods![0].to).toBe(to);
    });

    it('splitter should return several objects in array for 1 minute resolution and 1 week time interval', () => {
      from = new Date().getTime() - dates.week;
      resolution = '1';

      periods = dateFns.splitter(from, to, resolution);

      expect(periods instanceof Array).toBeTruthy();
      expect(periods!.length).toBeGreaterThan(1);
      expect(periods![0].from).toBe(from);
      expect(periods![periods!.length - 1].to).toBe(to);
    });

    it('splitter should return several objects in array for 1 day resolution and 15 years time interval', () => {
      from = new Date().getTime() - dates.year * 15;
      resolution = 'D';

      periods = dateFns.splitter(from, to, resolution);

      expect(periods instanceof Array).toBeTruthy();
      expect(periods!.length).toBeGreaterThan(1);
      expect(periods![0].from).toBe(from);
      expect(periods![periods!.length - 1].to).toBe(to);
    });
  });

  describe('Get time offset', () => {
    const offset: any = {
      plus: {minutes: 240, gmt: '-0400'},
      minus: {minutes: -120, gmt: '+0200'}
    };
    let timezone: string;

    it('date getTimeOffset function should be defined', () => {
      expect(dateFns.getTimeOffset).toBeDefined();
    });

    it('getTimeOffset should return GMT +04', () => {
      timezone = dateFns.getTimeOffset(offset.plus.minutes);

      expect(timezone).toBe(offset.plus.gmt);
    });

    it('getTimeOffset should return GMT -02', () => {
      timezone = dateFns.getTimeOffset(offset.minus.minutes);

      expect(timezone).toBe(offset.minus.gmt);
    });
  });

  describe('Get timezone from list by calculated offset', () => {
    const timezones = [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Phoenix',
      'America/Toronto',
      'America/Vancouver',
      'America/Argentina/Buenos_Aires',
      'America/Sao_Paulo',
      'America/Bogota',
      'America/Caracas',
      'America/Mexico_City',
      'Europe/Moscow',
      'Europe/Athens',
      'Europe/Berlin',
      'Europe/London',
      'Europe/Madrid',
      'Europe/Paris',
      'Europe/Warsaw',
      'Europe/Istanbul',
      'Europe/Zurich',
      'Australia/Sydney',
      'Australia/Brisbane',
      'Australia/Adelaide',
      'Asia/Almaty',
      'Asia/Ashkhabad',
      'Asia/Tokyo',
      'Asia/Taipei',
      'Asia/Singapore',
      'Asia/Shanghai',
      'Asia/Seoul',
      'Asia/Tehran',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Hong_Kong',
      'Asia/Bangkok',
      'Pacific/Chatham',
      'Pacific/Honolulu',
      'Etc/UTC'
    ];
    let timezone: string;
    let equalTimezone: string | undefined;

    it('date getTimeZone function should be defined', () => {
      expect(dateFns.getTimeZone).toBeDefined();
    });

    it('getTimeZone should return correct timezone from list', () => {
      timezone = dateFns.getTimeZone(timeZones);
      equalTimezone = timezones.find(t => t === timezone);

      expect(equalTimezone).toBeDefined();
      expect(typeof equalTimezone).toBe('string');
    });

    it("getTimeZone should return 'Etc/UTC' if there are no equal timezone in the list", () => {
      timezone = dateFns.getTimeZone([
        {zone: 'Antarctica/Vostok', gmt: '+1200'}
      ]);

      expect(timezone).toBe('Etc/UTC');
    });
  });

  it('should convert seconds to milliseconds', () => {
    const seconds = 1;
    expect(convertSecondsToMs(seconds)).toBe(seconds * 1000);
  });

  it('should convert milliseconds to seconds', () => {
    const milliseconds = 1000;
    expect(convertMsToSeconds(milliseconds)).toBe(milliseconds / 1000);
  });

  it('should convert milliseconds to minutes', () => {
    const milliseconds = 120000;
    expect(convertMsToMinutes(milliseconds)).toBe(milliseconds / 60000);
  });

  it('should convert minutes to milliseconds', () => {
    const minutes = 2;
    expect(convertMinutesToMs(minutes)).toBe(minutes * 60000);
  });

  it('should return 0 as no difference between two dates in days', () => {
    const currentDate = new Date().getTime();
    const previousDate = new Date().getTime();
    expect(getDiffDays(currentDate, previousDate)).toBe(0);
  });

  it('should return difference between two days', () => {
    const oneDay = 24 * 60 * 60 * 1000;
    const currentDate = new Date().getTime();
    const previousDate = new Date().getTime() - oneDay;
    expect(getDiffDays(currentDate, previousDate)).toBe(1);
  });

  it('should return "from" time for candles by resolution', () => {
    const to = new Date().getTime();
    const resolution = '1';
    const limit = 500;
    expect(
      getStartTimeForCandles(to, convertResolutionToMs(resolution), limit)
    ).toBe(to - limit * 60000 * Number(resolution));
  });

  describe('calculate "from" time for candles', () => {
    const limit = 500;
    const getFromTime = getFromByCandlesLimit(limit);
    const to = new Date().getTime();
    let resolution: string = '';

    it('should return value for 1 minute', () => {
      resolution = '1';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 5 minute', () => {
      resolution = '5';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 15 minute', () => {
      resolution = '15';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 30 minute', () => {
      resolution = '30';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 60 minute', () => {
      resolution = '60';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 240 minute', () => {
      resolution = '240';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 360 minute', () => {
      resolution = '360';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 720 minute', () => {
      resolution = '720';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 1 day', () => {
      resolution = 'D';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
      resolution = '1D';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 1 week', () => {
      resolution = 'W';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
      resolution = '1W';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should return value for 1 month', () => {
      resolution = 'M';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
      resolution = '1M';
      expect(getFromTime(to, resolution)).toBe(
        to - limit * convertResolutionToMs(resolution)
      );
    });

    it('should parse string to number and convert value into ms', () => {
      const value = '123';
      expect(convertResolutionToMs(value)).toBe(
        convertMinutesToMs(Number(value))
      );
    });

    it('should convert default value for D used as a resolution', () => {
      const r = 'D';
      expect(convertResolutionToMs(r)).toBe(dates.day);
    });

    it('should convert default value for 1D used as a resolution', () => {
      const r = '1D';
      expect(convertResolutionToMs(r)).toBe(dates.day);
    });

    it('should convert default value for M used as a resolution', () => {
      const r = 'M';
      expect(convertResolutionToMs(r)).toBe(dates.month);
    });

    it('should convert default value for 1M used as a resolution', () => {
      const r = '1M';
      expect(convertResolutionToMs(r)).toBe(dates.month);
    });

    it('should convert default value for D used as a resolution', () => {
      const r = 'W';
      expect(convertResolutionToMs(r)).toBe(dates.week);
    });

    it('should convert default value for 1D used as a resolution', () => {
      const r = '1W';
      expect(convertResolutionToMs(r)).toBe(dates.week);
    });
  });
});
