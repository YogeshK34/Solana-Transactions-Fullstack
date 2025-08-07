use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct WalletInfo {
    pub sender_address: String,
    pub recipient_address: String,
    pub network: String,
}

#[derive(Serialize, Deserialize)]
pub struct BalanceResponse {
    pub sender_balance: f64,
    pub recipient_balance: f64,
    pub sender_balance_lamports: u64,
    pub recipient_balance_lamports: u64,
}

#[derive(Serialize, Deserialize)]
pub struct SendTransactionRequest {
    pub amount: f64, // Amount in SOL
}

#[derive(Serialize, Deserialize)]
pub struct SendTransactionResponse {
    pub success: bool,
    pub transaction_signature: Option<String>,
    pub pre_balance_sender: f64,
    pub post_balance_sender: f64,
    pub pre_balance_recipient: f64,
    pub post_balance_recipient: f64,
    pub amount_transferred: f64,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct TransactionHistoryResponse {
    pub transactions: Vec<TransactionInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct TransactionInfo {
    pub signature: String,
    pub block_time: Option<i64>,
    pub slot: u64,
    pub status: String,
    pub amount: Option<f64>,
    pub fee: Option<u64>,
}

#[derive(Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: String,
    pub network: String,
}

#[derive(Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}
