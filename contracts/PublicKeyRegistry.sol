// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract PublicKeyRegistry {
    struct Machine {
        bytes32 publicKeyHash; // SHA256 of TLS publicKey
        bytes32 attestationHash; //attestation token hash
        bool alreadyRegistered; // true = machine is registered
    }

    mapping(address => Machine) public machines;
    address public orchestrator;

    event MachineRegistered(address indexed machineAddress, bytes32 publicKeyHash, bytes32 attestationHash);
    event MachineDeactivated(address indexed machineAddress);

    modifier onlyOrchestrator(){
        require(msg.sender==orchestrator, "Only orchestrator allowed");
        _;
    }

    constructor(){
        orchestrator = msg.sender;
    }

    function registerMachine(
        address machineAddress,
        bytes32 publicKeyHash,
        bytes32 attestationHash
    ) external onlyOrchestrator {
        require(!machines[machineAddress].alreadyRegistered, "Already registered");

        machines[machineAddress]=Machine({
            publicKeyHash: publicKeyHash,
            attestationHash: attestationHash,
            alreadyRegistered: true
        });
        emit MachineRegistered(machineAddress, publicKeyHash, attestationHash);
    }

    function deactivateMachine(address machineAddress) external onlyOrchestrator{
        require(machines[machineAddress].alreadyRegistered, "Not registered");
        machines[machineAddress].alreadyRegistered = false;
        emit MachineDeactivated(machineAddress);
    }


    function getPublicKeyHash(address machineAddress) public view returns (bytes32) {
        return machines[machineAddress].publicKeyHash;
    }

    function isMachineActive(address machineAddress) public view returns (bool) {
        return machines[machineAddress].alreadyRegistered;
    }

    function getAttestationHash(address machineAddress) public view returns (bytes32) {
        return machines[machineAddress].attestationHash;
    }
}