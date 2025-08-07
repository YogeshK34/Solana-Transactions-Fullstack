import { Connection, PublicKey } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export async function POST(request: NextRequest) {
  try {
    const { publicKey } = await request.json()
    
    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 })
    }

    const pubKey = new PublicKey(publicKey)
    
    // Get recent transaction signatures
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 10 })
    
    // Get transaction details with proper error handling
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          })
          
          if (!tx || !tx.meta) return null
          
          // Handle both legacy and versioned transactions
          let fromPubkey = ''
          let toPubkey = ''
          
          // For versioned transactions, we need to handle differently
          if ('staticAccountKeys' in tx.transaction.message) {
            // Legacy transaction
            const accounts = tx.transaction.message.staticAccountKeys
            if (accounts.length >= 2) {
              fromPubkey = accounts[0].toString()
              toPubkey = accounts[1].toString()
            }
          } else {
            // Versioned transaction - get account keys from meta
            if (tx.meta.loadedAddresses && tx.meta.loadedAddresses.readonly.length > 0) {
              fromPubkey = tx.meta.loadedAddresses.readonly[0].toString()
              toPubkey = tx.meta.loadedAddresses.readonly[1]?.toString() || ''
            }
          }
          
          // Determine if it's sent or received
          const type = fromPubkey === publicKey ? 'sent' : 'received'
          
          // Calculate amount from balance changes
          let amount = 0
          if (tx.meta.preBalances && tx.meta.postBalances && tx.meta.preBalances.length > 0) {
            const balanceChange = tx.meta.preBalances[0] - tx.meta.postBalances[0]
            amount = Math.abs(balanceChange) / 1000000000 // Convert lamports to SOL
          }
          
          return {
            signature: sig.signature,
            type,
            amount,
            status: sig.confirmationStatus || 'confirmed',
            timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : 'Unknown',
            recipient: type === 'sent' ? toPubkey : undefined,
            sender: type === 'received' ? fromPubkey : undefined,
            blockTime: sig.blockTime,
            slot: sig.slot,
            fee: tx.meta.fee
          }
        } catch (error) {
          console.error('Error fetching transaction details:', error)
          // Return basic info even if detailed parsing fails
          return {
            signature: sig.signature,
            type: 'unknown' as const,
            amount: 0,
            status: sig.confirmationStatus || 'confirmed',
            timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : 'Unknown',
            blockTime: sig.blockTime,
            slot: sig.slot,
            fee: undefined
          }
        }
      })
    )

    const validTransactions = transactions.filter(tx => tx !== null)

    return NextResponse.json({ transactions: validTransactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
