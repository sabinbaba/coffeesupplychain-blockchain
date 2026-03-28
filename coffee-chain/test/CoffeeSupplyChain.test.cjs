// test/CoffeeSupplyChain.test.cjs
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoffeeSupplyChain", function () {
  let contract;
  let admin, farmer, processor, inspector, consumer;

  // ─── Deploy fresh contract before each test ───
  beforeEach(async function () {
    [admin, farmer, processor, inspector, consumer] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("CoffeeSupplyChain");
    contract = await Contract.deploy();

    // Assign roles
    await contract.connect(admin).assignRole(farmer.address,    1); // Farmer
    await contract.connect(admin).assignRole(processor.address, 2); // Processor
    await contract.connect(admin).assignRole(inspector.address, 3); // Inspector
    await contract.connect(admin).assignRole(consumer.address,  4); // Consumer
  });

  // ─── ROLE TESTS ───────────────────────────────
  describe("Role assignment", function () {
    it("should assign roles correctly", async function () {
      expect(await contract.roles(farmer.address)).to.equal(1);
      expect(await contract.roles(processor.address)).to.equal(2);
      expect(await contract.roles(inspector.address)).to.equal(3);
    });

    it("should reject role assignment from non-admin", async function () {
      await expect(
        contract.connect(farmer).assignRole(consumer.address, 2)
      ).to.be.revertedWith("Not admin");
    });
  });

  // ─── BATCH CREATION TESTS ─────────────────────
  describe("Batch creation", function () {
    it("should allow farmer to create a batch", async function () {
      await contract.connect(farmer).createBatch(
        "Kigali, Rwanda",
        ethers.parseEther("0.01"),
        100
      );

      const batch = await contract.getBatch(1);
      expect(batch.origin).to.equal("Kigali, Rwanda");
      expect(batch.farmer).to.equal(farmer.address);
      expect(batch.status).to.equal(0); // Harvested
    });

    it("should reject batch creation from non-farmer", async function () {
      await expect(
        contract.connect(consumer).createBatch(
          "Kigali, Rwanda",
          ethers.parseEther("0.01"),
          100
        )
      ).to.be.revertedWith("Unauthorized role");
    });

    it("should reject batch with empty origin", async function () {
      await expect(
        contract.connect(farmer).createBatch(
          "",
          ethers.parseEther("0.01"),
          100
        )
      ).to.be.revertedWith("Origin required");
    });
  });

  // ─── FULL LIFECYCLE TEST ───────────────────────
  describe("Full supply chain lifecycle", function () {
    beforeEach(async function () {
      // Farmer creates batch
      await contract.connect(farmer).createBatch(
        "Kigali, Rwanda",
        ethers.parseEther("0.01"),
        100
      );
    });

    it("should process batch correctly", async function () {
      await contract.connect(processor).processBatch(1);
      const batch = await contract.getBatch(1);
      expect(batch.status).to.equal(1); // Processing
      expect(batch.currentOwner).to.equal(processor.address);
    });

    it("should inspect batch correctly", async function () {
      await contract.connect(processor).processBatch(1);
      await contract.connect(inspector).inspectBatch(1);
      const batch = await contract.getBatch(1);
      expect(batch.status).to.equal(2); // Inspected
    });

    it("should list batch for sale correctly", async function () {
      await contract.connect(processor).processBatch(1);
      await contract.connect(inspector).inspectBatch(1);
      await contract.connect(processor).listForSale(1);
      const batch = await contract.getBatch(1);
      expect(batch.status).to.equal(3); // ForSale
    });

    it("should complete purchase and transfer ETH", async function () {
      await contract.connect(processor).processBatch(1);
      await contract.connect(inspector).inspectBatch(1);
      await contract.connect(processor).listForSale(1);

      // ✅ Read price dynamically
      const batch = await contract.getBatch(1);
      const price = batch.price;

      const before = await ethers.provider.getBalance(processor.address);

      await contract.connect(consumer).buyBatch(1, { value: price });

      const after = await ethers.provider.getBalance(processor.address);
      const updatedBatch = await contract.getBatch(1);

      expect(updatedBatch.status).to.equal(4);       // Sold
      expect(updatedBatch.isPaid).to.equal(true);
      expect(updatedBatch.currentOwner).to.equal(consumer.address);
      expect(after).to.be.greaterThan(before);       // processor received ETH
    });

    it("should reject wrong payment amount", async function () {
      await contract.connect(processor).processBatch(1);
      await contract.connect(inspector).inspectBatch(1);
      await contract.connect(processor).listForSale(1);

      await expect(
        contract.connect(consumer).buyBatch(1, { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("should reject skipping steps in the lifecycle", async function () {
      await expect(
        contract.connect(inspector).inspectBatch(1)
      ).to.be.revertedWith("Batch not in processing");
    });
  });
});