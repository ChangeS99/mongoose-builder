// Handles date and date range matches for FiltersMatchStagesHelper

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);

type PushMatchStage = (stage: any) => void;

/**
 * DateMatchHelper provides static methods for building date-based and date-range-based
 * match stages for MongoDB aggregation pipelines. These methods are used by FiltersMatchStagesHelper
 * to add date equality, range, and comparison conditions to the pipeline.
 *
 * @example
 * // Usage within FiltersMatchStagesHelper:
 * DateMatchHelper.addDateMatch(filters, 'createdAt', pushMatchStage, 'UTC', '2023-01-01');
 */
export class DateMatchHelper {
  /**
   * Adds an exact date equality match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to match exactly.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @param value - Optional static Date or date string to use instead of getting from filters.
   * @param format - Optional custom date format string (defaults to ISO 8601).
   * @example
   * DateMatchHelper.addDateMatch(filters, 'createdAt', pushMatchStage, 'UTC', '2023-01-01');
   */
  static addDateMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string,
    value?: Date | string,
    format?: string
  ): void {
    const filterValue = value !== undefined ? value : filters[field];
    if (filterValue === undefined || filterValue === '') return;

    let dateValue: Date;
    if (filterValue instanceof Date) {
      dateValue = filterValue;
    } else if (typeof filterValue === 'string') {
      const parsedDate = format
        ? dayjs.tz(filterValue, format, timezoneStr)
        : dayjs.tz(filterValue, timezoneStr);
      if (!parsedDate.isValid()) return;
      dateValue = parsedDate.toDate();
    } else {
      return;
    }

    pushMatchStage({ $match: { [field]: dateValue } });
    if (value === undefined) delete filters[field];
  }

  /**
   * Adds a date range match for a single field using $gte and $lte.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the date range.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.addDateRangeMatch(filters, 'createdAt', pushMatchStage, 'UTC');
   * @note Uses `${field}-from` and `${field}-to` keys in filters.
   */
  static addDateRangeMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const from = filters[`${field}-from`];
    const to = filters[`${field}-to`];
    const range: any = {};

    if (from != null && from !== '') {
      const mFrom = dayjs.tz(from, timezoneStr);
      if (mFrom.isValid()) {
        range.$gte = mFrom.startOf('day').toDate();
      }
    }

    if (to != null && to !== '') {
      const mTo = dayjs.tz(to, timezoneStr);
      if (mTo.isValid()) {
        range.$lte = mTo.endOf('day').toDate();
      }
    }

    if (Object.keys(range).length > 0) {
      pushMatchStage({ $match: { [field]: range } });
    }

    delete filters[`${field}-from`];
    delete filters[`${field}-to`];
  }

  /**
   * Adds a greater-than date ($gt) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $gt operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.addGreaterThanDateMatch(filters, 'eventDate', pushMatchStage, 'UTC');
   * @note Uses `${field}-gtDate` key in filters.
   */
  static addGreaterThanDateMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const filterKey = `${field}-gtDate`;
    const rawValue = filters[filterKey];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const dayjsValue = dayjs.tz(rawValue, timezoneStr);
      if (dayjsValue.isValid()) {
        const dateValue = dayjsValue.endOf('day').toDate();
        pushMatchStage({ $match: { [field]: { $gt: dateValue } } });
      }
    }
    delete filters[filterKey];
  }

  /**
   * Adds a greater-than-or-equal date ($gte) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $gte operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.addGreaterThanOrEqualDateMatch(filters, 'startDate', pushMatchStage, 'UTC');
   * @note Uses `${field}-gteDate` key in filters.
   */
  static addGreaterThanOrEqualDateMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const filterKey = `${field}-gteDate`;
    const rawValue = filters[filterKey];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const dayjsValue = dayjs.tz(rawValue, timezoneStr);
      if (dayjsValue.isValid()) {
        const dateValue = dayjsValue.startOf('day').toDate();
        pushMatchStage({ $match: { [field]: { $gte: dateValue } } });
      }
    }
    delete filters[filterKey];
  }

  /**
   * Adds a less-than date ($lt) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $lt operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.addLessThanDateMatch(filters, 'eventDate', pushMatchStage, 'UTC');
   * @note Uses `${field}-ltDate` key in filters.
   */
  static addLessThanDateMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const filterKey = `${field}-ltDate`;
    const rawValue = filters[filterKey];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const dayjsValue = dayjs.tz(rawValue, timezoneStr);
      if (dayjsValue.isValid()) {
        const dateValue = dayjsValue.startOf('day').toDate();
        pushMatchStage({ $match: { [field]: { $lt: dateValue } } });
      }
    }
    delete filters[filterKey];
  }

  /**
   * Adds a less-than-or-equal date ($lte) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $lte operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.addLessThanOrEqualDateMatch(filters, 'endDate', pushMatchStage, 'UTC');
   * @note Uses `${field}-lteDate` key in filters.
   */
  static addLessThanOrEqualDateMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const filterKey = `${field}-lteDate`;
    const rawValue = filters[filterKey];
    if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
      const dayjsValue = dayjs.tz(rawValue, timezoneStr);
      if (dayjsValue.isValid()) {
        const dateValue = dayjsValue.endOf('day').toDate();
        pushMatchStage({ $match: { [field]: { $lte: dateValue } } });
      }
    }
    delete filters[filterKey];
  }

  /**
   * Match documents where the current date falls between two date fields.
   *
   * @param filters - The filters object (mutated in-place).
   * @param startField - The field representing the start of the date range.
   * @param endField - The field representing the end of the date range.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.fallWithinDateRange(filters, 'startDate', 'endDate', pushMatchStage, 'UTC');
   * @note Uses `range-within-date` key in filters to enable this logic.
   */
  static fallWithinDateRange(
    filters: any,
    startField: string,
    endField: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const flag = filters['range-within-date'];
    if (flag !== true && flag !== 'true') {
      return;
    }
    const now = dayjs.tz(dayjs(), timezoneStr).startOf('day').toDate();
    pushMatchStage({
      $match: {
        $expr: {
          $and: [{ $lte: [`${startField}`, now] }, { $gte: [`${endField}`, now] }],
        },
      },
    });
    delete filters['range-within-date'];
  }

  /**
   * Match documents where a given or current time falls between two time fields.
   *
   * @param filters - The filters object (mutated in-place).
   * @param startField - The field representing the start of the time range.
   * @param endField - The field representing the end of the time range.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for time parsing.
   * @param timeStr - Optional time string (HH:mm:ss) to compare against; defaults to current time.
   * @example
   * DateMatchHelper.fallWithinTimeRange(filters, 'startTime', 'endTime', pushMatchStage, 'UTC');
   * @note Uses `range-within-time` key in filters to enable this logic.
   */
  static fallWithinTimeRange(
    filters: any,
    startField: string,
    endField: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string,
    timeStr?: string
  ): void {
    const filterKey = 'range-within-time';
    const flag = filters[filterKey];
    if (flag !== true && flag !== 'true') {
      return;
    }

    const time = timeStr
      ? dayjs.tz(timeStr, 'HH:mm:ss', timezoneStr)
      : dayjs.tz(dayjs(), timezoneStr);
    if (!time.isValid()) {
      return; // Invalid time provided
    }
    const timeMs =
      time.hour() * 3600000 + time.minute() * 60000 + time.second() * 1000 + time.millisecond();

    pushMatchStage({
      $match: {
        $expr: {
          $and: [
            { $lte: [{ $add: [0, { $ifNull: [`${startField}`, 0] }] }, timeMs] },
            { $gte: [{ $add: [0, { $ifNull: [`${endField}`, 0] }] }, timeMs] },
          ],
        },
      },
    });

    delete filters[filterKey];
  }

  /**
   * Add a time-of-day range match using two fields.
   *
   * @param filters - The filters object (mutated in-place).
   * @param field1 - The first time field.
   * @param field2 - The second time field.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for time parsing.
   * @example
   * DateMatchHelper.addTimeRangeMatch(filters, 'shiftStart', 'shiftEnd', pushMatchStage, 'UTC');
   * @note Uses `${field1}-time-from` and `${field2}-time-to` keys in filters.
   */
  static addTimeRangeMatch(
    filters: any,
    field1: string,
    field2: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const fromFilterKey = `${field1}-time-from`;
    const toFilterKey = `${field2}-time-to`;

    const fromTimeStr = filters[fromFilterKey];
    const toTimeStr = filters[toFilterKey];

    const exprConditions: any[] = [];

    if (fromTimeStr !== undefined && fromTimeStr !== null && fromTimeStr !== '') {
      const fromTime = dayjs.tz(fromTimeStr, 'HH:mm:ss', timezoneStr);
      if (fromTime.isValid()) {
        const fromMs =
          fromTime.hour() * 3600000 + fromTime.minute() * 60000 + fromTime.second() * 1000;
        exprConditions.push({ $gte: [{ $ifNull: [`${field1}`, 0] }, fromMs] });
        delete filters[fromFilterKey];
      }
    }

    if (toTimeStr !== undefined && toTimeStr !== null && toTimeStr !== '') {
      const toTime = dayjs.tz(toTimeStr, 'HH:mm:ss', timezoneStr);
      if (toTime.isValid()) {
        const toMs =
          toTime.hour() * 3600000 + toTime.minute() * 60000 + toTime.second() * 1000 + 999; // End of second
        exprConditions.push({ $lte: [{ $ifNull: [`${field2}`, 0] }, toMs] });
        delete filters[toFilterKey];
      }
    }

    if (exprConditions.length > 0) {
      pushMatchStage({
        $match: {
          $expr: { $and: exprConditions },
        },
      });
    }
  }

  /**
   * Add a date range match across two different fields.
   *
   * @param filters - The filters object (mutated in-place).
   * @param startField - The field for the start of the range.
   * @param endField - The field for the end of the range.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param timezoneStr - The timezone string for date parsing.
   * @example
   * DateMatchHelper.addFieldsDateRangeMatch(filters, 'startDate', 'endDate', pushMatchStage, 'UTC');
   * @note Uses `range-within-date`, `${startField}-from`, and `${endField}-to` keys in filters.
   */
  static addFieldsDateRangeMatch(
    filters: any,
    startField: string,
    endField: string,
    pushMatchStage: PushMatchStage,
    timezoneStr: string
  ): void {
    const mainFilterKey = 'range-within-date';
    const fromFilterKey = `${startField}-from`;
    const toFilterKey = `${endField}-to`;

    const dateFlag = filters[mainFilterKey];
    if (dateFlag !== true && dateFlag !== 'true') {
      return;
    }

    const from = filters[fromFilterKey];
    const to = filters[toFilterKey];
    const exprConditions: any[] = [];

    if (from != null && from !== '') {
      const mFrom = dayjs.tz(from, timezoneStr);
      if (mFrom.isValid()) {
        const startDate = mFrom.startOf('day').toDate();
        exprConditions.push({ $gte: [`${startField}`, startDate] });
        delete filters[fromFilterKey];
      }
    }
    if (to != null && to !== '') {
      const mTo = dayjs.tz(to, timezoneStr);
      if (mTo.isValid()) {
        const endDate = mTo.endOf('day').toDate();
        exprConditions.push({ $lte: [`${endField}`, endDate] });
        delete filters[toFilterKey];
      }
    }

    if (exprConditions.length > 0) {
      pushMatchStage({
        $match: {
          $expr: { $and: exprConditions },
        },
      });
    }

    delete filters[mainFilterKey];
  }
}
}