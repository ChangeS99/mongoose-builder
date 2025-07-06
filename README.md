# mongoose-builder

A TypeScript utility for building and composing MongoDB aggregation pipelines with type safety and flexibility.

## Installation

```bash
npm install mongoose-builder
```

## Usage

```typescript
import { AggregationPipelineBuilder } from "mongoose-builder";

// Example usage
const pipeline = new AggregationPipelineBuilder()
  .match(filters =>
    filters
      .addStringMatch('status')
      .addNumberMatch('age')
  )
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
