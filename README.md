# Solana Wallet Frontend

A beautiful, modern frontend interface for Solana wallet transactions built with Next.js and shadcn/ui components. This application provides a sleek user interface for managing SOL transfers on the Solana Devnet.

## 🌟 Features

- **Modern UI/UX**: Beautiful gradient design with shadcn/ui components
- **Wallet Management**: Display wallet address and real-time SOL balance
- **Transaction Interface**: Clean form for sending SOL with preset amount buttons
- **Transaction History**: Comprehensive table showing recent transactions with status indicators
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Copy Functionality**: One-click copying of addresses and transaction signatures
- **Network Awareness**: Clear indication of Devnet connection
- **Real-time Updates**: Toast notifications for user feedback

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Rust with Solana SDK
- **Blockchain**: Solana Devnet

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- Rust and Cargo installed
- Solana CLI tools installed
- A Solana wallet keypair for testing (sender.json and recipient.json)

## 🛠️ Installation

### Frontend Setup

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/Solana-Transactions-Fullstack.git
cd Solana-Transactions-Fullstack
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup (Rust)

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install Rust dependencies:
\`\`\`bash
cargo build
\`\`\`

3. Set up your wallet keypairs:
\`\`\`bash
# Generate sender keypair (or use your existing one)
solana-keygen new --outfile sender.json

# Generate recipient keypair
solana-keygen new --outfile recipient.json

# Fund your sender wallet on devnet
solana airdrop 2 --keypair sender.json --url devnet
\`\`\`

4. Run the Rust application:
\`\`\`bash
cargo run
\`\`\`

## 🎯 Usage

### Frontend Interface

1. **Wallet Overview**: View your wallet address and current SOL balance
2. **Send SOL**: 
   - Enter recipient address
   - Specify amount (or use preset buttons: 0.01, 0.1, 1 SOL)
   - Click "Send Transaction"
3. **Transaction History**: Monitor all your recent transactions with status updates
4. **Copy Addresses**: Click the copy icon next to any address or transaction signature

### Backend Operations

The Rust backend handles:
- Connecting to Solana Devnet RPC
- Loading wallet keypairs from JSON files
- Checking account balances
- Creating and signing transactions
- Broadcasting transactions to the network
- Confirming transaction completion

## 📁 Project Structure

\`\`\`
Solana-Transactions-Fullstack/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── backend/
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   ├── sender.json
│   └── recipient.json
├── lib/
│   └── utils.ts
├── hooks/
│   └── use-toast.ts
├── package.json
├── tailwind.config.ts
└── README.md
\`\`\`

## 🔧 Configuration

### Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_NETWORK=devnet
\`\`\`

### Rust Configuration

The Rust backend is configured to:
- Connect to Solana Devnet
- Use confirmed commitment level
- Transfer 0.01 SOL by default
- Read keypairs from local JSON files

## 🚦 API Integration

To connect the frontend with the Rust backend, you'll need to:

1. Create Next.js API routes in \`app/api/\`
2. Set up endpoints for:
   - Getting wallet balance
   - Sending transactions
   - Fetching transaction history
3. Replace mock data with real Solana RPC calls

Example API route structure:
\`\`\`
app/api/
├── balance/
│   └── route.ts
├── transfer/
│   └── route.ts
└── transactions/
    └── route.ts
\`\`\`

## 🧪 Testing

### Frontend Testing
\`\`\`bash
npm run test
\`\`\`

### Backend Testing
\`\`\`bash
cargo test
\`\`\`

### Manual Testing
1. Ensure you have SOL in your sender wallet on devnet
2. Use the frontend to send small amounts (0.01 SOL)
3. Verify transactions on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

## 🔒 Security Considerations

- **Devnet Only**: This application is configured for Devnet testing
- **Keypair Storage**: Store keypairs securely, never commit them to version control
- **Input Validation**: Always validate user inputs before processing transactions
- **Error Handling**: Implement proper error handling for failed transactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Solana Labs](https://solana.com/) for the blockchain infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/Solana-Transactions-Fullstack/issues) page
2. Create a new issue with detailed information
3. Join the discussion in our community channels

## 🗺️ Roadmap

- [ ] Mainnet support
- [ ] Multiple wallet support
- [ ] Transaction scheduling
- [ ] Advanced analytics dashboard
- [ ] Mobile app version
- [ ] Integration with popular Solana wallets (Phantom, Solflare)

---

**⚠️ Disclaimer**: This application is for educational and testing purposes on Solana Devnet. Always exercise caution when dealing with real cryptocurrency transactions.
\`\`\`

This comprehensive README.md provides:

1. **Clear project overview** with features and tech stack
2. **Step-by-step installation** instructions for both frontend and backend
3. **Usage guidelines** for the interface and backend operations
4. **Project structure** overview
5. **Configuration details** including environment variables
6. **API integration guidance** for connecting frontend to backend
7. **Testing procedures** for both components
8. **Security considerations** and best practices
9. **Contributing guidelines** for open source collaboration
10. **Support and roadmap** information

The README is well-structured with emojis for visual appeal and includes all the necessary information for developers to understand, set up, and contribute to your Solana wallet project.
