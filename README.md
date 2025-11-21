# Prototype Chaching Proxy API

This project implements a prototype for a caching proxy api. The results of api requests are cached for a specific time period based on a key generated from the request.

**This is a prototype and not tested in production.**

Copyright (C) 2025 Jana Caroline Pasewalck

## Setup

This application uses an **api url scheme** as follows: `http://localhost/6000/proxy-api/{api-key}/{ttl-in-hours}/{encoded-target-api-url}`

To encode your target API URL, use a tool like [this url encoder](https://www.urlencoder.io/) or similar.

An API Key needs to be passed in via environment variables as follows: `APP_KEY={very_secret_string}`
