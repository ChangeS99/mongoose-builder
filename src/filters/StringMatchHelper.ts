// Handles string, regex, and not-equal matches for FiltersMatchStagesHelper

type PushMatchStage = (stage: any) => void;

/**
 * StringMatchHelper provides static methods for building string-based match stages
 * for MongoDB aggregation pipelines. These methods are used by FiltersMatchStagesHelper
 * to add string equality, regex, and not-equal conditions to the pipeline.
 *
 * @example
 * // Usage within FiltersMatchStagesHelper:
 * StringMatchHelper.addStringMatch(filters, 'status', pushMatchStage, 'active');
 */
export class StringMatchHelper {
  /**
   * Adds an exact string equality match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to match exactly.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param value - Optional static string value to use instead of getting from filters.
   * @example
   * StringMatchHelper.addStringMatch(filters, 'status', pushMatchStage, 'active');
   */
  static addStringMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    value?: string
  ): void {
    const filterValue = value !== undefined ? value : filters[field];
    if (filterValue === undefined || filterValue === '') return;
    if (typeof filterValue !== 'string') return;
    pushMatchStage({ $match: { [field]: filterValue } });
    if (value === undefined) delete filters[field];
  }

  /**
   * Adds a regex match filter for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the regex match.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param options - Regex options (default: 'i' for case-insensitive).
   * @example
   * StringMatchHelper.addRegexMatch(filters, 'username', pushMatchStage, 'i');
   * @note Escapes special regex characters in the filter value.
   */
  static addRegexMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    options: string = 'i'
  ): void {
    const raw = filters[field];
    if (raw !== undefined && raw !== null && raw !== '') {
      const escaped = String(raw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      pushMatchStage({ $match: { [field]: { $regex: escaped, $options: options } } });
      delete filters[field];
    }
  }

  /**
   * Adds a not-equal match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the not-equal condition.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * StringMatchHelper.addNotEqualMatch(filters, 'status', pushMatchStage);
   */
  static addNotEqualMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[`${field}-not`];
    if (value !== undefined && value !== null && value !== '') {
      pushMatchStage({ $match: { [field]: { $ne: value } } });
      delete filters[`${field}-not`];
    }
  }
}