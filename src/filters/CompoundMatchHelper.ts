// Handles compound AND/OR logic for FiltersMatchStagesHelper

export class CompoundMatchHelper {
  /**
   * Add an "OR" match to the pipeline.
   * @param filters - The filters object (mutated in-place).
   * @param push - The function to push a new match stage.
   */
  public static addOrMatch(filters: any, push: (stage: any) => void): void {
    const orConditions = filters.or;
    if (orConditions && Array.isArray(orConditions) && orConditions.length > 0) {
      push({
        $match: {
          $or: orConditions,
        },
      });
      delete filters.or;
    }
  }

  /**
   * Add an "OR" match with a prefix to the pipeline.
   * @param filters - The filters object (mutated in-place).
   * @param prefix - The prefix for the filter key.
   * @param push - The function to push a new match stage.
   */
  public static addOrMatchWithPrefix(filters: any, prefix: string, push: (stage: any) => void): void {
    const filterKey = `${prefix}-or`;
    const orConditions = filters[filterKey];

    if (orConditions && Array.isArray(orConditions) && orConditions.length > 0) {
      push({
        $match: {
          $or: orConditions,
        },
      });
      delete filters[filterKey];
    }
  }

  /**
   * Add an "AND" match to the pipeline.
   * @param filters - The filters object (mutated in-place).
   * @param push - The function to push a new match stage.
   */
  public static addAndMatch(filters: any, push: (stage: any) => void): void {
    const andConditions = filters.and;
    if (andConditions && Array.isArray(andConditions) && andConditions.length > 0) {
      push({
        $match: {
          $and: andConditions,
        },
      });
      delete filters.and;
    }
  }
}