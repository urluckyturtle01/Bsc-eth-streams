# BSC Swaps Dashboard

Real-time Binance Smart Chain (BSC) swap events dashboard with live Kafka stream integration.

## Overview

This dashboard displays real-time BSC DEX swap events streamed from a Kafka topic. It provides a clean, filterable interface to monitor token swaps, trading activity, and market movements across the BSC network.

## Features

- **Real-time Events**: Live WebSocket connection to Kafka stream
- **Event Filtering**: Filter by buy/sell type, platform/DEX, and token contract address
- **Token Information**: View token symbols, contract addresses, and swap details
- **Transaction Links**: Direct links to BSCScan for wallet addresses and transactions
- **Modern UI**: Dark theme with responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js WebSocket server
- **Data**: Kafka (kafkajs), Protocol Buffers (protobufjs)

## Kafka Configuration

- **Broker**: 35.231.146.165:9092
- **Topic**: bsc-swaps
- **Format**: Protocol Buffers (protobuf)
- **WebSocket Port**: 8083

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the Next.js app:
```bash
npm run build
```

## Running the Application

### Development Mode

Start both the Kafka WebSocket server and Next.js dev server:

```bash
# Terminal 1: Start Kafka WebSocket server
node kafka-ws-server.js

# Terminal 2: Start Next.js dev server
npm run dev
```

The dashboard will be available at `http://localhost:3000` (or your configured port).

### Production Mode with PM2

Start both services with PM2:

```bash
pm2 start ecosystem.config.js
```

Monitor the services:

```bash
pm2 logs
pm2 status
```

Stop the services:

```bash
pm2 stop all
```

## Project Structure

```
bsc-swaps-dashboard/
├── app/
│   ├── events/
│   │   └── page.tsx          # Main events page
│   ├── hooks/
│   │   └── useKafkaConsumer.tsx  # Kafka WebSocket hook
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page (redirects to events)
│   └── globals.css            # Global styles
├── kafka-ws-server.js         # Kafka-to-WebSocket bridge
├── package.json
├── ecosystem.config.js        # PM2 configuration
└── README.md
```

## Protobuf Schema

The BSC swap events use the following protobuf schema:

```protobuf
syntax = "proto3";
package bsc_dex;

message TradeEvent {
  string platform = 2;
  string price_native = 3;
  double bnb_amount = 4;
  int64 timestamp = 5;
  double token_amount = 6;
  string transaction_id = 7;
  TradeType trade_type = 8;
  string wallet_address = 9;
  uint64 processing_time_us = 10;
  uint64 block_number = 11;
  string price_usd = 12;
  string base_mint = 13;
  string base_mint_symbol = 14;
  string base_mint_name = 15;
  string quote_mint = 16;
  string quote_mint_symbol = 17;
  string quote_mint_name = 18;
  double total_network_fee = 19;
  PnlMetrics pnl_mint_7d = 20;
  double current_bnb_balance = 21;
  double current_token_balance = 22;
  string pool_address = 23;
  optional double current_supply = 24;
}

enum TradeType {
  TRADE_TYPE_UNSPECIFIED = 0;
  TRADE_TYPE_BUY = 1;
  TRADE_TYPE_SELL = 2;
}
```

## Configuration

### Changing the Kafka Broker

Edit `kafka-ws-server.js` and update the broker address:

```javascript
const kafka = new Kafka({
  clientId: 'bsc-swaps-ws-consumer',
  brokers: ['YOUR_BROKER:9092'],
  // ...
})
```

### Changing the WebSocket Port

Edit `kafka-ws-server.js` and update the port:

```javascript
const wss = new WebSocket.Server({ 
  port: 8083,  // Change this port
  // ...
})
```

Also update `app/hooks/useKafkaConsumer.tsx` to match:

```typescript
const ws = new WebSocket(`${protocol}//${host}:8083`)  // Update port here
```

### Changing the Next.js Port

For development:
```bash
npm run dev -- -p 3001
```

For production with PM2, edit `ecosystem.config.js`:
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001  // Change this port
}
```

## Troubleshooting

### WebSocket Connection Issues

1. Ensure the Kafka WebSocket server is running
2. Check that port 8083 is not blocked by firewall
3. Verify the Kafka broker is accessible

### No Events Showing

1. Check Kafka consumer connection in server logs
2. Verify the topic name is correct ('bsc-swaps')
3. Ensure the protobuf schema matches the incoming data

### Build Errors

If you encounter build errors, try:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## License

Private/Proprietary
