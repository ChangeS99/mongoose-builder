import { Types } from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { StringMatchHelper } from "src/filters/StringMatchHelper";
import { NumberMatchHelper } from "src/filters/NumberMatchHelper";
import { DateMatchHelper } from "src/filters/DateMatchHelper";
import { ArrayMatchHelper } from "src/filters/ArrayMatchHelper";
import { LookupHelper } from "./filters/LookupHelper";

dayjs.extend(utc);
dayjs.extend(timezone);

import { CompoundMatchHelper } from "src/filters/CompoundMatchHelper";
import { MiscMatchHelper } from "src/filters/MiscMatchHelper";

interface MatchStageObject {
  $match?: {
    [key: string]: any;
  };
  $lookup?: {
    [key: string]: any;
  };
}

type MatchStages = MatchStageObject[] | [];

/**
 * FiltersMatchStagesHelper builds an array of match stages that in use in pipelne in aggregation pipelines.
 * Use this helper to apply various operators (regex, range, null checks, boolean, exists, logical).
 */
/**
 * FilterStageBuilder builds an array of match stages for use in MongoDB aggregation pipelines.
 * This class provides a fluent API for applying various filter operators (regex, range, null checks, boolean, exists, logical, etc.)
 * and delegates type-specific logic to helper modules for maintainability and extensibility.
 *
 * @example
 * const helper = new FilterStageBuilder(filters)
 *   .addStringMatch('status')
 *   .addNumberMatch('age')
 *   .addDateRangeMatch('createdAt')
 *   .build();
 */
export class FilterStageBuilder {
  /**
   * Constructs a new FilterStageBuilder.
   * @param filters - The filters object to use for building match stages.
   */
  constructor(private readonly filters: any) {}

  /** Internal filter query object for default filters. */
  private filterQuery: Record<string, any> = {};

  /** Internal array of match stages to be built. */
  private matchStages: MatchStageObject[] = [];

  /** Timezone string for date/time operations (default: 'UTC'). */
  private timezone: string = "UTC";

  /**
   * Sets the timezone for date/time operations.
   * @param timezone - The timezone string (e.g., 'UTC', 'America/New_York').
   * @returns The FilterStageBuilder instance (for chaining).
   * @example
   * helper.setTimezone('America/New_York');
   */
  public setTimezone(timezone: string): this {
    this.timezone = timezone;
    return this;
  }

  /**
   * Pushes a match or lookup stage to the internal matchStages array.
   * @param matchStage - The match or lookup stage to add.
   * @internal
   */
  private pushMatchStage(matchStage: MatchStageObject) {
    this.matchStages.push(matchStage);
  }

  /**
   * Apply strict matching for all provided filter fields
   * NOTE: we won't be making the final return value based on the filterQuery object
   * @example
   * // filters = { name: 'John', age: 30 }
   * // builds: { name: 'John', age: 30 }
   */
  public applyDefaultFilters(): this {
    for (const key in this.filters) {
      const value = this.filters[key];
      if (value !== undefined && value !== null && value !== "") {
        this.filterQuery[key] = value;
      }
    }
    return this;
  }

  /**
   * Add an exact string equality match for the given field
   *
   * @example
   * // filters = { status: 'active' }
   * // builds: { status: 'active' }
   *
   * @param field The field to match exactly
   * @param value Optional static string value to use instead of getting from filters
   */
  public addStringMatch(field: string, value?: string): this {
    StringMatchHelper.addStringMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      value
    );
    return this;
  }

  /**
   * Add an exact number equality match for the given field
   *
   * @example
   * // filters = { type: '1' } (string will be converted to number)
   * // builds: { type: 1 }
   *
   * @param field The field to match exactly
   * @param value Optional static number value to use instead of getting from filters
   */
  public addNumberMatch(field: string, value?: number): this {
    NumberMatchHelper.addNumberMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      value
    );
    return this;
  }

  /**
   * Add a boolean equality match for the given field
   *
   * @example
   * // filters = { isActive: 'true' } (string 'true'/'false' will be converted to boolean)
   * // builds: { isActive: true }
   *
   * @param field The field to match exactly
   * @param value Optional static boolean value to use instead of getting from filters
   */
  public addBooleanValueMatch(field: string, value?: boolean): this {
    const filterValue = value !== undefined ? value : this.filters[field];

    if (filterValue === undefined || filterValue === "") {
      return this;
    }

    let boolValue: boolean;
    if (typeof filterValue === "string") {
      if (filterValue.toLowerCase() === "true") {
        boolValue = true;
      } else if (filterValue.toLowerCase() === "false") {
        boolValue = false;
      } else {
        return this; // Invalid boolean string
      }
    } else if (typeof filterValue === "boolean") {
      boolValue = filterValue;
    } else {
      boolValue = Boolean(filterValue);
    }

    this.pushMatchStage({
      $match: {
        [field]: boolValue,
      },
    });

    if (value === undefined) {
      delete this.filters[field];
    }

    return this;
  }

  /**
   * Add a date equality match for the given field
   *
   * @example
   * // filters = { createdAt: '2023-05-17' }
   * // builds: { createdAt: new Date('2023-05-17T00:00:00.000Z') }
   *
   * @param field The field to match exactly
   * @param value Optional static Date or date string to use instead of getting from filters
   * @param format Optional custom date format string (defaults to ISO 8601)
   */
  public addDateMatch(
    field: string,
    value?: Date | string,
    format?: string
  ): this {
    DateMatchHelper.addDateMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      this.timezone,
      value,
      format
    );
    return this;
  }

  /**
   * Adds a date range match for a single field using $gte and $lte.
   *
   * @param field - The field to apply the date range.
   * @returns The FilterStageBuilder instance (for chaining).
   * @example
   * // filters = { 'createdAt-from': '2023-05-01', 'createdAt-to': '2023-05-07' }
   * // helper.addDateRangeMatch('createdAt')
   * //   .build();
   * // Result: { createdAt: { $gte: new Date('2023-05-01T00:00:00.000Z'), $lte: new Date('2023-05-07T23:59:59.999Z') } }
   */
  public addDateRangeMatch(field: string): this {
    DateMatchHelper.addDateRangeMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Adds a greater-than date ($gt) match for the given field.
   *
   * @param field - The field to apply the $gt operator.
   * @returns The FilterStageBuilder instance (for chaining).
   * @example
   * // filters = { 'eventDate-gtDate': '2023-05-10' }
   * // helper.addGreaterThanDateMatch('eventDate')
   * //   .build();
   * // Result: { eventDate: { $gt: new Date('2023-05-10T23:59:59.999Z') } }
   */
  public addGreaterThanDateMatch(field: string): this {
    DateMatchHelper.addGreaterThanDateMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Adds a greater-than-or-equal date ($gte) match for the given field.
   *
   * @param field - The field to apply the $gte operator.
   * @returns The FilterStageBuilder instance (for chaining).
   * @example
   * // filters = { 'startDate-gteDate': '2023-05-10' }
   * // helper.addGreaterThanOrEqualDateMatch('startDate')
   * //   .build();
   * // Result: { startDate: { $gte: new Date('2023-05-10T00:00:00.000Z') } }
   */
  public addGreaterThanOrEqualDateMatch(field: string): this {
    DateMatchHelper.addGreaterThanOrEqualDateMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Adds a less-than date ($lt) match for the given field.
   *
   * @param field - The field to apply the $lt operator.
   * @returns The FilterStageBuilder instance (for chaining).
   * @example
   * // filters = { 'eventDate-ltDate': '2023-05-10' }
   * // helper.addLessThanDateMatch('eventDate')
   * //   .build();
   * // Result: { eventDate: { $lt: new Date('2023-05-10T00:00:00.000Z') } }
   */
  public addLessThanDateMatch(field: string): this {
    DateMatchHelper.addLessThanDateMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Adds a less-than-or-equal date ($lte) match for the given field.
   *
   * @param field - The field to apply the $lte operator.
   * @returns The FilterStageBuilder instance (for chaining).
   * @example
   * // filters = { 'endDate-lteDate': '2023-05-10' }
   * // helper.addLessThanOrEqualDateMatch('endDate')
   * //   .build();
   * // Result: { endDate: { $lte: new Date('2023-05-10T23:59:59.999Z') } }
   */
  public addLessThanOrEqualDateMatch(field: string): this {
    DateMatchHelper.addLessThanOrEqualDateMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Check if a field exists in the collection
   *
   * @example
   * // Basic usage - check if field exists
   * helper.addFieldExists('email');
   * // builds: { email: { $exists: true } }
   *
   * // Check if field does not exist
   * helper.addFieldExists('deletedAt', false);
   * // builds: { deletedAt: { $exists: false } }
   *
   * // Using with filter key
   * // When filters = { 'hasEmail': 'true' }
   * helper.addFieldExists('email', undefined, 'hasEmail');
   * // builds: { email: { $exists: true } }
   *
   * @param field The field to check for existence
   * @param shouldExist Whether the field should exist (default: true)
   * @param filterKey Optional custom filter key to check in filters object
   */
  public addFieldExists(
    field: string,
    shouldExist: boolean = true,
    filterKey?: string
  ): this {
    const keyToCheck = filterKey || `${field}-exists`;
    const filterValue = this.filters[keyToCheck];

    // If using filter key and it's explicitly set to false, don't add the condition
    if (
      filterKey === undefined ||
      filterValue === "true" ||
      filterValue === true
    ) {
      this.pushMatchStage({
        $match: {
          [field]: { $exists: shouldExist },
        },
      });
    }

    // Clean up the filter key if it exists
    if (filterKey !== undefined || filterValue !== undefined) {
      delete this.filters[keyToCheck];
    }

    return this;
  }

  /**
   * Add a regex match filter for the given field
   *
   * @example
   * // filters = { username: 'john' }
   * // builds: { username: { $regex: 'john', $options: 'i' } }
   */
  public addRegexMatch(field: string, options: string = "i"): this {
    StringMatchHelper.addRegexMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      options
    );
    return this;
  }

  /**
   * Add an inclusion filter (in array) for the given field or static values
   *
   * @param field The base field name. The filter will look for `filters[\`\${field}-in\`]`.
   * @param staticValues Optional array to use for $in operator instead of filter value.
   *
   * @example
   * // filters = { 'status-in': ['new', 'open'] }
   * // builds: { status: { $in: ['new', 'open'] } }
   * @example
   * // staticValues = ['pending', 'approved']
   * // builds: { status: { $in: ['pending', 'approved'] } }
   */

  public addInMatch(field: string, staticValues?: any[]): this {
    ArrayMatchHelper.addInMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      staticValues
    );
    return this;
  }

  public addInMatchWithObjectIds(field: string, staticValues?: any[]): this {
    ArrayMatchHelper.addInMatchWithObjectIds(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      staticValues
    );
    return this;
  }

  public addObjectIdMatch(field: string): this {
    ArrayMatchHelper.addObjectIdMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  public addObjectIdsMatch(field: string): this {
    ArrayMatchHelper.addObjectIdsMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  public addNotInMatch(field: string, staticValues?: any[]): this {
    ArrayMatchHelper.addNotInMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this),
      staticValues
    );
    return this;
  }

  public addArrayNotEmptyMatch(field: string): this {
    ArrayMatchHelper.addArrayNotEmptyMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add non-deleted filter (soft delete)
   *
   * @example
   * // builds: { deletedAt: null }
   */
  public addNotDeleted(): this {
    MiscMatchHelper.addNotDeleted(this.filters, this.pushMatchStage.bind(this));
    return this;
  }

  /**
   * Convert and match a single ObjectId value
   *
   * @example
   * // filters = { userId: '60c...' }
   * // builds: { userId: new ObjectId('60c...') }
   */

  public addNullMatch(field: string): this {
    MiscMatchHelper.addNullMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add not null match (suffix: field-notnull)
   *
   * @example
   * // filters = { 'deletedAt-notnull': 'true' }
   * // builds: { deletedAt: { $ne: null } }
   */
  public addNotNullMatch(field: string): this {
    MiscMatchHelper.addNotNullMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add not in match (suffix: field-nin) or static values
   *
   * @param staticValues Optional array to use for $nin operator instead of filter suffix value.
   *
   * @example
   * // filters = { 'category-nin': ['test','demo'] }
   * // builds: { category: { $nin: ['test', 'demo'] } }
   * @example
   * // staticValues = ['x', 'y']
   * // builds: { category: { $nin: ['x', 'y'] } }
   */

  public addNotEqualMatch(field: string): this {
    StringMatchHelper.addNotEqualMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add range match (suffixes: field1-from, field2-to)
   * This method applies the same GTE (from) and LTE (to) conditions to two separate fields.
   * Ensure this behavior is what you need for your use case.
   *
   * @example
   * // filters = { 'startDate-from': '2023-01-01', 'anotherDate-to': '2023-12-31' }
   * // Assuming 'startDate-from' provides the GTE value and 'anotherDate-to' provides the LTE value
   * // builds:
   * // {
   * //   startDate: { $gte: new Date('2023-01-01T00:00:00.000Z')},
   * //   anotherDate: { $lte: new Date('2023-12-31T23:59:59.999Z') }
   * // }
   * // The current implementation of addRangeMatch applies the *same* derived range to *both* fields.
   * // If you need different fields for 'from' and 'to' boundaries of a single conceptual range,
   * // consider addDateRangeMatch (for one field) or addFieldsDateRangeMatch (for $expr based multi-field).
   */
  public addRangeMatch(field: string): this {
    NumberMatchHelper.addRangeMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Match documents where current date falls between two date fields
   *
   * @example
   * // applies: { $expr: { $and: [ { $lte: [ '$startDate', <today> ] }, { $gte: [ '$endDate', <today> ] } ] } }
   */
  public fallWithinDateRange(startField: string, endField: string): this {
    DateMatchHelper.fallWithinDateRange(
      this.filters,
      startField,
      endField,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Match documents where given or current time falls between two time fields
   *
   * @example
   * // applies for current time if timeStr omitted
   */
  public fallWithinTimeRange(
    startField: string,
    endField: string,
    timeStr?: string
  ): this {
    DateMatchHelper.fallWithinTimeRange(
      this.filters,
      startField,
      endField,
      this.pushMatchStage.bind(this),
      this.timezone,
      timeStr
    );
    return this;
  }

  /**
   * Add boolean match (suffix: field-true or field-false)
   *
   * @example
   * // filters = { 'active-true': true }
   * // builds: { active: true }
   * // filters = { 'active-false': true }
   * // builds: { active: false }
   */
  public addBooleanMatch(field: string): this {
    MiscMatchHelper.addBooleanMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add exists check (suffix: field-exists)
   *
   * @example
   * // filters = { 'email-exists': 'true' }
   * // builds: { email: { $exists: true } }
   */
  public addExistsMatch(field: string): this {
    MiscMatchHelper.addExistsMatch(
      this.filters,
      field,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add OR compound filters (key: or)
   *
   * @example
   * // filters = { or: [{ status: 'new' }, { priority: 'high' }] }
   * // builds: { $or: [{ status: 'new' }, { priority: 'high' }] }
   */
  public addOrMatch(): this {
    CompoundMatchHelper.addOrMatch(
      this.filters,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add OR compound filters based on a prefixed key (e.g., "customPrefix-or").
   *
   * @example
   * // filters = { "userStatus-or": [{ status: 'active' }, { role: 'admin' }] }
   * // helper.addOrMatchWithPrefix('userStatus')
   * // builds a match stage: { $match: { $or: [{ status: 'active' }, { role: 'admin' }] } }
   *
   * @param prefix The prefix for the filter key (e.g., "userStatus" for "userStatus-or").
   */
  public addOrMatchWithPrefix(prefix: string): this {
    CompoundMatchHelper.addOrMatchWithPrefix(
      this.filters,
      prefix,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add AND compound filters (key: and)
   *
   * @example
   * // filters = { and: [{ age: { $gt: 18 } }, { active: true }] }
   * // builds: { $and: [{ age: { $gt: 18 } }, { active: true }] }
   */
  public addAndMatch(): this {
    CompoundMatchHelper.addAndMatch(
      this.filters,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  /**
   * Add time-of-day range match (suffixes: field-time-from, field-time-to)
   *
   * @example
   * // filters = { 'shift-start-time-from': '09:00', 'shift-end-time-to': '17:00' }
   * // builds: { $expr: { $and: [{ $gte: [{ $hour: `$shift.start` }, 9] }, { $lte: [{ $hour: `$shift.end` }, 17] }] } }
   */
  public addTimeRangeMatch(field1: string, field2: string): this {
    DateMatchHelper.addTimeRangeMatch(
      this.filters,
      field1,
      field2,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  /**
   * Add date range match for a single date field (suffixes: field-from, field-to)
   *
   * @example
   * // filters = { 'createdAt-from': '2023-05-01', 'createdAt-to': '2023-05-07' }
   * // builds:
   * // { createdAt: { $gte: dayjs('2023-05-01').startOf('day').toDate(), $lte: dayjs('2023-05-07').endOf('day').toDate() } }
   */

  public addFieldsDateRangeMatch(startField: string, endField: string): this {
    DateMatchHelper.addFieldsDateRangeMatch(
      this.filters,
      startField,
      endField,
      this.pushMatchStage.bind(this),
      this.timezone
    );
    return this;
  }

  // NEW DATE COMPARISON METHODS START HERE

  // NEW DATE COMPARISON METHODS END HERE

  // LOOKUP QUERIES START HERE

  /**
   * Add a look up from other collection  query
   * the matchs stages will be similar to the pipleline that we get from this query
   * @example
   * // filters = {'tickets.tickets_id': 'TKT-123'}
   * // builds = {
   *    $lookup: {
   *      from: 'collection_name' // provided as a param,
   *    }
   *
   * }
   */
  public addLookupFromOtherCollection(
    collection: string,
    matchStages: any,
    localField: string,
    foreignField: string,
    asName: string = "looked_up",
    unique_foreign_id?: string
  ) {
    LookupHelper.addLookupFromOtherCollection(
      collection,
      matchStages,
      localField,
      foreignField,
      asName,
      unique_foreign_id,
      this.pushMatchStage.bind(this)
    );
    return this;
  }

  // LOOKUP QUERIES END HERE

  /**
   * Return built match stages for the aggregation pipeline
   */
  public build(): MatchStageObject[] {
    // Process any remaining filters in this.filters using applyDefaultFilters logic
    // This ensures that any filters not handled by specific methods are added as a simple match.
    for (const key in this.filters) {
      const value = this.filters[key];
      // Check if the key was already processed by a specific handler (e.g., by looking for suffixes or known keys)
      // This is a heuristic; a more robust way would be to mark keys as processed.
      // For now, we assume if a key still exists, it needs default handling.
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !key.includes("-") &&
        key !== "or" &&
        key !== "and" &&
        key !== "range-within-date" &&
        key !== "range-within-time" &&
        key !== "notnull" &&
        key !== "exists"
      ) {
        this.pushMatchStage({ $match: { [key]: value } });
      }
      // Delete the key regardless of whether it was used for a default match or not, as all filters should be cleared.
      delete this.filters[key];
    }
    return this.matchStages;
  }

  /**
   * Get the raw filter query (for backward compatibility)
   */
  public getFilterQuery(): Record<string, any> {
    return { ...this.filterQuery };
  }
}
