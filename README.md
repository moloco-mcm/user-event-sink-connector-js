# User Event Sink Connector for Javascript (Reference Implementation)

A TypeScript library for validating, processing, and handling user events in a type-safe manner.

## Features

- ✅ Type-safe event validation
- 🔍 Comprehensive event data filtering
- 🚀 Support for multiple event types (Home, PDP, Search, etc.)
- 🧪 Fully tested with Vitest
- 📚 TypeDoc documentation

## Usage

### Basic Event Validation
```typescript
import { UserEventSinkConnector } from 'user-event-sink-connector';

const connector = new UserEventSinkConnector('PLATFORM_1', 'api.example.com', 'api-key-123');
await connector.send({
  userId: '123',
  eventType: 'purchase',
  items: [{id: '456', price: 99.99}]
});
```


### Filtering Null Values
```typescript
import { UserEventUtils } from 'user-event-sink-connector';

const utils = new UserEventUtils();
const filteredData = utils.filterNullValues({
  a: null, b: 'hello', c: undefined, d: {e: null, f: 'world'}
});
```


## Supported Event Types

- `HOME` - Home page events
- `LAND` - Landing page events
- `ITEM_PAGE_VIEW` - Product detail page views
- `ADD_TO_CART` - Cart addition events
- `ADD_TO_WISHLIST` - Wishlist addition events
- `SEARCH` - Search events
- `PAGE_VIEW` - Generic page view events
- `PURCHASE` - Purchase events

## Development

### Setup
#### Install dependencies
```bash
npm install
```

#### Run tests
```bash
npm test
```

#### Generate documentation
```bash
npm run docs
```
Documentation will be available in the `docs` directory.

#### Run tests with coverage
```bash
npm run test
npm run coverage
```

#### Build the project
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
© Moloco, Inc. 2024 All rights reserved. Released under Apache 2.0 License