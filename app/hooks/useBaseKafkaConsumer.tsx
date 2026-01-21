import { useState, useEffect, useCallback, useRef } from 'react'

export interface TradeEvent {
  platform: string
  priceNative: string
  ethAmount: number
  timestamp: string
  tokenAmount: number
  transactionId: string
  tradeType: number
  walletAddress: string
  processingTimeUs: string
  blockNumber: string
  priceUsd: string
  baseMint: string
  baseMintSymbol: string
  baseMintName: string
  quoteMint: string
  quoteMintSymbol: string
  quoteMintName: string
  totalNetworkFee: number
  pnlMint7d?: {
    unrealizedPnlUsd: number
    unrealizedPnlPct: number
    realizedPnlUsd: number
    realizedPnlPct: number
  } | null
  currentEthBalance: number
  currentTokenBalance: number
  poolAddress: string
  currentSupply?: number
  receivedAt?: number
}

export const useBaseKafkaConsumer = () => {
  const [events, setEvents] = useState<TradeEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    try {
      // Use window.location.hostname to connect to the same server
      const wsUrl = `ws://${window.location.hostname}:8085`
      console.log('Connecting to Base WebSocket:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ Connected to Base Kafka stream')
        setIsConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Skip connection confirmation messages
          if (data.type === 'connected') {
            console.log('Base stream:', data.message)
            return
          }

          // Add received timestamp for accurate age calculation
          const eventWithTimestamp = {
            ...data,
            receivedAt: Date.now()
          }
          
          setEvents(prev => [eventWithTimestamp, ...prev].slice(0, 1000))
        } catch (err) {
          console.error('Error parsing Base message:', err)
        }
      }

      ws.onerror = () => {
        // Suppress error logging - onclose will handle reconnection
        // WebSocket errors are usually followed by onclose anyway
      }

      ws.onclose = (event) => {
        console.log('❌ Disconnected from Base Kafka stream')
        setIsConnected(false)
        
        // Only set error if it's not a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          setError('Connection lost - attempting to reconnect...')
        }
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect to Base...')
          connect()
        }, 5000)
      }
    } catch (err) {
      console.error('Failed to create Base WebSocket:', err)
      setError('Failed to connect to Base stream')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
    clearEvents
  }
}


