
import { Types } from 'mongoose';

export class MiscMatchHelper {
  /**
   * Add a "not deleted" filter, assuming a soft-delete mechanism using `deletedAt: null`.
   * @param filters - The filters object (mutated in-place).
   * @param push - The function to push a new match stage.
   */
  public static addNotDeleted(filters: any, push: (stage: any) => void): void {
    push({
      $match: {
        deletedAt: null,
      },
    });
    // Clean up the filter key if it was used to trigger this logic
    delete filters.deletedAt;
  }

  /**
   * Add a custom filter object to the main query.
   * @param filters - The filters object (mutated in-place).
   * @param custom - The custom filter object to merge.
   */
  public static addCustomFilter(filters: any, custom: Record<string, any>): void {
    // This helper might not be the best place for this logic,
    // as it directly mutates the filter query rather than pushing a stage.
    // Consider if this should be handled directly in the builder.
    Object.assign(filters, custom);
  }

  /**
   * Add a "null" match for a given field.
   * @param filters - The filters object (mutated in-place).
   * @param field - The field to check for null.
   * @param push - The function to push a new match stage.
   */
  public static addNullMatch(filters: any, field: string, push: (stage: any) => void): void {
    const filterKey = `${field}-isnull`;
    const value = filters[filterKey];
    if (value === true || value === 'true') {
      push({
        $match: {
          [field]: null,
        },
      });
      delete filters[filterKey];
    }
  }

  /**
   * Add a "not null" match for a given field.
   * @param filters - The filters object (mutated in-place).
   * @param field - The field to check for non-null.
   * @param push - The function to push a new match stage.
   */
  public static addNotNullMatch(filters: any, field: string, push: (stage: any) => void): void {
    const filterKey = `${field}-notnull`;
    const value = filters[filterKey];
    if (value === true || value === 'true') {
      push({
        $match: {
          [field]: { $ne: null },
        },
      });
      delete filters[filterKey];
    }
  }

  /**
   * Add a boolean match based on suffixed keys (e.g., `field-true`, `field-false`).
   * @param filters - The filters object (mutated in-place).
   * @param field - The field to match.
   * @param push - The function to push a new match stage.
   */
  public static addBooleanMatch(filters: any, field: string, push: (stage: any) => void): void {
    const trueFilterKey = `${field}-true`;
    const falseFilterKey = `${field}-false`;
    const trueFlag = filters[trueFilterKey];
    const falseFlag = filters[falseFilterKey];

    if (trueFlag === true || trueFlag === 'true') {
      push({ $match: { [field]: true } });
      delete filters[trueFilterKey];
    } else if (falseFlag === true || falseFlag === 'true') {
      push({ $match: { [field]: false } });
      delete filters[falseFilterKey];
    }
  }

  /**
   * Add an "exists" check for a given field.
   * @param filters - The filters object (mutated in-place).
   * @param field - The field to check for existence.
   * @param push - The function to push a new match stage.
   */
  public static addExistsMatch(filters: any, field: string, push: (stage: any) => void): void {
    const filterKey = `${field}-exists`;
    const existsFlag = filters[filterKey];

    if (existsFlag === true || existsFlag === 'true') {
      push({ $match: { [field]: { $exists: true } } });
      delete filters[filterKey];
    } else if (existsFlag === false || existsFlag === 'false') {
      push({ $match: { [field]: { $exists: false } } });
      delete filters[filterKey];
    }
  }
}
