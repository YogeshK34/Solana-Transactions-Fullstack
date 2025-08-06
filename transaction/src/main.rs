use anyhow::{anyhow, Result};
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    native_token::LAMPORTS_PER_SOL,
    signature::{read_keypair_file, Signer},
    system_instruction,
    transaction::Transaction,
};

#[tokio::main]
async fn main() -> Result<()> {
    // Connect to devnet
    let connection = RpcClient::new_with_commitment(
        "https://api.devnet.solana.com".to_string(),
        CommitmentConfig::confirmed(),
    );

    // Load sender and recipient keypairs
    let sender = read_keypair_file("sender.json")
        .map_err(|e| anyhow!("Failed to read sender keypair: {}", e))?;
    let recipient = read_keypair_file("recipient.json")
        .map_err(|e| anyhow!("Failed to read recipient keypair: {}", e))?;

    // Check balances before transfer
    let pre_balance_sender = connection.get_balance(&sender.pubkey()).await?;
    let pre_balance_recipient = connection.get_balance(&recipient.pubkey()).await?;

    let transfer_amount = LAMPORTS_PER_SOL / 100; // 0.01 SOL

    println!(
        "Sender pre-balance: {:.4} SOL",
        pre_balance_sender as f64 / LAMPORTS_PER_SOL as f64
    );
    println!(
        "Recipient pre-balance: {:.4} SOL",
        pre_balance_recipient as f64 / LAMPORTS_PER_SOL as f64
    );

    // If insufficient funds, abort
    if pre_balance_sender < transfer_amount {
        return Err(anyhow!(
            "Sender doesn't have enough SOL to transfer. Needed: {}, Found: {}",
            transfer_amount,
            pre_balance_sender
        ));
    }

    // Prepare transfer
    let transfer_instruction =
        system_instruction::transfer(&sender.pubkey(), &recipient.pubkey(), transfer_amount);
    let mut transaction =
        Transaction::new_with_payer(&[transfer_instruction], Some(&sender.pubkey()));
    let blockhash = connection.get_latest_blockhash().await?;
    transaction.sign(&[&sender], blockhash);

    // Send the transaction
    let transaction_signature = connection
        .send_and_confirm_transaction(&transaction)
        .await?;

    // Check balances after transfer
    let post_balance_sender = connection.get_balance(&sender.pubkey()).await?;
    let post_balance_recipient = connection.get_balance(&recipient.pubkey()).await?;

    println!(
        "Sender post-balance: {:.4} SOL",
        post_balance_sender as f64 / LAMPORTS_PER_SOL as f64
    );
    println!(
        "Recipient post-balance: {:.4} SOL",
        post_balance_recipient as f64 / LAMPORTS_PER_SOL as f64
    );
    println!("Transaction Signature: {}", transaction_signature);

    Ok(())
}
