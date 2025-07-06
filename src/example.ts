import { AggregationPipelineBuilder } from "./aggregation-pipeline-builder";

const filters = {
  status: "active",
  age: "30",
  "createdAt-from": "2023-01-01",
};

const pipeline = new AggregationPipelineBuilder()
  .match((filters) =>
    filters
      .addStringMatch("status")
      .addNumberMatch("age")
      .addDateRangeMatch("createdAt")
  )
  .sort({ createdAt: -1 })
  .project({ name: 1, email: 1 })
  .build();

console.log(JSON.stringify(pipeline, null, 2));
