# User Event Sink Connector for Javascript (Reference Implementation)

This repository contains a reference implementation for processing and handling user events in TypeScript. It demonstrates best practices for event validation, processing, and type safety.

> **Note**: This is a reference implementation intended as a starting point for your own implementation. It is not meant to be used as a library dependency.

## Purpose

This reference implementation demonstrates:
- ✅ Type-safe event validation patterns
- 🔍 Event data filtering techniques
- 🚀 Handling of multiple event types (Home, PDP, Search, etc.)
- 🧪 Testing practices with Vitest
- 📚 Documentation approaches using TypeDoc

## Implementation Examples

### Event Data Validation and Sending
```typescript
import { UserEventSinkConnector } from 'user-event-sink-connector';

const platformId = process.env.PLATFORM_ID;
const apiHostname = process.env.API_HOSTNAME;
const apiKey = process.env.API_KEY;

const connector = new UserEventSinkConnector(platformId, apiHostname, apiKey);
await connector.send({
  userId: '123',
  eventType: 'purchase',
  items: [{id: '456', price: 99.99}]
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

## Using This Reference

1. Clone or fork this repository
2. Study the implementation patterns
3. Adapt the code to your specific needs
4. Implement your own version following these patterns

## Contributing
If you have suggestions for improving this reference implementation:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add some improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request


## License
© Moloco, Inc. 2024 All rights reserved. Released under Apache 2.0 License