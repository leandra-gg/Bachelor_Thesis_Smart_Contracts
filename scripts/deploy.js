const hre = require("hardhat");
const { formatEther } = hre.ethers;

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", formatEther(balance), "ETH");

    //deploy PublicKeyRegistry
    const PublicKeyRegistry = await hre.ethers.getContractFactory("PublicKeyRegistry");
    const publicKeyRegistry = await PublicKeyRegistry.deploy();
    await publicKeyRegistry.waitForDeployment();
    const registryAddress = await publicKeyRegistry.getAddress();
    console.log("PublicKeyRegistry deployed:", registryAddress);
    

    //deploy AuditTrail
    const AuditTrail = await hre.ethers.getContractFactory("AuditTrail");
    const auditTrail = await AuditTrail.deploy(registryAddress);
    await auditTrail.waitForDeployment();
    const auditTrailAddress = await auditTrail.getAddress();
    console.log("AuditTrail deployed:", auditTrailAddress);
    
    try{
        console.log("Verifying PublicKeyRegistry...");
        await hre.run("verify:verify", {
            address: registryAddress,
            constructorArguments: [],
        });

        console.log("Verifying AuditTrail");
        await hre.run("verify:verify", {
            address: auditTrailAddress,
            constructorArguments: [registryAddress],
        });
        console.log("Verification done");
    } catch (err){
        console.warn("Verification failed or already verified.", err.message)
    }

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});