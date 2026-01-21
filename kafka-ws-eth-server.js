const WebSocket = require('ws')
const { Kafka, CompressionTypes, CompressionCodecs } = require('kafkajs')
const protobuf = require('protobufjs')
const lz4 = require('lz4js')

// Custom LZ4 codec for KafkaJS
const LZ4Codec = () => ({
  async compress(buffer) {
    return Buffer.from(lz4.compress(Buffer.from(buffer)))
  },
  async decompress(buffer) {
    return Buffer.from(lz4.decompress(Buffer.from(buffer)))
  }
})

// Register LZ4 compression codec
CompressionCodecs[CompressionTypes.LZ4] = LZ4Codec

const kafka = new Kafka({
  clientId: 'ethereum-swaps-ws-consumer',
  brokers: ['35.231.146.165:9092'],
  retry: {
    initialRetryTime: 1000,
    retries: 5
  }
})

const consumer = kafka.consumer({ 
  groupId: 'ethereum-ws-group',
  sessionTimeout: 6000,
  heartbeatInterval: 2000
})

// Initialize protobuf schema for Ethereum swaps
const protoSchema = `
  syntax = "proto3";
  package eth_dex;
  
  message TradeEvent {
    string platform = 2;
    string price_native = 3;
    double eth_amount = 4;
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
    double current_eth_balance = 21;
    double current_token_balance = 22;
    string pool_address = 23;
    double current_supply = 24;
  }
  
  message PnlMetrics {
    double unrealized_pnl_usd = 1;
    double unrealized_pnl_pct = 2;
    double realized_pnl_usd = 3;
    double realized_pnl_pct = 4;
  }
  
  enum TradeType {
    TRADE_TYPE_UNSPECIFIED = 0;
    TRADE_TYPE_BUY = 1;
    TRADE_TYPE_SELL = 2;
  }
`

let TradeEvent
let clients = new Set()

async function initProtobuf() {
  const root = protobuf.parse(protoSchema).root
  TradeEvent = root.lookupType('eth_dex.TradeEvent')
  console.log('✅ Protobuf schema initialized for Ethereum swaps')
}

async function startKafkaConsumer() {
  try {
    console.log('🔌 Connecting to Kafka...')
    await consumer.connect()
    console.log('✅ Kafka connected')
    
    await consumer.subscribe({ 
      topic: 'ethereum-swaps',
      fromBeginning: false 
    })
    console.log('✅ Subscribed to ethereum-swaps')
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return
        
        try {
          const decoded = TradeEvent.decode(message.value)
          const jsonObj = TradeEvent.toObject(decoded, {
            longs: String,
            enums: Number,
            bytes: String,
            defaults: true,
            arrays: true,
            objects: true
          })
          
          // Convert snake_case to camelCase for frontend
          const camelCaseObj = {
            platform: jsonObj.platform,
            priceNative: jsonObj.priceNative || jsonObj.price_native,
            ethAmount: jsonObj.ethAmount || jsonObj.eth_amount,
            timestamp: jsonObj.timestamp,
            tokenAmount: jsonObj.tokenAmount || jsonObj.token_amount,
            transactionId: jsonObj.transactionId || jsonObj.transaction_id,
            tradeType: jsonObj.tradeType || jsonObj.trade_type,
            walletAddress: jsonObj.walletAddress || jsonObj.wallet_address,
            processingTimeUs: jsonObj.processingTimeUs || jsonObj.processing_time_us,
            blockNumber: jsonObj.blockNumber || jsonObj.block_number,
            priceUsd: jsonObj.priceUsd || jsonObj.price_usd,
            baseMint: jsonObj.baseMint || jsonObj.base_mint,
            baseMintSymbol: jsonObj.baseMintSymbol || jsonObj.base_mint_symbol,
            baseMintName: jsonObj.baseMintName || jsonObj.base_mint_name,
            quoteMint: jsonObj.quoteMint || jsonObj.quote_mint,
            quoteMintSymbol: jsonObj.quoteMintSymbol || jsonObj.quote_mint_symbol,
            quoteMintName: jsonObj.quoteMintName || jsonObj.quote_mint_name,
            totalNetworkFee: jsonObj.totalNetworkFee || jsonObj.total_network_fee,
            pnlMint7d: jsonObj.pnlMint7d || (jsonObj.pnlMint_7d && (
              jsonObj.pnlMint_7d.unrealizedPnlUsd !== 0 || 
              jsonObj.pnlMint_7d.unrealizedPnlPct !== 0 ||
              jsonObj.pnlMint_7d.realizedPnlUsd !== 0 ||
              jsonObj.pnlMint_7d.realizedPnlPct !== 0
            ) ? {
              unrealizedPnlUsd: jsonObj.pnlMint_7d.unrealizedPnlUsd || 0,
              unrealizedPnlPct: jsonObj.pnlMint_7d.unrealizedPnlPct || 0,
              realizedPnlUsd: jsonObj.pnlMint_7d.realizedPnlUsd || 0,
              realizedPnlPct: jsonObj.pnlMint_7d.realizedPnlPct || 0
            } : null),
            currentEthBalance: jsonObj.currentEthBalance || jsonObj.current_eth_balance,
            currentTokenBalance: jsonObj.currentTokenBalance || jsonObj.current_token_balance,
            poolAddress: jsonObj.poolAddress || jsonObj.pool_address,
            currentSupply: jsonObj.currentSupply || jsonObj.current_supply
          }
          
          // Broadcast to clients
          const data = JSON.stringify(camelCaseObj)
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(data)
            }
          })
          
        } catch (error) {
          console.error('❌ Decode error:', error)
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Kafka error:', error)
    setTimeout(startKafkaConsumer, 5000) // Retry after 5 seconds
  }
}

// Create WebSocket server on port 8084 for Ethereum
const wss = new WebSocket.Server({ 
  port: 8084,
  perMessageDeflate: false
})

wss.on('connection', (ws) => {
  console.log('👋 Client connected to Ethereum stream')
  clients.add(ws)
  
  // Send connection confirmation
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connected to Ethereum swaps stream' }))
  
  ws.on('close', () => {
    console.log('👋 Client disconnected from Ethereum stream')
    clients.delete(ws)
  })
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error)
    clients.delete(ws)
  })
})

console.log('🚀 WebSocket server started on port 8084 for Ethereum swaps')

// Initialize and start
async function start() {
  await initProtobuf()
  await startKafkaConsumer()
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...')
  await consumer.disconnect()
  wss.close()
  process.exit(0)
})

start().catch(console.error)

