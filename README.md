# Coffee Supply Chain Blockchain DApp ☕🔗

Decentralized coffee traceability platform. Track batches from farm to consumer on Sepolia testnet.

## 🌐 Features

- **Full Supply Chain**: Farmer → Processor → Inspector → Market → Consumer
- **Role-Based Dashboards**: Connect wallet, auto-detect role
- **Live Traceability**: Search any batch ID, see journey/timeline/participants
- **Role Display**: "Farmer (0x123...)" instead of raw addresses
- **Responsive UI**: Dark sidebar, centered content, mobile-friendly
- **Etherscan Verified**: On-chain transparency

## 🛠 Tech Stack

- **Smart Contract**: Solidity + Hardhat (CoffeeSupplyChain.sol)
- **Frontend**: React + Vite + Ethers.js
- **Network**: Sepolia testnet
- **Wallet**: MetaMask

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/sabinbaba/coffeesupplychain-blockchain.git
cd coffeesupplychain-blockchain
```

### 2. Backend (Smart Contract)

```bash
cd coffee-chain
npm install
npx hardhat compile
```

**Deploy to Sepolia:**

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

- Save contract address from `scripts/contract-address.txt`
- Update `coffee-frontend/src/utils/contract.js` → `CONTRACT_ADDRESS`

### 3. Frontend

```bash
cd ../coffee-frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### 4. Test on Sepolia

1. **Connect MetaMask** → Sepolia testnet
2. **Get Test ETH**: [Sepolia Faucet](https://sepoliafaucet.com)
3. **Assign Role**: Admin assigns via Admin Panel
4. **Use Dashboards**:
   - Farmer: Create batches
   - Processor: Process batches
   - Inspector: Approve quality
   - Consumer: Buy batches
5. **Trace**: Search any batch ID on Traceability page

## 📱 Usage Flow

```
1. Connect Wallet → Auto-detect Role
2. Sidebar Nav → Dashboard/Trace/Admin
3. Role Panel → Perform Actions
4. Traceability → Search Batch ID → Full Journey
```

## 🔧 Development

### Contract Testing

```bash
cd coffee-chain
npm test
```

### Frontend Dev

```bash
cd coffee-frontend
npm run dev    # http://localhost:5173
npm run build  # production
```

### Customize

- `CONTRACT_ADDRESS` in `src/utils/contract.js`
- Add roles via Admin Panel
- Deploy own contract & update address

## 🧪 Smart Contract Functions

| Action       | Role      | Method                               |
| ------------ | --------- | ------------------------------------ |
| Create Batch | Farmer    | `createBatch(origin, weight, price)` |
| Process      | Processor | `processBatch(id)`                   |
| Inspect      | Inspector | `inspectBatch(id)`                   |
| List Sale    | Processor | `listForSale(id)`                    |
| Buy          | Consumer  | `buyBatch(id)` {value}               |

**Events**: BatchCreated, BatchUpdated, OwnershipTransferred, PaymentReceived

## 📄 ABI

See `coffee-frontend/src/utils/contract.js`

## 🎨 UI Highlights

- Responsive sidebar (desktop/mobile)
- Role-colored badges
- Interactive timeline
- Hover-highlighted cards/table
- Large readable fonts
- Gradient accents

## 🔗 Links

- [Contract (Sepolia)](https://sepolia.etherscan.io/address/YOUR_CONTRACT)
- [Dev Server](http://localhost:5173)

## 🤝 Admin Setup

1. Deploy contract → copy address
2. Admin Panel → Assign roles: `assignRole(address, role)`
3. Roles: 1=farmer, 2=processor, 3=inspector, 4=consumer

## 📱 Mobile

- Sidebar overlay toggle
- Single-column participants
- Horizontal table scroll
- Touch-friendly buttons

## 🐛 Troubleshooting

| Issue              | Solution                     |
| ------------------ | ---------------------------- |
| "No batches"       | Create test batch as Farmer  |
| "No role"          | Admin assign via Admin Panel |
| Contract not found | Update CONTRACT_ADDRESS      |
| Wrong network      | Switch MetaMask to Sepolia   |
| No ETH             | Sepolia faucet               |

## 🚀 Production

```bash
npm run build  # frontend
npx hardhat verify DEPLOYED_CONTRACT_ID --network sepolia  # verify contract
```

**Enjoy transparent coffee supply chain! ☕✨**
