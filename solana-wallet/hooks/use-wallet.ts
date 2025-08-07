import { useState, useEffect, useCallback } from 'react'
import { apiClient, WalletInfo, BalanceResponse, TransactionInfo } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

export function useWallet() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [balance, setBalance] = useState<BalanceResponse | null>(null)
  const [transactions, setTransactions] = useState<TransactionInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(false)

  // Helper function to handle errors properly
  const handleError = (error: unknown, defaultMessage: string): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return defaultMessage
  }

  // Check backend health and initialize wallet
  const initializeWallet = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check if backend is healthy
      await apiClient.healthCheck()
      setIsBackendConnected(true)
      
      // Get wallet info
      const info = await apiClient.getWalletInfo()
      setWalletInfo(info)
      
      // Get initial balance and transactions
      await Promise.all([
        fetchBalance(),
        fetchTransactions()
      ])
      
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      setIsBackendConnected(false)
      toast({
        title: "Backend Connection Failed",
        description: "Make sure your Rust backend is running on localhost:8080",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!isBackendConnected) return
    
    try {
      setIsBalanceLoading(true)
      const balanceData = await apiClient.getBalance()
      setBalance(balanceData)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      toast({
        title: "Error",
        description: handleError(error, "Failed to fetch wallet balance"),
        variant: "destructive"
      })
    } finally {
      setIsBalanceLoading(false)
    }
  }, [isBackendConnected])

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!isBackendConnected) return
    
    try {
      setIsTransactionsLoading(true)
      const historyData = await apiClient.getTransactionHistory()
      setTransactions(historyData.transactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      toast({
        title: "Error",
        description: handleError(error, "Failed to fetch transaction history"),
        variant: "destructive"
      })
    } finally {
      setIsTransactionsLoading(false)
    }
  }, [isBackendConnected])

  // Send transaction
  const sendTransaction = useCallback(async (amount: number) => {
    if (!isBackendConnected) {
      throw new Error('Backend not connected')
    }

    try {
      const result = await apiClient.sendTransaction(amount)
      
      if (result.success) {
        toast({
          title: "Transaction Successful",
          description: `Sent ${result.amount_transferred} SOL successfully!`,
        })
        
        // Refresh balance and transactions after successful transaction
        setTimeout(() => {
          fetchBalance()
          fetchTransactions()
        }, 2000) // Wait 2 seconds for blockchain confirmation
        
        return result
      } else {
        throw new Error(result.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      const errorMessage = handleError(error, "Failed to send transaction")
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      })
      throw error
    }
  }, [isBackendConnected, fetchBalance, fetchTransactions])

  // Initialize on mount
  useEffect(() => {
    initializeWallet()
  }, [initializeWallet])

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!isBackendConnected) return

    const interval = setInterval(() => {
      fetchBalance()
    }, 30000)

    return () => clearInterval(interval)
  }, [isBackendConnected, fetchBalance])

  return {
    walletInfo,
    balance,
    transactions,
    isLoading,
    isBalanceLoading,
    isTransactionsLoading,
    isBackendConnected,
    fetchBalance,
    fetchTransactions,
    sendTransaction,
    refreshAll: () => {
      fetchBalance()
      fetchTransactions()
    }
  }
}
