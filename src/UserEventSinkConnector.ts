import UserEventUtils from './UserEventUtils.js';
import axios from 'axios';


/**
 * A connector class for handling user events in the MCM system.
 * Provides functionality to validate and send user event data to a specified endpoint.
 * 
 * @example
 * ```typescript
 * const connector = new UserEventSinkConnector('PLATFORM_1', 'api.example.com', 'api-key-123');
 * await connector.send({
 *   userId: "123",
 *   eventType: "purchase",
 *   items: [{id: "456", price: 99.99}]
 * });
 * ```
 */
export class UserEventSinkConnector {
    private readonly DEFAULT_MAX_RETRIES = 3;
    private readonly platformID: string;
    private readonly eventApiHostname: string;
    private readonly eventApiKey: string;
    private readonly utils: UserEventUtils;
    private maxRetries = this.DEFAULT_MAX_RETRIES;

    /**
     * Creates a new instance of UserEventSinkConnector.
     * 
     * @param {string} platformID - The platform ID (must be in capital letters with optional underscore characters)
     * @param {string} eventApiHostname - The hostname of the user event API (e.g., 'api.example.com')
     * @param {string} eventApiKey - The User Event API key for authentication
     * @throws {SyntaxError} If any of the parameters are null, empty, or invalid
     */
    constructor(
        platformID: string,
        eventApiHostname: string,
        eventApiKey: string
    ) {
        // Validate constructor parameters
        this.platformID = this.validateParameter('platformID', platformID);
        this.eventApiHostname = this.validateParameter('eventApiHostname', eventApiHostname);
        this.eventApiKey = this.validateParameter('eventApiKey', eventApiKey);
        this.utils = new UserEventUtils();
    }

    /**
     * Sets the maximum number of retries for sending user events.
     * 
     * @param {number} maxRetries - The maximum number of retries
     * @returns {UserEventSinkConnector} This instance for method chaining
     */
    setMaxRetries(maxRetries: number): UserEventSinkConnector {
        if (maxRetries < 1) {
            throw new SyntaxError('maxRetries should be greater than zero(0)')
        }
        this.maxRetries = maxRetries;
        return this;
    }

    /**
     * Validates that a parameter is not null or empty.
     * 
     * @private
     * @param {string} paramName - Name of the parameter being validated
     * @param {string} value - Value to validate
     * @returns {string} The trimmed value if validation passes
     * @throws {SyntaxError} If the parameter is null, empty, or not a string
     */
    validateParameter(paramName: string, value: string): string {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new SyntaxError(`${paramName} cannot be null or empty`);
        }
        return value.trim();
    }

    /**
     * Sends event data to the specified endpoint.
     * Validates, filters, and processes the data before sending.
     * 
     * @param {Record<string, any>} data - Object containing the event data
     * @returns {Promise<string>} The response body from the server if successful
     * @throws {SyntaxError | Error} If data validation fails, processing fails, or the request fails
     */
    async send(data: Record<string, any>) {
        if (!data) {
            throw new SyntaxError('The data cannot be null or empty');
        }

        // Validate the data
        this.utils.validateData(data);

        // Filter null values
        const filteredJson = this.utils.filterNulls(data);
        if (!filteredJson) {
            throw new SyntaxError('Failed to process JSON data: filtered result is null');
        }

        const url = `${this.eventApiHostname}/rmp/event/v1/platforms/${this.platformID}/userevents`;

        let retryCount = 0;
        let waitTimeMilliseconds = 100; // Start with 0.1 seconds

        while (retryCount < this.maxRetries) {
            try {
                const response = await axios.post(url, filteredJson, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-api-key': this.eventApiKey
                    }
                });

                return response.data; // Success - return response
            } catch (error) {
                if (retryCount === this.maxRetries - 1) {
                    throw error; // Rethrow error after max retries
                }

                // console.log(`Retry ${retryCount + 1} after ${waitTimeMilliseconds}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTimeMilliseconds));
                waitTimeMilliseconds *= 2; // Exponential backoff
                retryCount++;
            }
        }
    }

    /**
     * Closes the connector instance.
     * This is a no-op in JavaScript as fetch handles connection cleanup automatically.
     */
    close() {
        // Connection cleanup is handled automatically by fetch
    }
}

export default UserEventSinkConnector;