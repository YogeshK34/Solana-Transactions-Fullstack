import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export async function POST(request: NextRequest) {
  try {
    const { publicKey } = await request.json()
    
    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 })
    }

    const pubKey = new PublicKey(publicKey)
    const balance = await connection.getBalance(pubKey)
    const solBalance = balance / LAMPORTS_PER_SOL

    return NextResponse.json({ 
      balance: solBalance,
      lamports: balance 
    })
  } catch (error) {
    console.error('Error fetching balance:', error)
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}
