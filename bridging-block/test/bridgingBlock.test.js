const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BridgingBlock Contract", function () {
  let owner;
  let institution;
  let student;
  let bridgingBlock;

  beforeEach(async function () {
    [owner, institution, student] = await ethers.getSigners();

    const BridgingBlock = await ethers.getContractFactory("BridgingBlock");
    bridgingBlock = await BridgingBlock.deploy();
    await bridgingBlock.deployed();
  });

  it("Should deploy the contract", async function () {
    expect(bridgingBlock.address).to.not.be.undefined;
  });

  it("Should set the contract owner", async function () {
    const contractOwner = await bridgingBlock.contractOwner();
    expect(contractOwner).to.equal(owner.address);
  });

  it("Should register an institution", async function () {
    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");
    const institutionData = await bridgingBlock.institutions(
      institution.address
    );
    expect(institutionData.name).to.equal("Institution 1");
    expect(institutionData.isRegistered).to.equal(true);
  });

  it("should not allow a non-owner to register an institution", async function () {
    // Attempt to register an institution by a non-owner
    try {
      await bridgingBlock
        .connect(institution)
        .registerInstitution(owner.address, "Institution 2");
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should not allow duplicate institution registration", async function () {
    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");

    // Attempt to register the same institution again
    try {
      await bridgingBlock
        .connect(owner)
        .registerInstitution(institution.address, "Institution 2");
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should generate a credential", async function () {
    const studentName = "Alice";
    const studentID = "12345";
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const GPA = "3.8";
    const transcript = "Hash of the transcript";
    const issuerSignature = "Hash of the issuer signature";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        ethers.utils.formatBytes32String(studentName),
        ethers.utils.formatBytes32String(studentID),
        ethers.utils.formatBytes32String(degreeName),
        ethers.utils.formatBytes32String(major),
        graduationDate,
        ethers.utils.formatBytes32String(GPA),
        ethers.utils.formatBytes32String(transcript),
        ethers.utils.formatBytes32String(issuerSignature)
      );

    const credentialData = await bridgingBlock.studentCredentials(
      student.address
    );
    expect(credentialData.studentName).to.equal(
      ethers.utils.formatBytes32String(studentName)
    );
    expect(credentialData.studentID).to.equal(
      ethers.utils.formatBytes32String(studentID)
    );
    expect(credentialData.degreeName).to.equal(
      ethers.utils.formatBytes32String(degreeName)
    );
    expect(credentialData.major).to.equal(
      ethers.utils.formatBytes32String(major)
    );
    expect(credentialData.graduationDate).to.equal(graduationDate);
    expect(credentialData.GPA).to.equal(ethers.utils.formatBytes32String(GPA));
    expect(credentialData.transcript).to.equal(
      ethers.utils.formatBytes32String(transcript)
    );
    expect(credentialData.issuerSignature).to.equal(
      ethers.utils.formatBytes32String(issuerSignature)
    );
  });

  it("Should not allow duplicate credential generation for a student", async function () {
    const studentName = "Alice";
    const studentID = "12345";
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const GPA = "3.8";
    const transcript = "Hash of the transcript";
    const issuerSignature = "Hash of the issuer signature";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        ethers.utils.formatBytes32String(studentName),
        ethers.utils.formatBytes32String(studentID),
        ethers.utils.formatBytes32String(degreeName),
        ethers.utils.formatBytes32String(major),
        graduationDate,
        ethers.utils.formatBytes32String(GPA),
        ethers.utils.formatBytes32String(transcript),
        ethers.utils.formatBytes32String(issuerSignature)
      );

    // Attempt to generate a credential for the same student again
    try {
      await bridgingBlock
        .connect(institution)
        .generateCredential(
          student.address,
          ethers.utils.formatBytes32String(studentName),
          ethers.utils.formatBytes32String(studentID),
          ethers.utils.formatBytes32String(degreeName),
          ethers.utils.formatBytes32String(major),
          graduationDate,
          ethers.utils.formatBytes32String(GPA),
          ethers.utils.formatBytes32String(transcript),
          ethers.utils.formatBytes32String(issuerSignature)
        );
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should unregister an institution", async function () {
    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");
    await bridgingBlock
      .connect(owner)
      .unregisterInstitution(institution.address);
    const institutionData = await bridgingBlock.institutions(
      institution.address
    );
    expect(institutionData.isRegistered).to.equal(false);
  });

  it("Should not allow non-owner to unregister an institution", async function () {
    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");

    // Attempt to unregister an institution by a non-owner
    try {
      await bridgingBlock
        .connect(institution)
        .unregisterInstitution(institution.address);
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should delete a student credential", async function () {
    const studentName = "Alice";
    const studentID = "12345";
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const GPA = "3.8";
    const transcript = "Hash of the transcript";
    const issuerSignature = "Hash of the issuer signature";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        ethers.utils.formatBytes32String(studentName),
        ethers.utils.formatBytes32String(studentID),
        ethers.utils.formatBytes32String(degreeName),
        ethers.utils.formatBytes32String(major),
        graduationDate,
        ethers.utils.formatBytes32String(GPA),
        ethers.utils.formatBytes32String(transcript),
        ethers.utils.formatBytes32String(issuerSignature)
      );

    // Ensure the credential exists before deletion
    const initialCredentialData = await bridgingBlock.studentCredentials(
      student.address
    );
    expect(initialCredentialData.studentName).to.equal(
      ethers.utils.formatBytes32String(studentName)
    );

    // Delete the student credential
    await bridgingBlock.connect(institution).deleteCredential(student.address);

    // Check if the credential is deleted
    const updatedCredentialData = await bridgingBlock.studentCredentials(
      student.address
    );
    expect(updatedCredentialData.studentName).to.equal(
      ethers.utils.formatBytes32String("")
    );
  });

  it("Should not allow a non-institution to delete a student credential", async function () {
    // Attempt to delete a student credential by a non-institution
    try {
      await bridgingBlock.connect(owner).deleteCredential(student.address);
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should retrieve a student credential", async function () {
    const studentName = "Alice";
    const studentID = "12345";
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const GPA = "3.8";
    const transcript = "Hash of the transcript";
    const issuerSignature = "Hash of the issuer signature";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, "Institution 1");
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        ethers.utils.formatBytes32String(studentName),
        ethers.utils.formatBytes32String(studentID),
        ethers.utils.formatBytes32String(degreeName),
        ethers.utils.formatBytes32String(major),
        graduationDate,
        ethers.utils.formatBytes32String(GPA),
        ethers.utils.formatBytes32String(transcript),
        ethers.utils.formatBytes32String(issuerSignature)
      );

    const [
      retrievedStudentName,
      retrievedStudentID,
      retrievedDegreeName,
      retrievedMajor,
      retrievedGraduationDate,
      retrievedGPA,
      retrievedTranscript,
      retrievedIssuerSignature,
    ] = await bridgingBlock.getCredential(student.address);

    expect(retrievedStudentName).to.equal(
      ethers.utils.formatBytes32String(studentName)
    );
    expect(retrievedStudentID).to.equal(
      ethers.utils.formatBytes32String(studentID)
    );
    expect(retrievedDegreeName).to.equal(
      ethers.utils.formatBytes32String(degreeName)
    );
    expect(retrievedMajor).to.equal(ethers.utils.formatBytes32String(major));
    expect(retrievedGraduationDate).to.equal(graduationDate);
    expect(retrievedGPA).to.equal(ethers.utils.formatBytes32String(GPA));
    expect(retrievedTranscript).to.equal(
      ethers.utils.formatBytes32String(transcript)
    );
    expect(retrievedIssuerSignature).to.equal(
      ethers.utils.formatBytes32String(issuerSignature)
    );
  });

  it("Should retrieve institution details", async function () {
    const institutionName = "Institution 1";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, institutionName);

    const [retrievedName, retrievedIsRegistered] =
      await bridgingBlock.getInstitution(institution.address);

    expect(retrievedName).to.equal(institutionName);
    expect(retrievedIsRegistered).to.equal(true); // Assuming it's registered
  });

  it("Should retrieve names of all registered institutions", async function () {
    const institutionName1 = "Institution 1";
    const institutionName2 = "Institution 2";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, institutionName1);
    await bridgingBlock
      .connect(owner)
      .registerInstitution(student.address, institutionName2);

    const institutionNames =
      await bridgingBlock.getAllRegisteredInstitutionNames();

    expect(institutionNames).to.have.lengthOf(2);
    expect(institutionNames[0]).to.equal(institutionName1);
    expect(institutionNames[1]).to.equal(institutionName2);
  });

  it("Should remove an institution address from the list", async function () {
    const institutionName = "Institution 1";

    await bridgingBlock
      .connect(owner)
      .registerInstitution(institution.address, institutionName);
    const initialInstitutionCount = (await bridgingBlock.institutionAddresses())
      .length;

    await bridgingBlock
      .connect(owner)
      .unregisterInstitution(institution.address);
    const updatedInstitutionCount = (await bridgingBlock.institutionAddresses())
      .length;

    expect(initialInstitutionCount).to.equal(1);
    expect(updatedInstitutionCount).to.equal(0);
  });
});
