'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// TypeScript interfaces based on Ethereum swaps protobuf schema
export interface PnlMetrics {
  unrealizedPnlUsd: number
  unrealizedPnlPct: number
  realizedPnlUsd: number
  realizedPnlPct: number
}

export interface EthTradeEvent {
  platform: string
  priceNative: string
  ethAmount: number
  timestamp: string
  tokenAmount: number
  transactionId: string
  tradeType: number  // 0=UNSPECIFIED, 1=BUY, 2=SELL
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
  pnlMint7d?: PnlMetrics
  currentEthBalance: number
  currentTokenBalance: number
  poolAddress: string
  currentSupply?: number
  receivedAt?: number  // Client-side timestamp when event was received
}

export const useEthKafkaConsumer = () => {
  const [events, setEvents] = useState<EthTradeEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<WebSocket | null>(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    buyEvents: 0,
    sellEvents: 0,
    totalVolume: 0,
    avgProcessingTime: 0
  })

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
  }, [])

  const connect = useCallback(() => {
    disconnect()
    setError(null)
    
    // Connect to our WebSocket server - use port 8084 for Ethereum swaps
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const ws = new WebSocket(`${protocol}//${host}:8084`)
    eventSourceRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
      console.log('✅ Connected to Ethereum swaps stream')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Skip connection messages
        if (data.type === 'connected') {
          console.log('Connection confirmed:', data.message)
          return
        }
        
        const tradeEvent: EthTradeEvent = {
          ...data,
          receivedAt: Date.now()  // Add client-side timestamp
        }
        
        setEvents(prev => {
          // Check if this event already exists to prevent duplicates
          const exists = prev.some(e => e.transactionId === tradeEvent.transactionId)
          if (exists) return prev
          
          // Add new event
          return [tradeEvent, ...prev]
        })

        // Update stats
        setStats(prev => {
          const processingTime = typeof tradeEvent.processingTimeUs === 'string'
            ? parseInt(tradeEvent.processingTimeUs)
            : tradeEvent.processingTimeUs
          
          return {
            totalEvents: prev.totalEvents + 1,
            buyEvents: prev.buyEvents + (tradeEvent.tradeType === 1 ? 1 : 0),
            sellEvents: prev.sellEvents + (tradeEvent.tradeType === 2 ? 1 : 0),
            totalVolume: prev.totalVolume + (parseFloat(tradeEvent.priceUsd || '0') * tradeEvent.tokenAmount),
            avgProcessingTime: (prev.avgProcessingTime + processingTime) / 2
          }
        })
      } catch (err) {
        console.error('Failed to parse trade event:', err)
      }
    }

    ws.onerror = () => {
      setError('Connection lost to Ethereum swaps stream')
      setIsConnected(false)
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      console.log('❌ Disconnected from Ethereum swaps stream')
    }
  }, [disconnect])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  const clearEvents = useCallback(() => {
    setEvents([])
    setStats({
      totalEvents: 0,
      buyEvents: 0,
      sellEvents: 0,
      totalVolume: 0,
      avgProcessingTime: 0
    })
  }, [])

  return {
    events,
    isConnected,
    error,
    stats,
    connect,
    disconnect,
    clearEvents
  }
}

