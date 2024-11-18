import { describe, it, expect, beforeEach } from 'vitest';
import UserEventUtils from '../src/UserEventUtils.ts';

describe('UserEventUtils', () => {
    let utils;

    beforeEach(() => {
        utils = new UserEventUtils();
    });

    describe('validateData', () => {
        it('should throw error for null data', () => {
            expect(() => utils.validateData(null))
                .toThrow('Data parameter cannot be null');
        });

        it('should throw error for missing timestamp', () => {
            expect(() => utils.validateData({ event_type: 'HOME' }))
                .toThrow('The timestamp field must be present');
        });

        it('should throw error for null timestamp', () => {
            expect(() => utils.validateData({ 
                event_type: 'HOME',
                timestamp: null 
            })).toThrow('The timestamp field must be present: {\"event_type\":\"HOME\",\"timestamp\":null}');
        });

        it('should throw error for invalid timestamp format', () => {
            expect(() => utils.validateData({ 
                event_type: 'HOME',
                timestamp: 'invalid' 
            })).toThrow('The timestamp field must be a Unix timestamp in milliseconds');
        });

        it('should throw error for missing event_type', () => {
            expect(() => utils.validateData({ 
                timestamp: '1617870506121' 
            })).toThrow('The event_type field is missing');
        });

        it('should throw error for unknown event type', () => {
            expect(() => utils.validateData({ 
                event_type: 'UNKNOWN',
                timestamp: '1617870506121' 
            })).toThrow('Unknown event type: UNKNOWN');
        });
    });

    describe('event type specific validation', () => {
        const validBase = {
            timestamp: '1617870506121',
            channel_type: 'SITE',
            user_id: 'test_user',
            session_id: ''
        };

        describe('ITEM_PAGE_VIEW validation', () => {
            it('should throw error for missing items', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'ITEM_PAGE_VIEW'
                })).toThrow('The items field must be a non-empty array');
            });

            it('should throw error for empty items array', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'ITEM_PAGE_VIEW',
                    items: []
                })).toThrow('The items field must be a non-empty array');
            });

            it('should accept valid ITEM_PAGE_VIEW data', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'ITEM_PAGE_VIEW',
                    items: [{ id: '123' }]
                })).not.toThrow();
            });
        });

        describe('SEARCH validation', () => {
            it('should throw error for missing search_query', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'SEARCH'
                })).toThrow('The search_query field must be present and non-empty');
            });

            it('should accept valid SEARCH data', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'SEARCH',
                    search_query: 'test query'
                })).not.toThrow();
            });
        });

        describe('PAGE_VIEW validation', () => {
            it('should throw error for missing page_id', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'PAGE_VIEW'
                })).toThrow('The page_id field must be present and non-empty');
            });

            it('should accept valid PAGE_VIEW data', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'PAGE_VIEW',
                    page_id: 'test_page'
                })).not.toThrow();
            });
        });

        describe('PURCHASE validation', () => {
            it('should throw error for missing items', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'PURCHASE'
                })).toThrow('The items field must be a non-empty array for PURCHASE event');
            });

            it('should throw error for empty items array', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'PURCHASE',
                    items: []
                })).toThrow('The items field must be a non-empty array for PURCHASE event');
            });

            it('should accept valid PURCHASE data', () => {
                expect(() => utils.validateData({
                    ...validBase,
                    event_type: 'PURCHASE',
                    items: [{ 
                        id: '123',
                        price: { amount: 10, currency: 'USD' },
                        quantity: 1
                    }],
                    revenue: { amount: 10, currency: 'USD' }
                })).not.toThrow();
            });
        });
    });

    describe('filterNulls', () => {
        it('should return null for null input', () => {
            expect(utils.filterNulls(null)).toBeNull();
        });

        it('should filter null values from objects', () => {
            const input = {
                a: 1,
                b: null,
                c: { d: null, e: 2 },
                f: [1, null, 3]
            };
            const expected = {
                a: 1,
                c: { e: 2 },
                f: [1, 3]
            };
            expect(utils.filterNulls(input)).toEqual(expected);
        });

        it('should handle nested arrays', () => {
            const input = [1, null, [2, null, 3], { a: null, b: 4 }];
            const expected = [1, [2, 3], { b: 4 }];
            expect(utils.filterNulls(input)).toEqual(expected);
        });

        it('should preserve non-null primitive values', () => {
            expect(utils.filterNulls(42)).toBe(42);
            expect(utils.filterNulls('test')).toBe('test');
            expect(utils.filterNulls(false)).toBe(false);
        });
    });
});