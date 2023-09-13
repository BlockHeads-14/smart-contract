// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract BridgingBlock {
    address public contractOwner;
    
    struct Institution {
        string name;
        bool isRegistered;
    }
    
    struct Credential {
        bytes32 studentName;
        bytes32 studentID;
        bytes32 degreeName;
        bytes32 major;
        uint256 graduationDate;
        bytes32 GPA;
        bytes32 transcript;
        bytes32 issuerSignature;
    }
    
    mapping(address => Institution) public institutions;
    mapping(address => Credential) public studentCredentials;

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only the contract owner can perform this action");
        _;
    }
    
    modifier onlyRegisteredInstitution() {
        require(institutions[msg.sender].isRegistered, "Only registered universities can generate credentials");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    function registerInstitution(address institutionAddress, string memory institutionName) public onlyContractOwner {
        institutions[institutionAddress] = Institution(institutionName, true);
    }

    function generateCredential(
        address studentAddress,
        bytes32 studentName,
        bytes32 studentID,
        bytes32 degreeName,
        bytes32 major,
        uint256 graduationDate,
        bytes32 GPA,
        bytes32 transcript,
        bytes32 issuerSignature
    ) public onlyRegisteredInstitution {
        Credential memory newCredential = Credential(
            studentName,
            studentID,
            degreeName,
            major,
            graduationDate,
            GPA,
            transcript,
            issuerSignature
        );

        studentCredentials[studentAddress] = newCredential;
    }
}
