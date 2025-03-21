// For ECMAScript
import 'dotenv/config';
import { UserEventSinkConnector } from '../dist/esm/UserEventSinkConnector.js';
if (import.meta.url === new URL(import.meta.url).href) {
    main().catch(console.error);
}
export default main;


// For CommonJS
// require('dotenv').config();
// const { UserEventSinkConnector } = require('../dist/cjs/UserEventSinkConnector.js');
// if (require.main === module) {
//     main().catch(console.error);
// }
// module.exports = main;

async function main() {
    // Get environment variables with defaults
    const platformId = process.env.PLATFORM_ID;
    const apiHostname = process.env.API_HOSTNAME;
    const apiKey = process.env.API_KEY;

    if (!platformId || !apiHostname || !apiKey) {
        throw new Error('Required environment variables PLATFORM_ID, API_HOSTNAME, and API_KEY must be set');
    }

    let connector = null;

    try {
        connector = new UserEventSinkConnector(
            platformId,
            apiHostname,
            apiKey
        );

        // Sample events
        const userEvents = [
            // HOME event
            {
                id: "ajs-next-1729973784295-1f893e86-ce88-430c-9822-5d37ef1c4a22",
                timestamp: "1617870506121",
                channel_type: "SITE", 
                user_id: "shoppers_hashed_user_id",
                session_id: "",
                name: "Dashboard Viewed",
                event_type: "HOME"
            },

            // ITEM_PAGE_VIEW event
            {
                id: "ajs-next-1729986778105-2e18cab3-8fd4-473f-8953-d5899fac8c03",
                timestamp: "1617870506121",
                channel_type: "SITE",
                user_id: "shoppers_hashed_user_id",
                session_id: "",
                event_type: "ITEM_PAGE_VIEW",
                items: [{id: "2199832"}]
            },

            // SEARCH event
            {
                id: "ajs-next-1729981795685-5b1deab4-39d7-4bfa-af3b-3e183f68c0ae",
                timestamp: "1617870506121",
                channel_type: "SITE",
                user_id: "shoppers_hashed_user_id",
                session_id: "",
                event_type: "SEARCH",
                search_query: "colorado vape"
            },

            // PAGE_VIEW event
            {
                id: "ajs-next-1729981991771-ef5e378e-6e6f-41d9-add1-6984bc2dda77",
                timestamp: "1617870506121",
                channel_type: "SITE",
                user_id: "shoppers_hashed_user_id",
                session_id: "",
                name: "Shop Brands Viewed",
                event_type: "PAGE_VIEW",
                page_id: "SHOP_BRANDS"
            },

            // PURCHASE event
            {
                id: "88ec57bb-bd54-4391-b296-c7de36c45728",
                timestamp: "1617870506121",
                channel_type: "SITE",
                user_id: "shoppers_hashed_user_id",
                session_id: "",
                items: [{
                    id: "2031646",
                    price: {amount: 50, currency: "USD"},
                    quantity: 25
                }],
                revenue: {amount: 1250, currency: "USD"},
                event_type: "PURCHASE",
                shipping_charge: {amount: 0, currency: "USD"}
            }
        ];

        for (const userEvent of userEvents) {
            const response = await connector.send(userEvent);
            console.log(`Successfully sent event:`, userEvent);
            // console.log('Response body:', response);
        }
    } catch (error) {
        if (error.response) {
            console.error('ERROR:', error.response.data);
        } else {
            console.error('ERROR:', error.message);
        }
    }
}
