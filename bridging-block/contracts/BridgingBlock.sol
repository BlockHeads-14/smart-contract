// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract BridgingBlock {
    address public contractOwner;

    struct Credential {
        string studentName;
        uint256 studentID;
        string degreeName;
        string major;
        uint256 graduationDate;
        uint256 gpa;
        address issuerAddress;
    }

    struct Institution {
        string name;
        bool isRegistered;
    }

    struct requestIssue {
        string institutionName;
        address institutionAddress;
    }

    mapping(address => requestIssue) public requestIssueMap;
    mapping(address => Credential) public studentCredentials;
    mapping(address => Institution) public institutions;

    address[] public institutionAddresses; // Store registered institution addresses
    address[] public studentAddresses; // Store registered student addresses

    event InstitutionRegistered(
        address indexed institutionAddress,
        string name
    );
    event CredentialGenerated(
        address indexed studentAddress,
        string studentName
    );
    event InstitutionUnregistered(address indexed institutionAddress);
    event CredentialDeleted(address indexed studentAddress);

    modifier onlyContractOwner() {
        require(
            msg.sender == contractOwner,
            "Only the contract owner can perform this action"
        );
        _;
    }

    modifier onlyRegisteredInstitution() {
        require(
            institutions[msg.sender].isRegistered,
            "Only registered universities can perform this action"
        );
        _;
    }

    // Constructor to set the contract owner
    constructor() {
        contractOwner = msg.sender;
    }

    function createRequestIssue(string memory institutionName) public {
        require(
            !institutions[msg.sender].isRegistered,
            "Institution is already registered"
        );
        requestIssueMap[msg.sender] = requestIssue(institutionName, msg.sender);
    }

    function approveRequestIssue(
        address institutionAddress
    ) public onlyContractOwner {
        require(
            !institutions[institutionAddress].isRegistered,
            "Institution is already registered"
        );
        institutions[institutionAddress] = Institution(
            requestIssueMap[institutionAddress].institutionName,
            true
        );
        institutionAddresses.push(institutionAddress);
        delete requestIssueMap[institutionAddress];
        emit InstitutionRegistered(
            institutionAddress,
            requestIssueMap[institutionAddress].institutionName
        );
    }

    function rejectRequestIssue(
        address institutionAddress
    ) public onlyContractOwner {
        require(
            !institutions[institutionAddress].isRegistered,
            "Institution is already registered"
        );
        delete requestIssueMap[institutionAddress];
    }

    function generateCredential(
        address studentAddress,
        string memory studentName,
        uint256 studentID,
        string memory degreeName,
        string memory major,
        uint256 graduationDate,
        uint256 gpa
    ) public onlyRegisteredInstitution {
        require(
            bytes(studentCredentials[studentAddress].studentName).length == 0,
            "Credential already generated for this student"
        );

        Credential memory newCredential = Credential({
            studentName: studentName,
            studentID: studentID,
            degreeName: degreeName,
            major: major,
            graduationDate: graduationDate,
            gpa: gpa,
            issuerAddress: msg.sender
        });

        studentCredentials[studentAddress] = newCredential;
        studentAddresses.push(studentAddress);
        emit CredentialGenerated(studentAddress, studentName);
    }

    function unregisterInstitution(
        address institutionAddress
    ) public onlyContractOwner {
        require(
            institutions[institutionAddress].isRegistered,
            "Institution is not registered"
        );
        delete institutions[institutionAddress];
        emit InstitutionUnregistered(institutionAddress);
        removeInstitutionAddress(institutionAddress);
    }

    function deleteCredential(
        address studentAddress
    ) public onlyRegisteredInstitution {
        require(
            bytes(studentCredentials[studentAddress].studentName).length > 0,
            "Credential does not exist for this student"
        );
        delete studentCredentials[studentAddress];
        // delete student address form studentAddresses array
        uint256 totalStudents = studentAddresses.length;

        for (uint256 i = 0; i < totalStudents; i++) {
            if (studentAddresses[i] == studentAddress) {
                studentAddresses[i] = studentAddresses[totalStudents - 1];
                studentAddresses.pop();
                break;
            }
        }
        emit CredentialDeleted(studentAddress);
    }

    // Get institution details
    function getInstitution(
        address institutionAddress
    ) public view returns (string memory name, bool isRegistered) {
        Institution storage institution = institutions[institutionAddress];
        return (institution.name, institution.isRegistered);
    }

    //Get student credential details
    function getCredential(
        address studentAddress
    )
        public
        view
        returns (
            string memory,
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            address
        )
    {
        Credential storage credential = studentCredentials[studentAddress];
        return (
            credential.studentName,
            credential.studentID,
            credential.degreeName,
            credential.major,
            credential.graduationDate,
            credential.gpa,
            credential.issuerAddress
        );
    }

    // Function to retrieve names of all registered institutions
    function getAllRegisteredInstitutionNames()
        public
        view
        returns (string[] memory)
    {
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
                institutionAddresses[i] = institutionAddresses[
                    totalInstitutions - 1
                ];
                institutionAddresses.pop();
                break;
            }
        }
    }

    // Function to check if an institution is registered
    function isInstitutionRegistered(
        address institutionAddress
    ) public view returns (bool) {
        return institutions[institutionAddress].isRegistered;
    }

    // Function to check if a credential is generated for a student
    function isCredentialGenerated(
        address studentAddress
    ) public view returns (bool) {
        return bytes(studentCredentials[studentAddress].studentName).length > 0;
    }

    // Function to get the total number of registered institutions
    function getTotalRegisteredInstitutions() public view returns (uint256) {
        return institutionAddresses.length;
    }

    function getCredentialByStudentNameAndID(
        string memory studentName,
        uint256 studentID
    )
        public
        view
        returns (
            string memory,
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            address
        )
    {
        address studentAddress = findStudentByStudentNameAndID(
            studentName,
            studentID
        );
        return getCredential(studentAddress);
    }

    function findStudentByStudentNameAndID(
        string memory studentName,
        uint256 studentID
    ) public view returns (address) {
        uint256 studentCount = studentAddresses.length;
        for (uint256 i = 0; i < studentCount; i++) {
            address studentAddress = studentAddresses[i];
            Credential storage credential = studentCredentials[studentAddress];
            if (
                keccak256(abi.encodePacked(credential.studentName)) ==
                keccak256(abi.encodePacked(studentName)) &&
                credential.studentID == studentID
            ) {
                return studentAddress;
            }
        }
        return address(0);
    }

    // Function to check if a student is registered
    function isStudentRegistered(
        address studentAddress
    ) public view returns (bool) {
        return bytes(studentCredentials[studentAddress].studentName).length > 0;
    }

    //Function to get institution address by name
    function getInstitutionAddressByName(
        string memory name
    ) public view returns (address) {
        uint256 totalInstitutions = institutionAddresses.length;

        for (uint256 i = 0; i < totalInstitutions; i++) {
            address institutionAddress = institutionAddresses[i];
            if (
                keccak256(
                    abi.encodePacked(institutions[institutionAddress].name)
                ) == keccak256(abi.encodePacked(name))
            ) {
                return institutionAddress;
            }
        }

        return address(0);
    }

    // Function to get the total number of registered students
    function getTotalRegisteredStudents() public view returns (uint256) {
        return studentAddresses.length;
    }
}
