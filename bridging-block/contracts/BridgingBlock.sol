// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    event InstitutionRegistered(address indexed institutionAddress, string name);
    event CredentialGenerated(address indexed studentAddress, bytes32 studentName);

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only the contract owner can perform this action");
        _;
    }
    
    modifier onlyRegisteredInstitution() {
        require(institutions[msg.sender].isRegistered, "Only registered universities can generate credentials");
        _;
    }
    
    // Constructor to set the contract owner
    constructor() {
        contractOwner = msg.sender;
    }

    function registerInstitution(address institutionAddress, string memory institutionName) public onlyContractOwner {
        require(!institutions[institutionAddress].isRegistered, "Institution is already registered");
        institutions[institutionAddress] = Institution(institutionName, true);
        emit InstitutionRegistered(institutionAddress, institutionName);
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
        require(studentCredentials[studentAddress].studentName == 0, "Credential already generated for this student");
        
        Credential memory newCredential = Credential({
            studentName: studentName,
            studentID: studentID,
            degreeName: degreeName,
            major: major,
            graduationDate: graduationDate,
            GPA: GPA,
            transcript: transcript,
            issuerSignature: issuerSignature
        });

        studentCredentials[studentAddress] = newCredential;
        emit CredentialGenerated(studentAddress, studentName);
    }
    
    // Unregister an institution (onlyContractOwner or a different logic for who can do this)
    function unregisterInstitution(address institutionAddress) public onlyContractOwner {
        require(institutions[institutionAddress].isRegistered, "Institution is not registered");
        delete institutions[institutionAddress];
    }
}
