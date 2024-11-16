import { Response } from 'node-fetch';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserEventSinkConnector from '../src/UserEventSinkConnector.ts';

// Mock node-fetch
vi.mock('node-fetch', () => {
    return {
        default: vi.fn()
    }
});

// Import fetch after mocking
import fetch from 'node-fetch';

describe('UserEventSinkConnector', () => {
    const validPlatformId = 'TEST_PLATFORM';
    const validHostname = 'https://api.test.com';
    const validApiKey = 'test-api-key';

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe('constructor validation', () => {
        it('should throw error for null platformId', () => {
            expect(() => new UserEventSinkConnector(
                null as unknown as string,
                validHostname, 
                validApiKey
            )).toThrow('platformID cannot be null or empty');
        });

        it('should throw error for empty platformId', () => {
            expect(() => new UserEventSinkConnector(
                '', 
                validHostname, 
                validApiKey
            )).toThrow('platformID cannot be null or empty');
        });

        it('should throw error for null hostname', () => {
            expect(() => new UserEventSinkConnector(
                validPlatformId, 
                null as unknown as string, 
                validApiKey
            )).toThrow('eventApiHostname cannot be null or empty');
        });

        it('should throw error for empty hostname', () => {
            expect(() => new UserEventSinkConnector(
                validPlatformId, 
                '', 
                validApiKey
            )).toThrow('eventApiHostname cannot be null or empty');
        });

        it('should throw error for null apiKey', () => {
            expect(() => new UserEventSinkConnector(
                validPlatformId, 
                validHostname, 
                null as unknown as string,
            )).toThrow('eventApiKey cannot be null or empty');
        });

        it('should throw error for empty apiKey', () => {
            expect(() => new UserEventSinkConnector(
                validPlatformId, 
                validHostname, 
                ''
            )).toThrow('eventApiKey cannot be null or empty');
        });

        it('should create instance with valid parameters', () => {
            expect(() => new UserEventSinkConnector(
                validPlatformId,
                validHostname,
                validApiKey
            )).not.toThrow();
        });
    });

    describe('send method', () => {
        let connector;

        beforeEach(() => {
            connector = new UserEventSinkConnector(
                validPlatformId,
                validHostname,
                validApiKey
            );
        });

        it('should throw error for null data', async () => {
            await expect(connector.send(null))
                .rejects
                .toThrow('The data cannot be null or empty');
        });

        it('should throw error for invalid JSON string', async () => {
            await expect(connector.send('invalid json'))
                .rejects
                .toThrow(SyntaxError);
        });

        it('should successfully send valid event data', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock successful response
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve('{"success": true}')
            } as unknown as import('node-fetch').Response);

            await expect(connector.send(validEvent)).resolves.not.toThrow();

            // Verify the fetch call
            expect(fetch).toHaveBeenCalledWith(
                `${validHostname}/rmp/event/v1/platforms/${validPlatformId}/userevents`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-api-key': validApiKey
                    },
                    body: JSON.stringify(validEvent)
                }
            );
        });

        it('should handle API error responses', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock error response
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: () => Promise.resolve('{"error": "Bad Request"}')
            } as unknown as Response);

            await expect(connector.send(validEvent))
                .rejects
                .toThrow('Request failed: status code: 400');
        });

        it('should handle network errors', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock network error
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));

            await expect(connector.send(validEvent))
                .rejects
                .toThrow('Failed to send request: Network Error');
        });

        it('should handle null response from API', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock null response
            vi.mocked(fetch).mockResolvedValueOnce(undefined as unknown as Response);

            await expect(connector.send(validEvent))
                .rejects
                .toThrow('HTTP response cannot be null');
        });

        it('should send valid JSON string', async () => {
            const validEventString = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock successful response
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: () => Promise.resolve('{}')
            } as unknown as Response);

            await expect(connector.send(validEventString)).resolves.not.toThrow();
        });

        it('should handle null-like response from API', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock null-like response
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: () => Promise.resolve('')
            } as unknown as Response);

            await expect(connector.send(validEvent))
                .rejects
                .toThrow('Failed to send request: Request failed: status code: 500, reason phrase:');
        });
    });
});