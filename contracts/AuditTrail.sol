// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IPublicKeyRegistry{
    function isMachineActive(address machineAddress) external view returns (bool);
}

contract AuditTrail {
    struct AuditRecord{
        address machineAddress; 
        bytes32 outputHash; //SHA256 hash of output 
        uint256 timestamp; //time of record
        string dataReference; //link to bucket
        bytes signature; //signature of each machine
        bytes32 attestationHash; //hash of attestation token 
    }

    AuditRecord[] public auditTrail;
    IPublicKeyRegistry public registry;
    address public orchestrator;

    event AuditEntryStored(
        uint256 indexed index,
        address indexed machineAddress,
        bytes32 outputHash,
        uint256 timestamp,
        string dataReference,
        bytes32 attestationHash
    );

    modifier onlyOrchestrator(){
        require(msg.sender==orchestrator, "Only orchestrator allowed");
        _;
    }

    constructor(address _registry){
        registry = IPublicKeyRegistry(_registry);
        orchestrator = msg.sender;
    }

    function addAuditRecord(
        address machineAddress,
        bytes32 outputHash,
        string memory dataReference,
        bytes memory signature,
        bytes32 attestationHash
        ) external onlyOrchestrator{
        require(registry.isMachineActive(machineAddress), "Machine not registered");

        AuditRecord memory entry = AuditRecord({
            machineAddress: machineAddress,
            outputHash: outputHash,
            timestamp: block.timestamp,
            dataReference: dataReference,
            signature: signature,
            attestationHash: attestationHash
        });

        auditTrail.push(entry);

        emit AuditEntryStored(
            auditTrail.length-1,
            machineAddress,
            outputHash,
            block.timestamp,
            dataReference,
            attestationHash
        );
    }

    function getAuditTrailLength() public view returns(uint256){
        return auditTrail.length;
    }

    function getAuditRecord(uint256 index) public view returns (AuditRecord memory) {
        require(index<auditTrail.length, "Invalid index");
        return auditTrail[index];
    }

    function getDataReference(uint256 index) public view returns (string memory) {
        require(index < auditTrail.length, "Invalid index");
        return auditTrail[index].dataReference;
    }


}





