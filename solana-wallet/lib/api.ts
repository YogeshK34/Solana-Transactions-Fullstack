const API_BASE_URL = 'http://localhost:8080/api'

export interface WalletInfo {
  sender_address: string
  recipient_address: string
  network: string
}

export interface BalanceResponse {
  sender_balance: number
  recipient_balance: number
  sender_balance_lamports: number
  recipient_balance_lamports: number
}

export interface SendTransactionRequest {
  amount: number
}

export interface SendTransactionResponse {
  success: boolean
  transaction_signature?: string
  pre_balance_sender: number
  post_balance_sender: number
  pre_balance_recipient: number
  post_balance_recipient: number
  amount_transferred: number
  error?: string
}

export interface TransactionInfo {
  signature: string
  type: 'sent' | 'received' | 'unknown'
  amount: number
  status: string
  timestamp: string
  recipient?: string
  sender?: string
  blockTime?: number | null
  slot: number
  fee?: number
}

export interface TransactionHistoryResponse {
  transactions: TransactionInfo[]
}

export interface HealthResponse {
  status: string
  timestamp: string
  network: string
}

export interface ErrorResponse {
  error: string
  message?: string
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ErrorResponse
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health')
  }

  async getWalletInfo(): Promise<WalletInfo> {
    return this.request<WalletInfo>('/wallet/info')
  }

  async getBalance(): Promise<BalanceResponse> {
    return this.request<BalanceResponse>('/wallet/balance')
  }

  async sendTransaction(amount: number): Promise<SendTransactionResponse> {
    return this.request<SendTransactionResponse>('/transaction/send', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async getTransactionHistory(): Promise<TransactionHistoryResponse> {
    return this.request<TransactionHistoryResponse>('/transaction/history')
  }
}

export const apiClient = new ApiClient()
