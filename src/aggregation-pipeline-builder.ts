import { FilterStageBuilder } from "./filter-stage-builder";

import { LookupStrictHelper } from "./filters/LookupStrictHelper";

/**
 * AggregationPipelineBuilder provides a fluent API for constructing MongoDB aggregation pipelines.
 * It simplifies adding various stages like $match, $lookup, $project, $sort, etc.,
 * and integrates with FilterStageBuilder for complex filtering.
 *
 * @example
 * const pipeline = new AggregationPipelineBuilder()
 *   .match(filters =>
 *     filters
 *       .addStringMatch('status')
 *       .addNumberMatch('age')
 *   )
 *   .sort({ createdAt: -1 })
 *   .project({ name: 1, email: 1 })
 *   .build();
 */
export class AggregationPipelineBuilder {
  private pipeline: any[] = [];
  private filters: Record<string, any>;

  /**
   * Constructs a new AggregationPipelineBuilder.
   * @param filters - An optional object containing filters to be used by the FilterStageBuilder.
   */
  constructor(filters: Record<string, any> = {}) {
    // Create a shallow copy to prevent mutation of the original object,
    // as FilterStageBuilder deletes keys from the filters object it processes.
    this.filters = { ...filters };
  }

  /**
   * Adds a $match stage to the pipeline. You can either provide a filter object directly
   * or use a callback with a FilterStageBuilder for more complex filtering logic.
   * If a function is provided, it will be called with a FilterStageBuilder instance
   * initialized with the filters passed to the AggregationPipelineBuilder constructor.
   *
   * @param filters - A filter object or a function that receives a FilterStageBuilder instance.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public match(
    filters:
      | Record<string, any>
      | ((builder: FilterStageBuilder) => FilterStageBuilder)
  ): this {
    if (typeof filters === "function") {
      // Pass a copy of the filters to FilterStageBuilder because it mutates the object.
      // This allows the original filters to be reused in subsequent stages if needed.
      const filterBuilder = new FilterStageBuilder({ ...this.filters });
      const matchStages = filters(filterBuilder).build();
      if (matchStages.length > 0) {
        this.pipeline.push(...matchStages);
      }
    } else {
      this.pipeline.push({ $match: filters });
    }
    return this;
  }

  /**
   * Adds a $sort stage to the pipeline.
   *
   * @param sort - The sort object (e.g., { createdAt: -1 }).
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public sort(sort: Record<string, 1 | -1>): this {
    this.pipeline.push({ $sort: sort });
    return this;
  }

  /**
   * Adds a $project stage to the pipeline.
   *
   * @param projection - The projection object (e.g., { name: 1, email: 1 }).
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public project(projection: Record<string, any>): this {
    this.pipeline.push({ $project: projection });
    return this;
  }

  /**
   * Adds a $lookup stage to the pipeline.
   *
   * @param lookup - The lookup object.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public lookup(lookup: Record<string, any>): this {
    this.pipeline.push({ $lookup: lookup });
    return this;
  }

  /**
   * Adds a strict $lookup stage followed by $unwind (preserveNullAndEmptyArrays: false) to the pipeline.
   * This will exclude parent documents if the lookup yields no matches.
   *
   * @param collection - The target collection to lookup from.
   * @param matchStages - The pipeline stages to apply to the looked-up documents.
   * @param localField - The field from the input documents.
   * @param foreignField - The field from the documents of the "from" collection.
   * @param asName - The name of the new array field to add to the input documents.
   * @param unique_foreign_id - The unique identifier for the foreign field.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   *
   * @example
   * builder.strictLookup('orders', [{ $match: { status: 'active' } }], 'userId', '_id', 'orders')
   */
  public strictLookup(
    collection: string,
    matchStages: any,
    localField: string,
    foreignField: string,
    asName: string = `${collection}_looked_up`,
    unique_foreign_id?: string
  ): this {
    LookupStrictHelper.addStrictLookupFromOtherCollection(
      collection,
      matchStages,
      localField,
      foreignField,
      asName,
      unique_foreign_id,
      (stage) => this.pipeline.push(stage)
    );
    return this;
  }

  /**
   * Adds a $limit stage to the pipeline.
   *
   * @param limit - The maximum number of documents to return.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public limit(limit: number): this {
    this.pipeline.push({ $limit: limit });
    return this;
  }

  /**
   * Adds a $skip stage to the pipeline.
   *
   * @param skip - The number of documents to skip.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public skip(skip: number): this {
    this.pipeline.push({ $skip: skip });
    return this;
  }

  /**
   * Adds a $group stage to the pipeline.
   *
   * @param group - The group object.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public group(group: Record<string, any>): this {
    this.pipeline.push({ $group: group });
    return this;
  }

  /**
   * Adds an $unwind stage to the pipeline.
   *
   * @param field - The field to unwind.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public unwind(field: string | Record<string, any>): this {
    if (typeof field === "string") {
      this.pipeline.push({ $unwind: `$${field}` });
    } else {
      this.pipeline.push({ $unwind: field });
    }
    return this;
  }

  /**
   * Adds a custom stage to the pipeline.
   *
   * @param stage - The custom stage to add.
   * @returns The AggregationPipelineBuilder instance (for chaining).
   */
  public addStage(stage: Record<string, any>): this {
    this.pipeline.push(stage);
    return this;
  }

  /**
   * Builds and returns the final aggregation pipeline.
   *
   * @returns The aggregation pipeline array.
   */
  public build(): any[] {
    return this.pipeline;
  }
}
