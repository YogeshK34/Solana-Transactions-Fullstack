use crate::AppState;
use anyhow::{anyhow, Result};
use solana_sdk::{
    native_token::LAMPORTS_PER_SOL,
    system_instruction,
    transaction::Transaction,
    signature::Signer,
};

pub struct SolanaService;

impl SolanaService {
    pub async fn get_balances(app_state: &AppState) -> Result<(u64, u64)> {
        let sender_balance = app_state
            .rpc_client
            .get_balance(&app_state.sender_keypair.pubkey())
            .await?;
        
        let recipient_balance = app_state
            .rpc_client
            .get_balance(&app_state.recipient_keypair.pubkey())
            .await?;

        Ok((sender_balance, recipient_balance))
    }

    pub async fn send_transaction(app_state: &AppState, amount_sol: f64) -> Result<String> {
        let transfer_amount = (amount_sol * LAMPORTS_PER_SOL as f64) as u64;

        // Check sender balance
        let sender_balance = app_state
            .rpc_client
            .get_balance(&app_state.sender_keypair.pubkey())
            .await?;

        if sender_balance < transfer_amount {
            return Err(anyhow!(
                "Insufficient balance. Required: {} lamports, Available: {} lamports",
                transfer_amount,
                sender_balance
            ));
        }

        // Create transfer instruction
        let transfer_instruction = system_instruction::transfer(
            &app_state.sender_keypair.pubkey(),
            &app_state.recipient_keypair.pubkey(),
            transfer_amount,
        );

        // Create and sign transaction
        let mut transaction = Transaction::new_with_payer(
            &[transfer_instruction],
            Some(&app_state.sender_keypair.pubkey()),
        );

        let blockhash = app_state.rpc_client.get_latest_blockhash().await?;
        transaction.sign(&[&*app_state.sender_keypair], blockhash);

        // Send transaction
        let signature = app_state
            .rpc_client
            .send_and_confirm_transaction(&transaction)
            .await?;

        Ok(signature.to_string())
    }

    pub async fn get_transaction_history(app_state: &AppState) -> Result<Vec<solana_client::rpc_response::RpcConfirmedTransactionStatusWithSignature>> {
        let signatures = app_state
            .rpc_client
            .get_signatures_for_address(&app_state.sender_keypair.pubkey())
            .await?;

        Ok(signatures)
    }
}
