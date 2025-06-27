// test/AuditTrail.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuditTrail", function () {
  let deployer, orchestrator, machine;
  let auditTrail, registry;

  beforeEach(async function () {
    [deployer, orchestrator, machine] = await ethers.getSigners();

    // Deploy PublicKeyRegistry
    const Registry = await ethers.getContractFactory("PublicKeyRegistry");
    registry = await Registry.connect(deployer).deploy();
    await registry.waitForDeployment();

    // Register machine with public key hash
    const fakePubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("machinePublicKey"));
    await registry.connect(deployer).registerMachine(machine.address, fakePubKeyHash);

    // Deploy AuditTrail
    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrail.connect(orchestrator).deploy(await registry.getAddress());
    await auditTrail.waitForDeployment();
  });

  it("should start with empty audit trail", async function () {
    expect(await auditTrail.getAudiTrailLength()).to.equal(0);
  });

  it("should add an audit record", async function () {
    const hash = ethers.keccak256(ethers.toUtf8Bytes("result1"));
    const ref = "ipfs://data1";
    const signature = "0x1234"; // Dummy signature

    await auditTrail.connect(orchestrator).addAuditRecord(
      machine.address,
      hash,
      ref,
      signature
    );

    expect(await auditTrail.getAudiTrailLength()).to.equal(1);

    const entry = await auditTrail.getAuditRecord(0);
    expect(entry.machineAddress).to.equal(machine.address);
    expect(entry.outputHash).to.equal(hash);
    expect(entry.dataReference).to.equal(ref);
  });

  it("should reject if machine is not registered", async function () {
    const fake = await ethers.getImpersonatedSigner("0x000000000000000000000000000000000000dead");
    const hash = ethers.keccak256(ethers.toUtf8Bytes("result2"));
    const ref = "ipfs://data2";

    await expect(
      auditTrail.connect(orchestrator).addAuditRecord(fake.address, hash, ref, "0x00")
    ).to.be.revertedWith("Machine not registered");
  });
});