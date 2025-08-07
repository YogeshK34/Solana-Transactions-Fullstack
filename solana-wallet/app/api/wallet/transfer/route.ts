import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'
import bs58 from 'bs58'

const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

export async function POST(request: NextRequest) {
  try {
    const { fromPrivateKey, toPublicKey, amount } = await request.json()
    
    if (!fromPrivateKey || !toPublicKey || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create keypair from private key
    const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivateKey))
    const toPublicKeyObj = new PublicKey(toPublicKey)
    
    // Convert SOL to lamports
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL)
    
    // Check balance
    const balance = await connection.getBalance(fromKeypair.publicKey)
    if (balance < lamports) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports,
      })
    )

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromKeypair.publicKey

    // Sign and send transaction
    transaction.sign(fromKeypair)
    const signature = await connection.sendRawTransaction(transaction.serialize())
    
    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed')

    return NextResponse.json({ 
      signature,
      success: true 
    })
  } catch (error) {
    console.error('Error sending transaction:', error)
    return NextResponse.json({ error: 'Failed to send transaction' }, { status: 500 })
  }
}
