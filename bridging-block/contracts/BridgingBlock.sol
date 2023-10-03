// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BridgingBlock {
    address public contractOwner;

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

    struct Institution {
        string name;
        bool isRegistered;
    }

    mapping(address => Credential) public studentCredentials;
    mapping(address => Institution) public institutions;

    address[] public institutionAddresses; // Store registered institution addresses

    event InstitutionRegistered(address indexed institutionAddress, string name);
    event CredentialGenerated(address indexed studentAddress, bytes32 studentName);
    event InstitutionUnregistered(address indexed institutionAddress);
    event CredentialDeleted(address indexed studentAddress);

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Only the contract owner can perform this action");
        _;
    }

    modifier onlyRegisteredInstitution() {
        require(institutions[msg.sender].isRegistered, "Only registered universities can perform this action");
        _;
    }

    // Constructor to set the contract owner
    constructor() {
        contractOwner = msg.sender;
    }

    function registerInstitution(address institutionAddress, string memory institutionName) public onlyContractOwner {
        require(!institutions[institutionAddress].isRegistered, "Institution is already registered");
        institutions[institutionAddress] = Institution(institutionName, true);
        institutionAddresses.push(institutionAddress);
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

    function unregisterInstitution(address institutionAddress) public onlyContractOwner {
        require(institutions[institutionAddress].isRegistered, "Institution is not registered");
        delete institutions[institutionAddress];
        emit InstitutionUnregistered(institutionAddress);
        removeInstitutionAddress(institutionAddress);
    }

    function deleteCredential(address studentAddress) public onlyRegisteredInstitution {
        require(studentCredentials[studentAddress].studentName != 0, "Credential does not exist for this student");
        delete studentCredentials[studentAddress];
        emit CredentialDeleted(studentAddress);
    }

    // Get institution details
    function getInstitution(address institutionAddress) public view returns (
        string memory name,
        bool isRegistered
    ) {
        Institution storage institution = institutions[institutionAddress];
        return (
            institution.name,
            institution.isRegistered
        );
    }
    //Get student credential details
    function getCredential(address studentAddress) public view returns (
    bytes32 studentName,
    bytes32 studentID,
    bytes32 degreeName,
    bytes32 major,
    uint256 graduationDate,
    bytes32 GPA,
    bytes32 transcript,
    bytes32 issuerSignature
) {
    Credential storage credential = studentCredentials[studentAddress];
    return (
        credential.studentName,
        credential.studentID,
        credential.degreeName,
        credential.major,
        credential.graduationDate,
        credential.GPA,
        credential.transcript,
        credential.issuerSignature
    );
    }
    // Function to retrieve names of all registered institutions
    function getAllRegisteredInstitutionNames() public view returns (string[] memory) {
        uint256 totalInstitutions = institutionAddresses.length;
        string[] memory institutionNames = new string[](totalInstitutions);

        for (uint256 i = 0; i < totalInstitutions; i++) {
            address institutionAddress = institutionAddresses[i];
            institutionNames[i] = institutions[institutionAddress].name;
        }

        return institutionNames;
    }

    // Internal function to remove an institution address from the list of registered institutions
    function removeInstitutionAddress(address institutionAddress) internal {
        uint256 totalInstitutions = institutionAddresses.length;

        for (uint256 i = 0; i < totalInstitutions; i++) {
            if (institutionAddresses[i] == institutionAddress) {
                institutionAddresses[i] = institutionAddresses[totalInstitutions - 1];
                institutionAddresses.pop();
                break;
            }
        }
    }
}
