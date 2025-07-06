# mongoose-builder

A TypeScript utility for building and composing MongoDB aggregation pipelines with type safety and flexibility.

## Installation

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

## TypeScript Support

This package is written in TypeScript and ships with type definitions. You can use it directly in TypeScript projects for full type safety and autocompletion.

## Contributing

Pull requests and issues are welcome. Please open an issue to discuss your ideas or report bugs.

## License

MIT
