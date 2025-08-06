"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Copy, Send, Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

export default function SolanaWallet() {
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)

  // Mock data - in real app, this would come from your Rust backend or Solana RPC
  const senderAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  const senderBalance = 2.4567
  const recipientBalance = 1.2345

  const transactions = [
    {
      signature: "5VfYmGBjvxKjKjFxGX9B2ZQXJYqKjFxGX9B2ZQXJYqKjFxGX9B2ZQXJYqKjFxGX9B2ZQX",
      type: "sent",
      amount: 0.01,
      status: "confirmed",
      timestamp: "2024-01-15 14:30:25",
      recipient: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    },
    {
      signature: "3VfYmGBjvxKjKjFxGX9B2ZQXJYqKjFxGX9B2ZQXJYqKjFxGX9B2ZQXJYqKjFxGX9B2ZQX",
      type: "received",
      amount: 0.5,
      status: "confirmed",
      timestamp: "2024-01-15 12:15:10",
      sender: "4WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    },
    {
      signature: "8VfYmGBjvxKjKjFxGX9B2ZQXJYqKjFxGX9B2ZQXJYqKjFxGX9B2ZQXJYqKjFxGX9B2ZQX",
      type: "sent",
      amount: 0.25,
      status: "pending",
      timestamp: "2024-01-15 10:45:33",
      recipient: "6WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
    }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    })
  }

  const handleTransfer = async () => {
    if (!transferAmount || !recipientAddress) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    setIsTransferring(true)
    
    // Simulate API call to your Rust backend
    setTimeout(() => {
      setIsTransferring(false)
      setTransferAmount("")
      setRecipientAddress("")
      toast({
        title: "Transfer Initiated",
        description: "Your transaction has been submitted to the network",
      })
    }, 2000)
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
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
          <p className="text-muted-foreground">Manage your SOL transactions on Devnet</p>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Devnet
          </Badge>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sender Wallet */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Your Wallet
              </CardTitle>
              <CardDescription className="text-purple-100">
                Main wallet address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-purple-100">Address</Label>
                <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                  <code className="text-sm flex-1 truncate">{senderAddress}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-white/20"
                    onClick={() => copyToClipboard(senderAddress)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-purple-100">Balance</Label>
                <div className="text-3xl font-bold">{senderBalance.toFixed(4)} SOL</div>
                <div className="text-sm text-purple-100">
                  ≈ ${(senderBalance * 98.45).toFixed(2)} USD
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
                Transfer SOL to another wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter recipient address..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
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
                disabled={isTransferring}
              >
                {isTransferring ? "Processing..." : "Send Transaction"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent transactions on your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Signature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === "sent" ? (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-green-500" />
                        )}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {tx.type === "sent" ? "-" : "+"}{tx.amount} SOL
                    </TableCell>
                    <TableCell className="font-mono">
                      {truncateAddress(tx.type === "sent" ? tx.recipient! : tx.sender!)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="capitalize">{tx.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.timestamp}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Network Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You're connected to Solana Devnet. This is a test network and SOL tokens have no real value.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
