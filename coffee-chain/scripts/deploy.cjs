const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CoffeeSupplyChain to Sepolia...\n");

  // Get deployer wallet
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy
  const Contract = await ethers.getContractFactory("CoffeeSupplyChain");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("📌 Contract address:", address);
  console.log("\n🔍 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

