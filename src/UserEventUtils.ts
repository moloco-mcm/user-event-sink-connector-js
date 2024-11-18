/**
 * Utility class for validating and processing user event data.
 * Provides methods for validating event types, common fields, and filtering null values.
 */
class UserEventUtils {
    /** Map of event types to their corresponding validation functions */
    private testActions: Map<string, (data: Record<string, any>) => void>;

    /**
     * Initializes a new instance of UserEventUtils.
     * Sets up validation functions for different event types.
     */
    constructor() {
        this.testActions = new Map([
            ['HOME', this.testHome.bind(this)],
            ['LAND', this.testHome.bind(this)],
            ['ITEM_PAGE_VIEW', this.testPDP.bind(this)],
            ['ADD_TO_CART', this.testPDP.bind(this)],
            ['ADD_TO_WISHLIST', this.testPDP.bind(this)],
            ['SEARCH', this.testSearch.bind(this)],
            ['PAGE_VIEW', this.testPageView.bind(this)],
            ['PURCHASE', this.testPurchase.bind(this)]
        ]);
    }

    /**
     * Validates user event data by checking common fields and event-specific requirements.
     * 
     * @param {Record<string, any>} data - The event data to validate
     * @throws {SyntaxError} If validation fails for any required fields
     */
    validateData(data: Record<string, any>) {
        // Test common fields first
        this.testCommon(data);

        if (!data.event_type) {
            throw new SyntaxError('The event_type field is missing');
        }

        const validator = this.testActions.get(data.event_type);
        if (!validator) {
            throw new SyntaxError(`Unknown event type: ${data.event_type}`);
        }

        validator(data);
    }

    /**
     * Validates common fields that are required for all event types.
     * Currently checks for presence and validity of timestamp field.
     * 
     * @param {Record<string, any>} data - The event data to validate
     * @throws {SyntaxError} If common field validation fails
     */
    testCommon(data: Record<string, any>) {
        if (!data) {
            throw new SyntaxError('Data parameter cannot be null');
        }

        if (!data.timestamp) {
            throw new SyntaxError(`The timestamp field must be present: ${JSON.stringify(data)}`);
        }

        const timestamp = String(data.timestamp);
        if (!timestamp) {
            throw new SyntaxError(`The timestamp field cannot be null: ${JSON.stringify(data)}`);
        }

        if (isNaN(Number(timestamp))) {
            throw new SyntaxError(`The timestamp field must be a Unix timestamp in milliseconds: ${JSON.stringify(data)}`);
        }
    }

    /**
     * Validates home page event data.
     * Currently a placeholder for future validation logic.
     * 
     * @param {Record<string, any>} data - The home page event data
     */
    testHome(data: Record<string, any>) {
        // To add validation logic
    }

    /**
     * Validates product detail page (PDP) event data.
     * Checks for presence of non-empty items array.
     * 
     * @param {Record<string, any>} data - The PDP event data
     * @throws {SyntaxError} If items array is missing or empty
     */
    testPDP(data: Record<string, any>) {
        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new SyntaxError(`The items field must be a non-empty array: ${JSON.stringify(data)}`);
        }
    }

    /**
     * Validates search event data.
     * Checks for presence of search query.
     * 
     * @param {Record<string, any>} data - The search event data
     * @throws {SyntaxError} If search_query is missing or empty
     */
    testSearch(data: Record<string, any>) {
        if (!data.search_query) {
            throw new SyntaxError(`The search_query field must be present and non-empty: ${JSON.stringify(data)}`);
        }
    }

    /**
     * Validates page view event data.
     * Checks for presence of page ID.
     * 
     * @param {Record<string, any>} data - The page view event data
     * @throws {SyntaxError} If page_id is missing or empty
     */
    testPageView(data: Record<string, any>) {
        if (!data.page_id) {
            throw new SyntaxError(`The page_id field must be present and non-empty: ${JSON.stringify(data)}`);
        }
    }

    /**
     * Validates purchase event data.
     * Checks for presence of non-empty items array.
     * 
     * @param {Record<string, any>} data - The purchase event data
     * @throws {SyntaxError} If items array is missing or empty
     */
    testPurchase(data: Record<string, any>) {
        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new SyntaxError(`The items field must be a non-empty array for PURCHASE event: ${JSON.stringify(data)}`);
        }
    }

    /**
     * Recursively filters out null and undefined values from objects and arrays.
     * 
     * @param {Record<string, any>} data - The data to filter
     * @returns {Record<string, any> | null} Filtered data with null/undefined values removed, or null if input is null/undefined
     */
    filterNulls(data: Record<string, any>) {
        // Return early for null/undefined
        if (data == null) {
            return null;
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return this.filterArray(data);
        }

        // Handle non-object types
        if (typeof data !== 'object') {
            return data;
        }

        // Handle objects
        const filtered: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) {
                continue;
            }

            if (Array.isArray(value)) {
                filtered[key] = this.filterArray(value);
            } else if (typeof value === 'object') {
                filtered[key] = this.filterNulls(value);
            } else {
                filtered[key] = value;
            }
        }

        return filtered;
    }

    /**
     * Helper method to filter null/undefined values from arrays and process nested objects.
     * 
     * @param {any[]} array - The array to filter
     * @returns {any[] | null} Filtered array with null/undefined values removed, or null if input is null/undefined
     */
    filterArray(array: any[]) {
        if (!array) {
            return null;
        }

        return array
            .filter(item => item != null)
            .map((item): any => {
                if (Array.isArray(item)) {
                    return this.filterArray(item);
                }
                if (typeof item === 'object') {
                    return this.filterNulls(item);
                }
                return item;
            });
    }
}

// Example usage:
/*
const utils = new UserEventUtils();

// Example validation
try {
    utils.validateData({
        event_type: 'SEARCH',
        timestamp: Date.now(),
        search_query: 'test query'
    });
    console.log('Validation passed');
} catch (error) {
    console.error('Validation failed:', error.message);
}

// Example filtering
const filtered = utils.filterNulls({
    a: 1,
    b: null,
    c: {
        d: null,
        e: 2
    },
    f: [1, null, 3]
});
console.log(filtered);
*/

export default UserEventUtils;