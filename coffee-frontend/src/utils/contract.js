export const CONTRACT_ADDRESS = "0x1Ae735947965964f858906A2991Da1F396dFbF0a";

export const ABI = [
  "function admin() view returns (address)",
  "function batchCount() view returns (uint256)",
  "function roles(address) view returns (uint8)",
  "function assignRole(address _user, uint8 _role) external",
  "function createBatch(string _origin, uint256 _weightKg, uint256 _priceInWei) external",
  "function processBatch(uint256 _id) external",
  "function inspectBatch(uint256 _id) external",
  "function listForSale(uint256 _id) external",
  "function buyBatch(uint256 _id) external payable",
  "function getBatch(uint256 _id) external view returns (tuple(uint256 id, string origin, uint256 weightKg, address farmer, address processor, address inspector, address currentOwner, uint8 status, uint256 price, bool isPaid, uint256 createdAt, uint256 updatedAt))",
  "function getBatchesByOwner(address _owner) external view returns (uint256[])",
  "event BatchCreated(uint256 indexed batchId, address indexed farmer, string origin, uint256 weightKg)",
  "event BatchUpdated(uint256 indexed batchId, uint8 newStatus, address indexed updatedBy)",
  "event OwnershipTransferred(uint256 indexed batchId, address indexed from, address indexed to)",
  "event PaymentReceived(uint256 indexed batchId, address indexed buyer, uint256 amount)",
  "event RoleAssigned(address indexed user, uint8 role)"
];

export const ROLES = {
  0: "None",
  1: "Farmer",
  2: "Processor",
  3: "Inspector",
  4: "Consumer"
};

export const BATCH_STATUS = {
  0: "Harvested",
  1: "Processing",
  2: "Inspected",
  3: "For Sale",
  4: "Sold"
};
