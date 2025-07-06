// Handles number and range matches for FiltersMatchStagesHelper

type PushMatchStage = (stage: any) => void;

/**
 * NumberMatchHelper provides static methods for building number-based and range-based
 * match stages for MongoDB aggregation pipelines. These methods are used by FiltersMatchStagesHelper
 * to add equality and range conditions to the pipeline.
 *
 * @example
 * // Usage within FiltersMatchStagesHelper:
 * NumberMatchHelper.addNumberMatch(filters, 'age', pushMatchStage, 30);
 */
export class NumberMatchHelper {
  /**
   * Adds an exact number equality match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to match exactly.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param value - Optional static number value to use instead of getting from filters.
   * @example
   * NumberMatchHelper.addNumberMatch(filters, 'age', pushMatchStage, 30);
   */
  static addNumberMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    value?: number
  ): void {
    const filterValue = value !== undefined ? value : filters[field];
    if (filterValue === undefined || filterValue === '') return;
    const numValue = Number(filterValue);
    if (isNaN(numValue)) return;
    pushMatchStage({ $match: { [field]: numValue } });
    if (value === undefined) delete filters[field];
  }

  /**
   * Adds a greater-than ($gt) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $gt operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * NumberMatchHelper.addGreaterThanMatch(filters, 'price', pushMatchStage);
   */
  static addGreaterThanMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[`${field}-gt`];
    if (value !== undefined && value !== null && value !== '') {
      pushMatchStage({ $match: { [field]: { $gt: value } } });
    }
    delete filters[`${field}-gt`];
  }

  /**
   * Adds a less-than ($lt) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $lt operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * NumberMatchHelper.addLessThanMatch(filters, 'price', pushMatchStage);
   */
  static addLessThanMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[`${field}-lt`];
    if (value !== undefined && value !== null && value !== '') {
      pushMatchStage({ $match: { [field]: { $lt: value } } });
    }
    delete filters[`${field}-lt`];
  }

  /**
   * Adds a greater-than-or-equal ($gte) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $gte operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * NumberMatchHelper.addGreaterThanOrEqualMatch(filters, 'rating', pushMatchStage);
   */
  static addGreaterThanOrEqualMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[`${field}-gte`];
    if (value !== undefined && value !== null && value !== '') {
      pushMatchStage({ $match: { [field]: { $gte: value } } });
    }
    delete filters[`${field}-gte`];
  }

  /**
   * Adds a less-than-or-equal ($lte) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $lte operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * NumberMatchHelper.addLessThanOrEqualMatch(filters, 'rating', pushMatchStage);
   */
  static addLessThanOrEqualMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[`${field}-lte`];
    if (value !== undefined && value !== null && value !== '') {
      pushMatchStage({ $match: { [field]: { $lte: value } } });
    }
    delete filters[`${field}-lte`];
  }

  /**
   * Adds a range match for a single field using $gte and $lte.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the range.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * NumberMatchHelper.addRangeMatch(filters, 'price', pushMatchStage);
   * @note Uses `${field}-from` and `${field}-to` keys in filters.
   */
  static addRangeMatch(filters: any, field: string, pushMatchStage: PushMatchStage): void {
    const from = filters[`${field}-from`];
    const to = filters[`${field}-to`];
    const range: any = {};

    if (from != null && from !== '') {
      range.$gte = from;
    }

    if (to != null && to !== '') {
      range.$lte = to;
    }

    if (Object.keys(range).length > 0) {
      pushMatchStage({ $match: { [field]: range } });
    }

    delete filters[`${field}-from`];
    delete filters[`${field}-to`];
  }
}
}