

// Handles lookup stages for FiltersMatchStagesHelper

export class LookupHelper {
  /**
   * Add a lookup stage to the pipeline.
   * @param collection - The target collection to lookup from.
   * @param matchStages - The pipeline stages to apply to the looked-up documents.
   * @param localField - The field from the input documents.
   * @param foreignField - The field from the documents of the "from" collection.
   * @param asName - The name of the new array field to add to the input documents.
   * @param unique_foreign_id - The unique identifier for the foreign field.
   * @param push - The function to push a new match stage.
   */
  public static addLookupFromOtherCollection(
    collection: string,
    matchStages: any,
    localField: string,
    foreignField: string,
    asName: string = 'looked_up',
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
    }
  }
}