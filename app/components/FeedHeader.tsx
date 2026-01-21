'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface FeedHeaderProps {
  isConnected: boolean
  error: string | null
  onConnect: () => void
  onDisconnect: () => void
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ isConnected, error, onConnect, onDisconnect }) => {
  const pathname = usePathname()
  
  const getConnectionStatus = () => {
    if (isConnected) {
      return (
        <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-xs">
          <div className="w-2 h-2 bg-green-400 rounded-xs animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">Connected</span>
        </div>
      )
    } else if (error) {
      return (
        <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-xs">
          <div className="w-2 h-2 bg-red-400 rounded-xs"></div>
          <span className="text-xs text-red-400 font-medium">Error</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-xs">
          <div className="w-2 h-2 bg-yellow-400 rounded-xs animate-pulse"></div>
          <span className="text-xs text-yellow-400 font-medium">Connecting</span>
        </div>
      )
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
       
        <div className="flex items-center gap-2">
          <Link 
            href="/binance"
            className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
              pathname === '/binance' 
                ? ' text-white' 
                : ' text-gray-500 hover:text-gray-300'
            }`}
          >
            Binance feed
          </Link>
          <Link 
            href="/ethereum"
            className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
              pathname === '/ethereum' 
                ? 'text-white' 
                : ' text-gray-500 hover:text-gray-300'
            }`}
          >
            Ethereum feed
          </Link>
          <Link 
            href="/base"
            className={`px-4 py-2 rounded-xs text-sm font-medium transition-colors ${
              pathname === '/base' 
                ? 'text-white' 
                : ' text-gray-500 hover:text-gray-300'
            }`}
          >
            Base feed
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {getConnectionStatus()}
        <button
          onClick={isConnected ? onDisconnect : onConnect}
          className={`p-2 rounded-xs transition-colors ${
            isConnected 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
          title={isConnected ? 'Pause live updates' : 'Start live updates'}
        >
          {isConnected ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default FeedHeader

