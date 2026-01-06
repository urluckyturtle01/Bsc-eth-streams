# BSC & Ethereum Live Trading Feeds Dashboard

Real-time cryptocurrency trading dashboard displaying live swap events from Binance Smart Chain (BSC) and Ethereum networks.

## 🚀 Features

- **Dual Network Support**: Monitor both BSC and Ethereum trading feeds simultaneously
- **Real-time Updates**: Live streaming via Kafka WebSocket connections
- **Advanced Filtering**: Filter by trade type (buy/sell), token contract, and DEX platform
- **Modern UI**: Built with Next.js 15 and TailwindCSS for a responsive, beautiful interface
- **Production Ready**: PM2 process management with auto-restart capabilities

## 📋 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Node.js, Kafka, WebSockets, Protobuf
- **Process Management**: PM2
- **Data Sources**: Kafka topics for BSC and Ethereum swap events

## 🏗️ Architecture

```
├── app/
│   ├── binance/          # BSC trading feed page
│   ├── ethereum/         # Ethereum trading feed page
│   ├── components/       # Shared React components
│   │   └── FeedHeader.tsx
│   └── hooks/            # Custom React hooks
│       ├── useKafkaConsumer.tsx
│       └── useEthKafkaConsumer.tsx
├── kafka-ws-server.js    # BSC Kafka WebSocket server (port 8083)
├── kafka-ws-eth-server.js # Ethereum Kafka WebSocket server (port 8084)
└── ecosystem.config.js   # PM2 configuration
```

## 🔧 Installation

### Prerequisites

- Node.js 20.x or higher
- PM2 (for production deployment)
- Access to Kafka broker at `35.231.146.165:9092`

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/urluckyturtle01/Bsc-eth-streams.git
   cd Bsc-eth-streams
   ```

2. **Install dependencies**
```bash
npm install
```

3. **Development mode**
```bash
npm run dev
```
   The application will be available at `http://localhost:6050`

4. **Production deployment with PM2**
```bash
pm2 start ecosystem.config.js
   pm2 save
   ```

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Next.js App | 6050 | Main web application |
| BSC WebSocket | 8083 | Binance Smart Chain events stream |
| Ethereum WebSocket | 8084 | Ethereum events stream |

## 🎯 Kafka Topics

- **BSC**: `bsc-swaps` - Binance Smart Chain swap events
- **Ethereum**: `ethereum-swaps` - Ethereum swap events

## 🔌 WebSocket Connections

Both Kafka servers use protobuf encoding for efficient data transmission:

### BSC Events Schema
```protobuf
message TradeEvent {
  string platform = 2;
  string price_native = 3;
  double bnb_amount = 4;
  int64 timestamp = 5;
  double token_amount = 6;
  string transaction_id = 7;
  TradeType trade_type = 8;
  string wallet_address = 9;
  // ... additional fields
}
```

### Ethereum Events Schema
```protobuf
message TradeEvent {
  string platform = 2;
  string price_native = 3;
  double eth_amount = 4;
  int64 timestamp = 5;
  double token_amount = 6;
  string transaction_id = 7;
  TradeType trade_type = 8;
  string wallet_address = 9;
  // ... additional fields
}
```

## 📱 Usage

### Switching Between Feeds

Use the header tabs to switch between BSC (Binance) and Ethereum feeds:
- **Binance feed**: `/binance`
- **Ethereum feed**: `/ethereum`

### Filtering Events

1. **Trade Type Filter**: Use "All", "Buys", or "Sells" tabs
2. **Token Search**: Paste a token contract address in the search bar
3. **DEX Filter**: Filter by specific decentralized exchanges
4. **Clear**: Reset all filters

### Event Information

Each event displays:
- Age (time since event)
- Trade type (Buy/Sell)
- Token symbol
- Price (in USD)
- Amount
- Total USD value
- Trader wallet address

## 🔧 PM2 Management

### View all processes
```bash
pm2 list
```

### View logs
```bash
pm2 logs next-app       # Next.js logs
pm2 logs kafka-bsc      # BSC Kafka server logs
pm2 logs kafka-eth      # Ethereum Kafka server logs
```

### Restart services
```bash
pm2 restart all
pm2 restart next-app
```

### Stop services
```bash
pm2 stop all
```

## 🌐 Environment Variables

The application uses the following environment variables:

```env
PORT=6050                    # Next.js application port
NODE_ENV=production          # Environment mode
```

## 🔐 Data Flow

1. **Kafka Broker** receives swap events from blockchain indexers
2. **WebSocket Servers** consume from Kafka topics and decode protobuf messages
3. **Frontend** connects via WebSocket and displays real-time updates
4. Events are stamped with `receivedAt` timestamp for accurate age display

## 📈 Performance

- Real-time updates with sub-second latency
- Client-side filtering for instant results
- Efficient protobuf encoding reduces bandwidth
- PM2 ensures high availability with auto-restart

## 🛠️ Development

### Project Structure

- `app/`: Next.js application pages and components
- `kafka-ws-server.js`: BSC Kafka consumer and WebSocket server
- `kafka-ws-eth-server.js`: Ethereum Kafka consumer and WebSocket server
- `ecosystem.config.js`: PM2 process configuration

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available for use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the crypto trading community
