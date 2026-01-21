'use client'

import React, { useState } from 'react'
import { useEthKafkaConsumer } from '../hooks/useEthKafkaConsumer'
import FeedHeader from '../components/FeedHeader'

const EthereumPage: React.FC = () => {
  const { events, isConnected, error, connect, disconnect, clearEvents } = useEthKafkaConsumer()
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [platformFilter, setPlatformFilter] = useState<'all' | string>('all')
  const [mintFilter, setMintFilter] = useState<string>('')
  const [copiedMints, setCopiedMints] = useState<Set<string>>(new Set())
  const [copiedWallets, setCopiedWallets] = useState<Set<string>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Helper function to format values, showing "null" for missing data
  const formatValue = (value: any, type: 'number' | 'string' = 'string'): string => {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 'null'
    }
    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString()
    }
    return String(value)
  }

  const handleCopyAny = async (text: string, id: string, setState: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setState(prev => new Set(prev).add(id))
      setTimeout(() => {
        setState(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 1000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredEvents = events.filter(event => {
    const typeMatch = filter === 'all' || 
      (filter === 'buy' && event.tradeType === 1) ||
      (filter === 'sell' && event.tradeType === 2)
    
    const platformMatch = platformFilter === 'all' || event.platform === platformFilter
    
    const mintMatch = !mintFilter || event.baseMint.toLowerCase().includes(mintFilter.toLowerCase())
    
    return typeMatch && platformMatch && mintMatch
  })

  const handleCopyMint = async (mintAddress: string) => {
    try {
      // Try modern clipboard API first (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(mintAddress)
      } else {
        // Fallback for HTTP environments
        const textArea = document.createElement('textarea')
        textArea.value = mintAddress
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopiedMints(prev => new Set(prev).add(mintAddress))
      console.log('Copied contract address:', mintAddress)
      
      // Remove the mint from copied set after 1 second
      setTimeout(() => {
        setCopiedMints(prev => {
          const newSet = new Set(prev)
          newSet.delete(mintAddress)
          return newSet
        })
      }, 1000)
    } catch (err) {
      console.error('Failed to copy contract address:', err)
    }
  }

  const handleCopyWallet = async (walletAddress: string, walletId: string) => {
    try {
      // Try modern clipboard API first (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(walletAddress)
      } else {
        // Fallback for HTTP environments
        const textArea = document.createElement('textarea')
        textArea.value = walletAddress
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopiedWallets(prev => new Set(prev).add(walletId))
      console.log('Copied wallet address:', walletAddress)
      
      // Remove the wallet from copied set after 1 second
      setTimeout(() => {
        setCopiedWallets(prev => {
          const newSet = new Set(prev)
          newSet.delete(walletId)
          return newSet
        })
      }, 1000)
    } catch (err) {
      console.error('Failed to copy wallet address:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-none mx-auto px-12 py-6">
        {/* Header */}
        <FeedHeader 
          isConnected={isConnected}
          error={error}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {/* Centered Filters */}
        <div className="mb-8">
          {/* Big Mint Search Bar */}
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  id="mintFilter"
                  type="text"
                  value={mintFilter}
                  onChange={(e) => setMintFilter(e.target.value)}
                  placeholder="Paste token contract address to filter events..."
                  className="w-full px-6 py-2 bg-gray-950 border border-gray-800 rounded-xs text-gray-400 placeholder-gray-600 focus:outline-none focus:border-gray-600 text-md"
                />
                {mintFilter && (
                  <button
                    onClick={() => setMintFilter('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    title="Clear filter"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
            </div>
          </div>

          {/* Compact Platform Filters */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1 rounded-xs text-xs transition-colors ${
                  platformFilter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All DEXs
              </button>
              <div className="w-px h-4 bg-gray-600 mx-2"></div>
              <button
                onClick={clearEvents}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-xs text-xs hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xs p-4 mb-6">
            <div className="text-red-400 font-medium">Connection Error</div>
            <div className="text-red-300 text-sm">{error}</div>
            <button
              onClick={connect}
              className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500 rounded text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-gray-950 rounded-xs overflow-hidden">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    filter === 'all' 
                      ? 'border-white text-white' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('buy')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    filter === 'buy' 
                      ? 'border-green-400 text-green-400' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Buys
                </button>
                <button
                  onClick={() => setFilter('sell')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    filter === 'sell' 
                      ? 'border-red-400 text-red-400' 
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Sells
                </button>
              </div>
              
              
            </div>
          </div>

          {/* Table Header */}
          <div className="border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
            <div className="grid grid-cols-[50px_60px_180px_120px_100px_100px_90px_100px_100px_80px_140px_90px] gap-4 px-6 py-3 text-xs font-semibold text-gray-400 min-w-max">
              <div>AGE</div>
              <div>TYPE</div>
              <div>TOKEN</div>
              <div>DEX</div>
              <div className="text-right">PRICE USD</div>
              <div className="text-right">PRICE ETH</div>
              <div className="text-right">AMOUNT</div>
              <div className="text-right">ETH AMOUNT</div>
              <div className="text-right">TOTAL USD</div>
              <div className="text-right">GAS</div>
              <div>TRADER</div>
              <div className="text-right">PNL 7D</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-lg mb-2">
                {isConnected ? 'No events yet' : 'Not connected'}
              </div>
                <div className="text-gray-500 text-sm mb-6">
                {isConnected 
                  ? 'Waiting for Ethereum swap events...' 
                  : 'Click connect to start receiving events'
                }
              </div>
            </div>
          ) : (
              filteredEvents.map((event, index) => {
                const age = Math.floor((Date.now() - (event.receivedAt || Date.now())) / 1000 / 60)
                const isBuy = event.tradeType === 1
                const ETH_PRICE_USD_APPROX = 3400
                const priceUsdStr = event.priceUsd && parseFloat(event.priceUsd) > 0 ? event.priceUsd : null
                const priceNative = parseFloat(event.priceNative || '0')
                const priceUsdCalculated = priceUsdStr ? parseFloat(priceUsdStr) : (priceNative > 0 ? priceNative * ETH_PRICE_USD_APPROX : 0)
                const totalUSD = event.ethAmount * ETH_PRICE_USD_APPROX
                
                const formatNumber = (num: number) => {
                  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
                  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
                  return num.toFixed(2)
                }
                
                const hasPnl = event.pnlMint7d && (
                  event.pnlMint7d.realizedPnlUsd !== 0 || 
                  event.pnlMint7d.unrealizedPnlUsd !== 0
                )
                
                const eventId = `${event.transactionId}-${event.baseMint}`
                const isExpanded = expandedRows.has(eventId)
                
                return (
                  <div key={eventId} className="border-b border-gray-800/50">
                  <div 
                    onClick={() => {
                      const newExpanded = new Set(expandedRows)
                      if (isExpanded) {
                        newExpanded.delete(eventId)
                      } else {
                        newExpanded.add(eventId)
                      }
                      setExpandedRows(newExpanded)
                    }}
                    className="grid grid-cols-[50px_60px_180px_120px_100px_100px_90px_100px_100px_80px_140px_90px] gap-4 px-6 py-3 hover:bg-gray-900/30 transition-colors text-xs min-w-max cursor-pointer"
                  >
                    {/* Age */}
                    <div className="text-gray-400">
                      {age}m
                    </div>

                    {/* Type */}
                    <div className={`font-medium ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                      {isBuy ? 'Buy' : 'Sell'}
                    </div>

                    {/* Token - Full Info */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate ${event.baseMintSymbol ? 'text-blue-400' : 'text-gray-600'}`}>
                          {event.baseMintSymbol || 'null'}
                        </div>
                        <div className="text-gray-600 text-[10px] truncate">
                          {event.baseMintName || 'null'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyMint(event.baseMint)
                        }}
                        className={`flex-shrink-0 transition-colors ${
                          copiedMints.has(event.baseMint) ? 'text-green-400' : 'text-gray-500 hover:text-green-400'
                        }`}
                        title="Copy contract"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedMints.has(event.baseMint) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                        </svg>
                      </button>
                    </div>

                    {/* DEX Platform */}
                    <div className="text-purple-400 text-[10px] uppercase font-medium truncate">
                      {event.platform ? event.platform.replace(/-/g, ' ') : 'null'}
                    </div>

                    {/* Price USD */}
                    <div className={`font-semibold text-right whitespace-nowrap ${priceUsdCalculated > 0 ? (isBuy ? 'text-green-400' : 'text-red-400') : 'text-gray-600'}`}>
                      {priceUsdCalculated > 0 ? `$${priceUsdCalculated.toFixed(6)}` : 'null'}
                    </div>

                    {/* Price ETH */}
                    <div className={`text-right whitespace-nowrap ${priceNative > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                      {priceNative > 0 ? priceNative.toFixed(8) : 'null'}
                    </div>

                    {/* Token Amount */}
                    <div className="text-white text-right font-medium">
                      {event.tokenAmount > 0 ? formatNumber(event.tokenAmount) : 'null'}
                    </div>

                    {/* ETH Amount */}
                    <div className="text-blue-400 text-right whitespace-nowrap font-medium">
                      {event.ethAmount > 0 ? event.ethAmount.toFixed(4) : 'null'}
                    </div>

                    {/* Total USD */}
                    <div className={`font-bold text-right whitespace-nowrap ${totalUSD > 0 ? (isBuy ? 'text-green-400' : 'text-red-400') : 'text-gray-600'}`}>
                      {totalUSD > 0 ? `$${totalUSD < 1 ? totalUSD.toFixed(3) : formatNumber(totalUSD)}` : 'null'}
                    </div>

                    {/* Gas Fee */}
                    <div className="text-gray-400 text-right whitespace-nowrap text-[10px]">
                      {event.totalNetworkFee > 0 ? event.totalNetworkFee.toFixed(6) : 'null'}
                    </div>

                    {/* Trader - Detailed */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`https://etherscan.io/address/${event.walletAddress}`, '_blank')
                          }}
                          className="text-gray-300 hover:text-blue-400 transition-colors font-mono text-[11px]"
                        >
                          {event.walletAddress.slice(0, 6)}...{event.walletAddress.slice(-4)}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyWallet(event.walletAddress, `wallet-${event.walletAddress}-${event.timestamp}`)
                          }}
                          className={`transition-colors ${
                            copiedWallets.has(`wallet-${event.walletAddress}-${event.timestamp}`) ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                          }`}
                          title="Copy wallet"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedWallets.has(`wallet-${event.walletAddress}-${event.timestamp}`) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`https://etherscan.io/tx/${event.transactionId}`, '_blank')
                          }}
                          className="text-gray-500 hover:text-gray-300"
                          title="View tx"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5">
                        {event.currentEthBalance > 0 ? `${event.currentEthBalance.toFixed(2)} ETH` : 'null'}
                      </div>
                    </div>

                    {/* PnL 7d */}
                    <div className="text-right">
                      {hasPnl ? (
                        <div className="text-[10px]">
                          <div className={`font-semibold ${event.pnlMint7d!.realizedPnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${event.pnlMint7d!.realizedPnlUsd.toFixed(0)}
                          </div>
                          <div className="text-gray-500">
                            {event.pnlMint7d!.realizedPnlPct >= 0 ? '+' : ''}{event.pnlMint7d!.realizedPnlPct.toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-600 text-[10px]">null</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-gray-900/50 text-xs">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Column 1: Token Details */}
                        <div className="space-y-2.5">
                          <div className="text-gray-400 font-semibold mb-3 text-sm">📝 Token Details</div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Base Contract:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-mono text-[11px]">{event.baseMint.slice(0, 8)}...{event.baseMint.slice(-6)}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyMint(event.baseMint)
                                }}
                                className={`transition-colors ${copiedMints.has(event.baseMint) ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                                title="Copy"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedMints.has(event.baseMint) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quote Token:</span>
                            <span className={`font-medium ${event.quoteMintSymbol ? 'text-gray-300' : 'text-gray-600'}`}>
                              {event.quoteMintSymbol || 'null'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Quote Name:</span>
                            <span className={event.quoteMintName ? 'text-gray-300' : 'text-gray-600'}>
                              {event.quoteMintName || 'null'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Quote Contract:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 font-mono text-[11px]">{event.quoteMint ? `${event.quoteMint.slice(0, 6)}...${event.quoteMint.slice(-4)}` : 'null'}</span>
                              {event.quoteMint && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyAny(event.quoteMint, `quote-${event.quoteMint}`, setCopiedMints)
                                  }}
                                  className={`transition-colors ${copiedMints.has(`quote-${event.quoteMint}`) ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                                  title="Copy"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedMints.has(`quote-${event.quoteMint}`) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Supply:</span>
                            <span className={`font-medium ${event.currentSupply ? 'text-gray-300' : 'text-gray-600'}`}>
                              {event.currentSupply ? formatNumber(event.currentSupply) : 'null'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Token Balance:</span>
                            <span className={`font-medium ${event.currentTokenBalance ? 'text-gray-300' : 'text-gray-600'}`}>
                              {event.currentTokenBalance ? formatNumber(event.currentTokenBalance) : 'null'}
                            </span>
                          </div>
                        </div>

                        {/* Column 2: Transaction Details */}
                        <div className="space-y-2.5">
                          <div className="text-gray-400 font-semibold mb-3 text-sm">⛓️ Transaction Details</div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Block Number:</span>
                            <span className={`font-mono ${event.blockNumber ? 'text-gray-300' : 'text-gray-600'}`}>
                              {event.blockNumber || 'null'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Processing Time:</span>
                            <span className={event.processingTimeUs ? 'text-gray-300' : 'text-gray-600'}>
                              {event.processingTimeUs ? `${event.processingTimeUs}μs` : 'null'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Transaction Hash:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(`https://etherscan.io/tx/${event.transactionId}`, '_blank')
                                }}
                                className="text-blue-400 hover:text-blue-300 font-mono text-[11px]"
                              >
                                {event.transactionId.slice(0, 8)}...{event.transactionId.slice(-6)}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyAny(event.transactionId, `tx-${event.transactionId}`, setCopiedWallets)
                                }}
                                className={`transition-colors ${copiedWallets.has(`tx-${event.transactionId}`) ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                                title="Copy"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedWallets.has(`tx-${event.transactionId}`) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Pool Address:</span>
                            {event.poolAddress ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(`https://etherscan.io/address/${event.poolAddress}`, '_blank')
                                  }}
                                  className="text-blue-400 hover:text-blue-300 font-mono text-[11px]"
                                >
                                  {event.poolAddress.slice(0, 6)}...{event.poolAddress.slice(-4)}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyAny(event.poolAddress, `pool-${event.poolAddress}`, setCopiedWallets)
                                  }}
                                  className={`transition-colors ${copiedWallets.has(`pool-${event.poolAddress}`) ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                                  title="Copy"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedWallets.has(`pool-${event.poolAddress}`) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-600">null</span>
                            )}
                          </div>
                        </div>

                        {/* Column 3: Wallet & PnL */}
                        <div className="space-y-2.5">
                          <div className="text-gray-400 font-semibold mb-3 text-sm">💰 Wallet & Performance</div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Wallet Address:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(`https://etherscan.io/address/${event.walletAddress}`, '_blank')
                                }}
                                className="text-gray-300 hover:text-blue-400 font-mono text-[11px]"
                              >
                                {event.walletAddress.slice(0, 8)}...{event.walletAddress.slice(-6)}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyWallet(event.walletAddress, `detail-${event.walletAddress}`)
                                }}
                                className={`transition-colors ${copiedWallets.has(`detail-${event.walletAddress}`) ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                                title="Copy"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={copiedWallets.has(`detail-${event.walletAddress}`) ? "M5 13l4 4L19 7" : "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"} />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">ETH Balance:</span>
                            <span className="text-blue-400 font-semibold">{event.currentEthBalance > 0 ? `${event.currentEthBalance.toFixed(4)} ETH` : 'null'}</span>
                          </div>
                          {event.pnlMint7d && hasPnl && (
                            <>
                              <div className="border-t border-gray-800 pt-2 mt-2"></div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Realized PnL:</span>
                                <span className={`font-semibold ${event.pnlMint7d.realizedPnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${event.pnlMint7d.realizedPnlUsd.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Realized PnL %:</span>
                                <span className={`font-semibold ${event.pnlMint7d.realizedPnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {event.pnlMint7d.realizedPnlPct >= 0 ? '+' : ''}{event.pnlMint7d.realizedPnlPct.toFixed(2)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Unrealized PnL:</span>
                                <span className={`font-medium ${event.pnlMint7d.unrealizedPnlUsd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${event.pnlMint7d.unrealizedPnlUsd.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Unrealized PnL %:</span>
                                <span className={`font-medium ${event.pnlMint7d.unrealizedPnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {event.pnlMint7d.unrealizedPnlPct >= 0 ? '+' : ''}{event.pnlMint7d.unrealizedPnlPct.toFixed(2)}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                )
              })
            )}
          </div>

          {/* Table Footer with Live Indicator */}
          {filteredEvents.length > 0 && (
            <div className="border-t border-gray-800 bg-gray-900/50 px-6 py-3">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="text-xs">Showing {filteredEvents.length} events</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EthereumPage

