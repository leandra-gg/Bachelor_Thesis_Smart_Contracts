const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Wallet:", signer.address);

  // ETH-Balance abrufen (nativer Token auf OP Sepolia)
  const balance = await signer.provider.getBalance(signer.address);

  console.log(`ETH Balance on OP Sepolia: ${ethers.formatEther(balance)} ETH`);
}

main().catch((err) => {
  console.error("Fehler beim Abrufen der ETH-Balance:", err);
  process.exit(1);
});



