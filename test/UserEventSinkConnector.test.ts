import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import UserEventSinkConnector from '../src/UserEventSinkConnector.ts';

// Mock axios
vi.mock('axios');

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
            // Clear all mocks before each test
            vi.clearAllMocks();
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
                id: "ajs-next-1729973784295-1f893e86-ce88-430c-9822-5d37ef1c4a22",
                timestamp: "1617870506121",
                channel_type: "SITE", 
                user_id: "ecd14bdae1469f963df2726f88a2eab5bdd53953",
                session_id: "",
                name: "Dashboard Viewed",
                event_type: "HOME"
            };

            // Mock successful response
            vi.spyOn(axios, 'post').mockResolvedValueOnce({
                status: 200,
                data: { success: true }
            });

            await expect(connector.send(validEvent)).resolves.not.toThrow();

            // Verify the axios call
            expect(axios.post).toHaveBeenCalledWith(
                `${validHostname}/rmp/event/v1/platforms/${validPlatformId}/userevents`,
                validEvent,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'x-api-key': validApiKey
                    }
                }
            );
        });

        it('should handle API error responses', async () => {
            const validEvent = {
                id: "ajs-next-1729973784295-1f893e86-ce88-430c-9822-5d37ef1c4a22",
                timestamp: "1617870506121",
                channel_type: "SITE", 
                user_id: "ecd14bdae1469f963df2726f88a2eab5bdd53953",
                session_id: "",
                name: "Dashboard Viewed",
                event_type: "HOME"
            };

            // Mock error response
            vi.spyOn(axios, 'post').mockRejectedValueOnce(
                new Error('Request failed: status code: 400')
            );

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
            vi.spyOn(axios, 'post').mockRejectedValueOnce(
                new Error('Failed to send request: Network Error')
            );

            await expect(connector.send(validEvent))
                .rejects
                .toThrow('Network Error');
        });

        it('should handle null response from API', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock null response
            vi.spyOn(axios, 'post').mockRejectedValueOnce(
                undefined as unknown as Response
            );

            await expect(connector.send(validEvent))
                .rejects.not
                .toThrow(Error);
        });

        it('should send valid JSON string', async () => {
            const validEvent = {
                id: "ajs-next-1729973784295-1f893e86-ce88-430c-9822-5d37ef1c4a22",
                timestamp: "1617870506121",
                channel_type: "SITE", 
                user_id: "ecd14bdae1469f963df2726f88a2eab5bdd53953",
                session_id: "",
                name: "Dashboard Viewed",
                event_type: "HOME"
            };

            // Mock successful response
            vi.spyOn(axios, 'post').mockResolvedValueOnce({
                status: 200,
                data: {}
            });

            await expect(connector.send(validEvent)).resolves.not.toThrow();
        });

        it('should handle null-like response from API', async () => {
            const validEvent = {
                event_type: 'PAGE_VIEW',
                timestamp: '1617870506121',
                page_id: 'test_page'
            };

            // Mock null-like response
            vi.spyOn(axios, 'post').mockRejectedValueOnce(
                new Error('Failed to send request: Internal Server Error')
            );

            await expect(connector.send(validEvent))
                .rejects
                .toThrow('Failed to send request: Internal Server Error');
        });
    });
});