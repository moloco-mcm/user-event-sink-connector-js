# User Event Sink Connector for Javascript (Reference Implementation)

This Javascript reference implementation demonstrates how to build a connector for sending user events to Moloco MCM’s User Event ingestion API, showcasing best practices for connection pooling, exponential backoff retries, validation, and error handling, which can be adapted for your own user event data ingestion services.

## Purpose

This reference implementation demonstrates:
- Type-safe event validation patterns
- Event data filtering techniques
- Distinguishes between recoverable and non-recoverable errors
- Implements exponential backoff for transient failures
- Starts with 100ms delay, doubles after each attempt
- Limits maximum retries to prevent infinite loops
- Provides detailed logging for debugging

This pattern is particularly useful for:
- Handling network instability
- Managing rate limits
- Dealing with temporary service unavailability

## Implementation Examples

### Initialize a Connector
```typescript
import { UserEventSinkConnector } from '../dist/esm/UserEventSinkConnector.js'; // For ECMAScript
const { UserEventSinkConnector } = require('../dist/cjs/UserEventSinkConnector.js'); // For CommonJs

const platformId = process.env.PLATFORM_ID;
const apiHostname = process.env.API_HOSTNAME;
const apiKey = process.env.API_KEY;

const connector = new UserEventSinkConnector(platformId, apiHostname, apiKey);
```

### Send Events
```typescript
try {
    // connector.send does exponential backoff retry
    await connector.send(userEvent);
    console.log(`Successfully sent event:`, userEvent);
} catch (error) {
    if (error.response) {
        console.error('Error:', error.response.data);
    } else {
        console.error('Error:', error);
    }
}
```

### Error Types
- **SyntaxError**: Thrown when the input arguments or User Event data are invalid. These errors are immediately thrown as they indicate a fundamental problem that won't be resolved by retrying.
- **Other Errors**: Network issues, rate limits, etc. These are handled with retries.

## Development

### Setup
#### Install dependencies
```bash
npm install
```

#### Build the project
```bash
npm run build
```

#### Run tests with coverage
```bash
npm run test
npm run coverage
```

#### Generate documentation
```bash
npm run docs
```
Documentation will be available in the `docs` directory.

#### Runnin an example
```bash
npm run example
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

---
**Note**: This is a reference implementation intended to demonstrate best practices. You should adapt and modify this code to meet your specific requirements and security needs.