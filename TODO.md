# On-Chain Participant Names

**Approved: Move from localStorage to on-chain mapping(address => string name)**

**Current:** AdminPanel saves to localStorage, Traceability reads (multi-wallet works but not persistent)

**Plan:**
**Backend (coffee-chain/contracts/CoffeeSupplyChain.sol):**

- Add `mapping(address => string) public names;`
- `function setName(address user, string memory _name) external onlyAdmin`
- Update `assignRole` emit name too

**Frontend:**

1. `coffee-frontend/src/utils/contract.js`: Add name ABI, update ROLES
2. AdminPanel.jsx: Call setName + assignRole
3. Create `useNames` hook: cache names from contract.names(addr)
4. Update all panels + Traceability: useNames(addr) everywhere

**Dependent Files:**

- CoffeeSupplyChain.sol
- contract.js (ABI)
- AdminPanel.jsx
- New useNames.js hook
- Update all 4 role panels + Traceability

**Followup:**

1. Redeploy contract (update CONTRACT_ADDRESS)
2. `npm run dev` test

Confirm before editing contract?
