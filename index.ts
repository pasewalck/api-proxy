import express, { Request, Response } from 'express';
import axios from 'axios';
import { getCachedResponse, cacheResponse } from './database';

const app = express();
app.use(express.json());

require('dotenv').config();

const port = process.env.PORT || 3000
const key = process.env.API_KEY

if (key == "" || key == undefined)
    throw Error("No API Key provided! Please provide an API Key via environment variables.")

app.all('/api-proxy/:key/:ttl/:endpoint', async (req: Request, res: Response) => {
    try {
        if (key != req.params.key) {
            res.status(500).json({ error: 'Invalid API Key!' });
            return;
        } else {

            const endpoint = decodeURI(req.params.endpoint);
            const ttl = parseInt(req.params.ttl);
            const url = new URL(endpoint);
            const params = Object.fromEntries(url.searchParams);

            const cacheKey = `${endpoint}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;

            console.log(`Request for cacheKey: ${cacheKey}`);

            const cachedResponse = getCachedResponse(cacheKey);
            if (cachedResponse) {
                console.log('Serving from cache');
                return res.json(cachedResponse);
            }

            const response = await axios({
                method: req.method,
                url: endpoint,
                params: { ...params, ...req.query },
                data: req.body,
            });

            cacheResponse(cacheKey, response.data, ttl);
            console.log('Serving result and saving cache');
            res.set(response.headers);
            res.status(response.status).send(response.data);
        }

    } catch (error: any) {
        if (error.message) {
            console.error(error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.listen(port, () => {
    console.log(`Proxy API listening on port ${port}`);
});
