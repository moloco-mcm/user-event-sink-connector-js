import UserEventUtils from './UserEventUtils.js';
import fetch, { Response } from 'node-fetch';

/**
 * Interface representing a user event with required userId and eventType fields.
 * Additional properties are allowed through an index signature.
 */
interface UserEvent {
    userId: string;
    eventType: string;
    [key: string]: any;  // Allow additional properties
}

/**
 * Configuration options for event handling.
 */
interface EventOptions {
    retry?: boolean;    // Whether to retry failed requests
    timeout?: number;   // Request timeout in milliseconds
}

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
    private readonly platformID: string;
    private readonly eventApiHostname: string;
    private readonly eventApiKey: string;
    private readonly utils: UserEventUtils;

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

        // // Convert string to JSON if necessary
        // const jsonData = typeof data === 'string' ? JSON.parse(data) : data;

        // Validate the data
        this.utils.validateData(data);

        // Filter null values
        const filteredJson = this.utils.filterNulls(data);
        if (!filteredJson) {
            throw new SyntaxError('Failed to process JSON data: filtered result is null');
        }

        const url = `${this.eventApiHostname}/rmp/event/v1/platforms/${this.platformID}/userevents`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': this.eventApiKey
                },
                body: JSON.stringify(filteredJson)
            });

            return await this.handleResponse(response);
        } catch (error) {
            throw new Error(`Failed to send request: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Processes an HTTP response and returns the content if successful.
     * 
     * @private
     * @param {Response} response - The fetch Response object
     * @returns {Promise<string>} The response body if the request was successful
     * @throws {Error} If the response is null or the request failed (non-2xx status)
     */
    async handleResponse(response: Response) {
        if (!response) {
            throw new Error('HTTP response cannot be null');
        }

        const responseBody = await response.text();

        if (response.ok) { // status >= 200 && status < 300
            return responseBody;
        } else {
            throw new Error(
                `Request failed: status code: ${response.status}, reason phrase: ${responseBody}`
            );
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