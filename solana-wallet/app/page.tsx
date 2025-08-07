"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Send, Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle, RefreshCw, Server, Loader2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"

export default function SolanaWallet() {
  const {
    walletInfo,
    balance,
    transactions,
    isLoading,
    isBalanceLoading,
    isTransactionsLoading,
    isBackendConnected,
    sendTransaction,
    refreshAll
  } = useWallet()

  const [transferAmount, setTransferAmount] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransfer = async () => {
    if (!transferAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount to transfer",
        variant: "destructive"
      })
      return
    }

    const amount = parseFloat(transferAmount)
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      })
      return
    }

    if (balance && amount > balance.sender_balance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive"
      })
      return
    }

    setIsTransferring(true)
    
    try {
      await sendTransaction(amount)
      setTransferAmount("") // Clear form on success
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsTransferring(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text copied successfully",
    })
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    switch (normalizedStatus) {
      case "confirmed":
      case "finalized":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processed":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (blockTime?: number | null) => {
    if (!blockTime || blockTime === null) return "Unknown"
    return new Date(blockTime * 1000).toLocaleString()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Connecting to Backend</h3>
              <p className="text-sm text-muted-foreground">
                Initializing connection to Rust backend...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Backend connection error
  if (!isBackendConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <Server className="h-6 w-6" />
              Backend Connection Failed
            </CardTitle>
            <CardDescription>
              Unable to connect to the Rust backend server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your Rust backend is running on localhost:8080
              </AlertDescription>
            </Alert>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>To start the backend:</p>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                cd backend && cargo run
              </code>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Wallet className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Solana Wallet
            </h1>
          </div>
          <p className="text-muted-foreground">Full-stack Solana wallet on Devnet</p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {walletInfo?.network || 'Devnet'}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Backend Connected
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshAll}
              disabled={isBalanceLoading || isTransactionsLoading}
            >
              <RefreshCw className={`h-4 w-4 ${(isBalanceLoading || isTransactionsLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Wallet */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Sender Wallet (Your Beta.solpg.io)
              </CardTitle>
              <CardDescription className="text-purple-100">
                Your main wallet from beta.solpg.io
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-purple-100">Address</Label>
                <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                  <code className="text-sm flex-1 truncate">
                    {walletInfo?.sender_address || 'Loading...'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-white/20"
                    onClick={() => walletInfo && copyToClipboard(walletInfo.sender_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-purple-100">Balance</Label>
                <div className="text-3xl font-bold">
                  {isBalanceLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    `${balance?.sender_balance.toFixed(4) || '0.0000'} SOL`
                  )}
                </div>
                <div className="text-sm text-purple-100">
                  {balance && `${balance.sender_balance_lamports.toLocaleString()} lamports`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send SOL
              </CardTitle>
              <CardDescription>
                Transfer SOL to recipient wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Address (Auto-filled)</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <code className="text-sm flex-1 truncate text-muted-foreground">
                    {walletInfo?.recipient_address || 'Loading...'}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => walletInfo && copyToClipboard(walletInfo.recipient_address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (SOL)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTransferAmount("0.01")}
                  >
                    0.01 SOL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTransferAmount("0.1")}
                  >
                    0.1 SOL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTransferAmount("1")}
                  >
                    1 SOL
                  </Button>
                </div>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleTransfer}
                disabled={isTransferring || !balance || balance.sender_balance === 0}
              >
                {isTransferring ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Transaction...
                  </div>
                ) : (
                  "Send Transaction"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recipient Balance Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Recipient Wallet Balance
            </CardTitle>
            <CardDescription className="text-green-100">
              Generated recipient wallet balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isBalanceLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </div>
              ) : (
                `${balance?.recipient_balance.toFixed(4) || '0.0000'} SOL`
              )}
            </div>
            <div className="text-sm text-green-100 mt-1">
              {balance && `${balance.recipient_balance_lamports.toLocaleString()} lamports`}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Transaction History
              <Badge variant="outline">
                {transactions.length} transactions
              </Badge>
            </CardTitle>
            <CardDescription>
              Real transaction history from your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tx.status)}
                          <span className="capitalize text-sm">{tx.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{truncateAddress(tx.signature)}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(tx.signature)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {tx.slot.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestamp(tx.blockTime)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.fee ? `${tx.fee} lamports` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Network Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Connected to Solana Devnet via Rust backend. All transactions are real but use test SOL with no monetary value.
            Backend running on localhost:8080
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
