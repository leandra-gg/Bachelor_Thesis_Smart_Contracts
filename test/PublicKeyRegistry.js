// test/PublicKeyRegistry.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PublicKeyRegistry", function () {
  let deployer, machine;
  let registry;

  beforeEach(async function () {
    [deployer, machine] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("PublicKeyRegistry");
    registry = await Registry.connect(deployer).deploy();
    await registry.waitForDeployment();
  });

  it("should start with machine inactive", async function () {
    expect(await registry.isMachineActive(machine.address)).to.equal(false);
  });

  it("should allow machine registration", async function () {
    const fakePubKeyHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
    await registry.connect(deployer).registerMachine(machine.address, fakePubKeyHash);
    expect(await registry.isMachineActive(machine.address)).to.equal(true);
    expect(await registry.getPublicKeyHash(machine.address)).to.equal(fakePubKeyHash);
  });

  it("should not activate random addresses by default", async function () {
    const random = "0x000000000000000000000000000000000000c0fe";
    expect(await registry.isMachineActive(random)).to.equal(false);
  });
});

