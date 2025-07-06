// Handles strict lookup stages for FiltersMatchStagesHelper

/**
 * LookupStrictHelper provides a static method to add a $lookup stage followed by $unwind
 * with preserveNullAndEmptyArrays: false, ensuring parent documents are excluded if no matches are found.
 *
 * @example
 * LookupStrictHelper.addStrictLookupFromOtherCollection(
 *   'orders', [{ $match: { status: 'active' } }], 'userId', '_id', 'orders', undefined, stage => pipeline.push(stage)
 * );
 */
export class LookupStrictHelper {
  /**
   * Add a strict lookup stage to the pipeline, followed by $unwind to exclude parents with no matches.
   * @param collection - The target collection to lookup from.
   * @param matchStages - The pipeline stages to apply to the looked-up documents.
   * @param localField - The field from the input documents.
   * @param foreignField - The field from the documents of the "from" collection.
   * @param asName - The name of the new array field to add to the input documents.
   * @param unique_foreign_id - The unique identifier for the foreign field.
   * @param push - The function to push a new stage to the pipeline.
   */
  public static addStrictLookupFromOtherCollection(
    collection: string,
    matchStages: any,
    localField: string,
    foreignField: string,
    asName: string = `${collection}_looked_up`,
    unique_foreign_id?: string,
    push?: (stage: any) => void
  ) {
    if (collection && push) {
      const lookupObject = {
        $lookup: {
          from: collection,
          localField,
          foreignField,
          let: {
            foreign_id: unique_foreign_id ? `${unique_foreign_id}` : '$_id',
          },
          as: asName,
          pipeline: matchStages,
        },
      };
      push(lookupObject);
      // Add $unwind to exclude parent documents with no matches
      push({ $unwind: { path: `$${asName}`, preserveNullAndEmptyArrays: false } });
    }
  }
}
