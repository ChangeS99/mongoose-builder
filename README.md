# mongoose-builder

A TypeScript utility for building and composing MongoDB aggregation pipelines with type safety and flexibility.

## Installation (WIP)

```bash
npm install mongoose-builder
```

## Dependencies

- [mongoose](https://www.npmjs.com/package/mongoose) (^8.0.3)
- [dayjs](https://www.npmjs.com/package/dayjs) (^1.11.10)

For TypeScript projects, you may also want:

- [@types/mongoose](https://www.npmjs.com/package/@types/mongoose) (^5.11.97) (dev dependency)

## Usage

```typescript
import { AggregationPipelineBuilder } from "mongoose-builder";

// Example usage
const pipeline = new AggregationPipelineBuilder()
  .match((filters) => filters.addStringMatch("status").addNumberMatch("age"))
  .sort({ createdAt: -1 })
  .project({ name: 1, email: 1 })
  .build();

console.log(pipeline);
```

## License

MIT
