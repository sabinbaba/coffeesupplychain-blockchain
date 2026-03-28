// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CoffeeSupplyChain {

    // ─── ENUMS ───────────────────────────────────────────────
    enum Role { None, Farmer, Processor, Inspector, Consumer }
    enum BatchStatus { Harvested, Processing, Inspected, ForSale, Sold }

    // ─── STRUCTS ─────────────────────────────────────────────
    struct Batch {
        uint256 id;
        string  origin;        // farm location
        uint256 weightKg;      // weight at harvest
        address farmer;
        address processor;
        address inspector;
        address currentOwner;
        BatchStatus status;
        uint256 price;         // in wei
        bool    isPaid;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // ─── STATE VARIABLES ─────────────────────────────────────
    address public admin;
    uint256 public batchCount;

    mapping(uint256 => Batch)  public batches;
    mapping(address => Role)   public roles;

    // ─── EVENTS ──────────────────────────────────────────────
    event RoleAssigned(address indexed user, Role role);
    event BatchCreated(uint256 indexed batchId, address indexed farmer, string origin, uint256 weightKg);
    event BatchUpdated(uint256 indexed batchId, BatchStatus newStatus, address indexed updatedBy);
    event OwnershipTransferred(uint256 indexed batchId, address indexed from, address indexed to);
    event PaymentReceived(uint256 indexed batchId, address indexed buyer, uint256 amount);

    // ─── MODIFIERS ───────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Unauthorized role");
        _;
    }

    modifier batchExists(uint256 _id) {
        require(_id > 0 && _id <= batchCount, "Batch does not exist");
        _;
    }

    // ─── CONSTRUCTOR ─────────────────────────────────────────
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Farmer; // admin can also act as farmer
    }

    // ─── ROLE MANAGEMENT ─────────────────────────────────────
    function assignRole(address _user, Role _role) external onlyAdmin {
        require(_user != address(0), "Invalid address");
        roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }

    // ─── FARMER: Create a new coffee batch ───────────────────
    function createBatch(
        string  memory _origin,
        uint256 _weightKg,
        uint256 _priceInWei
    ) external onlyRole(Role.Farmer) {
        require(bytes(_origin).length > 0, "Origin required");
        require(_weightKg > 0, "Weight must be positive");
        require(_priceInWei > 0, "Price must be positive");

        batchCount++;
        batches[batchCount] = Batch({
            id:           batchCount,
            origin:       _origin,
            weightKg:     _weightKg,
            farmer:       msg.sender,
            processor:    address(0),
            inspector:    address(0),
            currentOwner: msg.sender,
            status:       BatchStatus.Harvested,
            price:        _priceInWei,
            isPaid:       false,
            createdAt:    block.timestamp,
            updatedAt:    block.timestamp
        });

        emit BatchCreated(batchCount, msg.sender, _origin, _weightKg);
    }

    // ─── PROCESSOR: Take batch for processing ────────────────
    function processBatch(uint256 _id)
        external
        onlyRole(Role.Processor)
        batchExists(_id)
    {
        Batch storage b = batches[_id];
        require(b.status == BatchStatus.Harvested, "Batch not ready for processing");

        b.processor   = msg.sender;
        b.currentOwner = msg.sender;
        b.status      = BatchStatus.Processing;
        b.updatedAt   = block.timestamp;

        emit BatchUpdated(_id, BatchStatus.Processing, msg.sender);
        emit OwnershipTransferred(_id, b.farmer, msg.sender);
    }

    // ─── INSPECTOR: Approve batch after quality check ────────
    function inspectBatch(uint256 _id)
        external
        onlyRole(Role.Inspector)
        batchExists(_id)
    {
        Batch storage b = batches[_id];
        require(b.status == BatchStatus.Processing, "Batch not in processing");

        b.inspector    = msg.sender;
        b.status       = BatchStatus.Inspected;
        b.updatedAt    = block.timestamp;

        emit BatchUpdated(_id, BatchStatus.Inspected, msg.sender);
    }

    // ─── PROCESSOR: List inspected batch for sale ────────────
    function listForSale(uint256 _id)
        external
        onlyRole(Role.Processor)
        batchExists(_id)
    {
        Batch storage b = batches[_id];
        require(b.status == BatchStatus.Inspected, "Batch not inspected yet");
        require(b.processor == msg.sender, "Not your batch");

        b.status    = BatchStatus.ForSale;
        b.updatedAt = block.timestamp;

        emit BatchUpdated(_id, BatchStatus.ForSale, msg.sender);
    }

    // ─── CONSUMER: Buy a batch by sending ETH ────────────────
    function buyBatch(uint256 _id)
        external
        payable
        batchExists(_id)
    {
        Batch storage b = batches[_id];
        require(b.status == BatchStatus.ForSale, "Batch not for sale");
        require(msg.value == b.price, "Incorrect payment amount");
        require(!b.isPaid, "Already sold");

        address previousOwner = b.currentOwner;

        b.currentOwner = msg.sender;
        b.status       = BatchStatus.Sold;
        b.isPaid       = true;
        b.updatedAt    = block.timestamp;

        // Transfer payment to processor
        (bool sent, ) = payable(previousOwner).call{value: msg.value}("");
        require(sent, "Payment transfer failed");

        emit PaymentReceived(_id, msg.sender, msg.value);
        emit OwnershipTransferred(_id, previousOwner, msg.sender);
        emit BatchUpdated(_id, BatchStatus.Sold, msg.sender);
    }

    // ─── VIEW: Get full batch details ────────────────────────
    function getBatch(uint256 _id)
        external
        view
        batchExists(_id)
        returns (Batch memory)
    {
        return batches[_id];
    }

    // ─── VIEW: Get all batch IDs owned by an address ─────────
    function getBatchesByOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= batchCount; i++) {
            if (batches[i].currentOwner == _owner) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= batchCount; i++) {
            if (batches[i].currentOwner == _owner) result[idx++] = i;
        }
        return result;
    }
}
