# MedSync Installation Guide

## Prerequisites

- Node.js (v16+)
- PNPM package manager
- Rust & Cargo
- Starknet CLI
- Git

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/medsync
cd medsync
```

### 2. Contract Environment
Create `.env` in root directory
```bash
STARKNET_ACCOUNT=your_starknet_account_address
STARKNET_PRIVATE_KEY=your_private_key
STARKNET_NETWORK=sepolia
```

### 3.Frontend Environment
Create `.env` 
```bash
VITE_APPLICATION_ID=your_calimero_app_id
VITE_NODE_URL=your_calimero_node_url
VITE_CONTEXT_ID=your_context_id
```

## Installation Steps

### 1.Logic Layer Setup 
```bash
# Build Rust logic
cd logic
chmod +x ./build.sh
./build.sh
```
Now For creating the context follow the [Calimero SDK documentation](https://calimero-network.github.io/tutorials/create-context)
### 2. Smart Contract Deployment 
Refer to the Starkli documentation

### 3. Frontend Setup 
``` bash
cd app
pnpm install

# Update contract address in src/components/ConsentManager.tsx
# const contractAddress = 'your_deployed_contract_address'
```
### 4.Start Development Server
```bash
pnpm dev
```
The app will be available at `http://localhost:5173`



## Configuration Details

### Starknet Setup
1. Install Argent X or Braavos wallet
2. Create/Import account
3. Switch to Sepolia testnet
4. Fund account with test tokens

### Calimero Setup
1. Create application in Calimero dashboard
2. Get application ID and node URL
3. Configure context

## Troubleshooting

### Common Issues
1. **Contract Deployment Fails**
   - Check wallet balance
   - Verify network configuration

2. **Frontend Connection Issues**
   - Verify environment variables
   - Check Calimero node status

## Additional Resources
- [Starknet Docs](https://docs.starknet.io)
- [Calimero Docs](https://docs.calimero.network)
```