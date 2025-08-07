use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use anyhow::Result;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    signature::{read_keypair_file, Keypair}, signer::Signer,
};
use std::sync::Arc;

mod handlers;
mod models;
mod services;

// Application state that will be shared across all handlers
#[derive(Clone)]
pub struct AppState {
    pub rpc_client: Arc<RpcClient>,
    pub sender_keypair: Arc<Keypair>,
    pub recipient_keypair: Arc<Keypair>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    env_logger::init();

    // Connect to devnet
    let rpc_client = Arc::new(RpcClient::new_with_commitment(
        "https://api.devnet.solana.com".to_string(),
        CommitmentConfig::confirmed(),
    ));

    // Load keypairs
    let sender_keypair = Arc::new(
        read_keypair_file("sender.json")
            .map_err(|e| anyhow::anyhow!("Failed to read sender keypair: {}", e))?
    );
    
    let recipient_keypair = Arc::new(
        read_keypair_file("recipient.json")
            .map_err(|e| anyhow::anyhow!("Failed to read recipient keypair: {}", e))?
    );

    // Create application state
    let app_state = AppState {
        rpc_client,
        sender_keypair,
        recipient_keypair,
    };

    println!("🚀 Starting Solana Wallet API Server on http://localhost:8080");
    println!("📝 Sender Address: {:?}", app_state.sender_keypair.try_pubkey());
    println!("📝 Recipient Address: {:?}", app_state.recipient_keypair.try_pubkey());

    // Start HTTP server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000") // Your Next.js frontend
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec!["content-type"])
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(app_state.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .service(
                web::scope("/api")
                    .route("/wallet/info", web::get().to(handlers::get_wallet_info))
                    .route("/wallet/balance", web::get().to(handlers::get_balance))
                    .route("/transaction/send", web::post().to(handlers::send_transaction))
                    .route("/transaction/history", web::get().to(handlers::get_transaction_history))
                    .route("/health", web::get().to(handlers::health_check))
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

    Ok(())
}
