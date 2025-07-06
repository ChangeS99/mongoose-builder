// Handles array, in, not-in, and ObjectId matches for FiltersMatchStagesHelper

import { Types } from 'mongoose';
type PushMatchStage = (stage: any) => void;

/**
 * ArrayMatchHelper provides static methods for building array-based and ObjectId-based
 * match stages for MongoDB aggregation pipelines. These methods are used by FiltersMatchStagesHelper
 * to add $in, $nin, and ObjectId conditions to the pipeline.
 *
 * @example
 * // Usage within FiltersMatchStagesHelper:
 * ArrayMatchHelper.addInMatch(filters, 'status', pushMatchStage, ['active', 'pending']);
 */
export class ArrayMatchHelper {
  /**
   * Adds an $in match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $in operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param staticValues - Optional array to use for $in instead of filter value.
   * @example
   * ArrayMatchHelper.addInMatch(filters, 'status', pushMatchStage, ['active', 'pending']);
   */
  static addInMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    staticValues?: any[]
  ): void {
    const filterKey = `${field}-in`;
    const value = staticValues ?? filters[filterKey];
    if (value !== undefined && value !== null) {
      const arr = Array.isArray(value) ? value : [value];
      pushMatchStage({ $match: { [field]: { $in: arr } } });
      if (!staticValues) delete filters[filterKey];
    }
  }

  /**
   * Adds an $in match for ObjectId values for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $in operator with ObjectIds.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param staticValues - Optional array to use for $in instead of filter value.
   * @example
   * ArrayMatchHelper.addInMatchWithObjectIds(filters, 'userIds', pushMatchStage, ['id1', 'id2']);
   * @note Only valid ObjectIds are included.
   */
  static addInMatchWithObjectIds(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    staticValues?: any[]
  ): void {
    const filterKey = `${field}-in`;
    const value = staticValues ?? filters[filterKey];
    if (value !== undefined && value !== null) {
      const arr = Array.isArray(value) ? value : [value];
      const validIds = arr.filter((v: any) => Types.ObjectId.isValid(v));
      if (validIds.length > 0) {
        pushMatchStage({ $match: { [field]: { $in: validIds.map((v: any) => new Types.ObjectId(v)) } } });
      }
      if (!staticValues) delete filters[filterKey];
    }
  }

  /**
   * Adds an exact ObjectId match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to match as an ObjectId.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * ArrayMatchHelper.addObjectIdMatch(filters, 'userId', pushMatchStage);
   */
  static addObjectIdMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[field];
    if (value !== undefined && value !== null && value !== '' && Types.ObjectId.isValid(value)) {
      pushMatchStage({ $match: { [field]: new Types.ObjectId(value) } });
      delete filters[field];
    }
  }

  /**
   * Adds an $in match for an array of ObjectIds for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $in operator with ObjectIds.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * ArrayMatchHelper.addObjectIdsMatch(filters, 'userIds', pushMatchStage);
   */
  static addObjectIdsMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[field];
    if (value !== undefined && value !== null) {
      const arr = Array.isArray(value) ? value : [value];
      const validIds = arr.filter((v: any) => Types.ObjectId.isValid(v));
      if (validIds.length > 0) {
        pushMatchStage({ $match: { [field]: { $in: validIds.map((v: any) => new Types.ObjectId(v)) } } });
        delete filters[field];
      }
    }
  }

  /**
   * Adds a $nin (not in) match for the given field.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to apply the $nin operator.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @param staticValues - Optional array to use for $nin instead of filter value.
   * @example
   * ArrayMatchHelper.addNotInMatch(filters, 'category', pushMatchStage, ['test', 'demo']);
   */
  static addNotInMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage,
    staticValues?: any[]
  ): void {
    const value = staticValues ?? filters[`${field}-nin`];
    if (value !== undefined && value !== null) {
      const arr = Array.isArray(value) ? value : [value];
      pushMatchStage({ $match: { [field]: { $nin: arr } } });
    }
    delete filters[`${field}-nin`];
  }

  /**
   * Adds a match for arrays that are not empty.
   *
   * @param filters - The filters object containing filter values.
   * @param field - The field to check for non-empty array.
   * @param pushMatchStage - Callback to push the constructed match stage.
   * @example
   * ArrayMatchHelper.addArrayNotEmptyMatch(filters, 'tags', pushMatchStage);
   * @note Checks for $exists: true and $not: { $size: 0 }.
   */
  static addArrayNotEmptyMatch(
    filters: any,
    field: string,
    pushMatchStage: PushMatchStage
  ): void {
    const value = filters[`${field}-nt-empty`];
    if (value === true || value === 'true') {
      pushMatchStage({ $match: { [field]: { $exists: true, $not: { $size: 0 } } } });
      delete filters[`${field}-nt-empty`];
    }
  }
}