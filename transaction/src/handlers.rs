use crate::{models::*, services::SolanaService, AppState};
use actix_web::{web, HttpResponse, Result};
use solana_sdk::{native_token::LAMPORTS_PER_SOL, signature::Signer};
use chrono::Utc;

pub async fn health_check() -> Result<HttpResponse> {
    let response = HealthResponse {
        status: "healthy".to_string(),
        timestamp: Utc::now().to_rfc3339(),
        network: "devnet".to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}

pub async fn get_wallet_info(app_state: web::Data<AppState>) -> Result<HttpResponse> {
    let response = WalletInfo {
        sender_address: app_state.sender_keypair.pubkey().to_string(),
        recipient_address: app_state.recipient_keypair.pubkey().to_string(),
        network: "devnet".to_string(),
    };
    Ok(HttpResponse::Ok().json(response))
}

pub async fn get_balance(app_state: web::Data<AppState>) -> Result<HttpResponse> {
    match SolanaService::get_balances(&app_state).await {
        Ok((sender_balance, recipient_balance)) => {
            let response = BalanceResponse {
                sender_balance: sender_balance as f64 / LAMPORTS_PER_SOL as f64,
                recipient_balance: recipient_balance as f64 / LAMPORTS_PER_SOL as f64,
                sender_balance_lamports: sender_balance,
                recipient_balance_lamports: recipient_balance,
            };
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            let error_response = ErrorResponse {
                error: "balance_fetch_failed".to_string(),
                message: e.to_string(),
            };
            Ok(HttpResponse::InternalServerError().json(error_response))
        }
    }
}

pub async fn send_transaction(
    app_state: web::Data<AppState>,
    req: web::Json<SendTransactionRequest>,
) -> Result<HttpResponse> {
    // Get pre-transaction balances
    let (pre_sender_balance, pre_recipient_balance) = match SolanaService::get_balances(&app_state).await {
        Ok(balances) => balances,
        Err(e) => {
            let error_response = ErrorResponse {
                error: "balance_fetch_failed".to_string(),
                message: e.to_string(),
            };
            return Ok(HttpResponse::InternalServerError().json(error_response));
        }
    };

    // Send transaction
    match SolanaService::send_transaction(&app_state, req.amount).await {
        Ok(signature) => {
            // Get post-transaction balances
            let (post_sender_balance, post_recipient_balance) = 
                SolanaService::get_balances(&app_state).await.unwrap_or((0, 0));

            let response = SendTransactionResponse {
                success: true,
                transaction_signature: Some(signature),
                pre_balance_sender: pre_sender_balance as f64 / LAMPORTS_PER_SOL as f64,
                post_balance_sender: post_sender_balance as f64 / LAMPORTS_PER_SOL as f64,
                pre_balance_recipient: pre_recipient_balance as f64 / LAMPORTS_PER_SOL as f64,
                post_balance_recipient: post_recipient_balance as f64 / LAMPORTS_PER_SOL as f64,
                amount_transferred: req.amount,
                error: None,
            };
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            let response = SendTransactionResponse {
                success: false,
                transaction_signature: None,
                pre_balance_sender: pre_sender_balance as f64 / LAMPORTS_PER_SOL as f64,
                post_balance_sender: pre_sender_balance as f64 / LAMPORTS_PER_SOL as f64,
                pre_balance_recipient: pre_recipient_balance as f64 / LAMPORTS_PER_SOL as f64,
                post_balance_recipient: pre_recipient_balance as f64 / LAMPORTS_PER_SOL as f64,
                amount_transferred: 0.0,
                error: Some(e.to_string()),
            };
            Ok(HttpResponse::BadRequest().json(response))
        }
    }
}

pub async fn get_transaction_history(app_state: web::Data<AppState>) -> Result<HttpResponse> {
    match SolanaService::get_transaction_history(&app_state).await {
        Ok(signatures) => {
            let transactions: Vec<TransactionInfo> = signatures
                .into_iter()
                .map(|sig| TransactionInfo {
                    signature: sig.signature,
                    block_time: sig.block_time,
                    slot: sig.slot,
                    status: sig.confirmation_status.map_or("unknown".to_string(), |s| format!("{:?}", s)),
                    amount: None, // You can enhance this by parsing transaction details
                    fee: sig.memo.as_ref().and_then(|_| Some(5000)), // Approximate fee
                })
                .collect();

            let response = TransactionHistoryResponse { transactions };
            Ok(HttpResponse::Ok().json(response))
        }
        Err(e) => {
            let error_response = ErrorResponse {
                error: "transaction_history_failed".to_string(),
                message: e.to_string(),
            };
            Ok(HttpResponse::InternalServerError().json(error_response))
        }
    }
}
