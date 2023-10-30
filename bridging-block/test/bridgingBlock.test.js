const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BridgingBlock Contract", function () {
  let contractOwner;
  let institution;
  let institution2;
  let student;
  let bridgingBlock;
  let requestIssue;

  beforeEach(async function () {
    [contractOwner, institution, institution2, student, requestIssue] =
      await ethers.getSigners();

    const BridgingBlock = await ethers.getContractFactory("BridgingBlock");
    bridgingBlock = await BridgingBlock.deploy();
    await bridgingBlock.deployed();
  });

  it("Should deploy the contract", async function () {
    expect(bridgingBlock.address).to.not.be.undefined;
  });

  it("Should set the contract owner", async function () {
    const ownerAddress = await bridgingBlock.contractOwner();
    expect(ownerAddress).to.equal(contractOwner.address);
  });

  it("Should register an institution", async function () {
    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);

    const institutionData = await bridgingBlock.getInstitution(
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
        .createRequestIssue("Institution 1");
      await bridgingBlock
        .connect(institution)
        .approveRequestIssue(institution.address);
    } catch (error) {
      expect(error.message).to.contain(
        "Only the contract owner can perform this action"
      );
    }
  });

  it("Should not allow duplicate institution registration", async function () {
    await bridgingBlock
      .connect(contractOwner)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);

    // Attempt to register the same institution again
    try {
      await bridgingBlock
        .connect(contractOwner)
        .createRequestIssue("Institution 2");
      await bridgingBlock
        .connect(contractOwner)
        .approveRequestIssue(institution.address);
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should generate a credential", async function () {
    // Create a request issue
    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");

    // Approve the request issue
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);

    expect(
      await bridgingBlock.isInstitutionRegistered(institution.address)
    ).to.equal(true);
    // Generate a credential for the student
    const studentName = "Alice";
    const studentID = 12345;
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const gpa = 38;

    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        studentName,
        studentID,
        degreeName,
        major,
        graduationDate,
        gpa
      );

    expect(await bridgingBlock.getTotalRegisteredStudents()).to.equal(1);
    expect(await bridgingBlock.getTotalRegisteredInstitutions()).to.equal(1);
  });

  it("Should not allow duplicate credential generation for a student", async function () {
    const studentName = "Alice";
    const studentID = 12345;
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const gpa = 38;

    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        studentName,
        studentID,
        degreeName,
        major,
        graduationDate,
        gpa
      );

    // Attempt to generate a credential for the same student again
    try {
      await bridgingBlock
        .connect(institution)
        .generateCredential(
          student.address,
          studentName,
          studentID,
          degreeName,
          major,
          graduationDate,
          gpa
        );
    } catch (error) {
      expect(error.message).to.contain("revert");
    }
  });

  it("Should unregister an institution", async function () {
    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);

    expect(await bridgingBlock.getTotalRegisteredInstitutions()).to.equal(1);
    await bridgingBlock
      .connect(contractOwner)
      .unregisterInstitution(institution.address);
    const institutionData = await bridgingBlock.getInstitution(
      institution.address
    );
    expect(institutionData.isRegistered).to.equal(false);
    expect(await bridgingBlock.getTotalRegisteredInstitutions()).to.equal(0);
  });

  it("Should not allow non-owner to unregister an institution", async function () {
    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);

    // Attempt to unregister an institution by a non-owner
    try {
      await bridgingBlock
        .connect(institution)
        .unregisterInstitution(institution.address);
    } catch (error) {
      expect(error.message).to.contain(
        "Only the contract owner can perform this action"
      );
    }
  });

  it("Should delete a student credential", async function () {
    const studentName = "Alice";
    const studentID = 12345;
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const gpa = 38;

    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        studentName,
        studentID,
        degreeName,
        major,
        graduationDate,
        gpa
      );

    expect(await bridgingBlock.getTotalRegisteredStudents()).to.equal(1);
    expect(await bridgingBlock.isStudentRegistered(student.address)).to.equal(
      true
    );
    // Delete the student credential
    await bridgingBlock.connect(institution).deleteCredential(student.address);
    expect(await bridgingBlock.getTotalRegisteredStudents()).to.equal(0);
    expect(await bridgingBlock.isStudentRegistered(student.address)).to.equal(
      false
    );
  });
  // ====================================================================================================
  it("Should not allow a non-institution to delete a student credential", async function () {
    // Attempt to delete a student credential by a non-institution
    try {
      await bridgingBlock
        .connect(institution)
        .deleteCredential(student.address);
    } catch (error) {
      expect(error.message).to.contain(
        "Only registered universities can perform this action"
      );
    }
  });

  it("Should retrieve a student credential", async function () {
    const studentName = "Alice";
    const studentID = 12345;
    const degreeName = "Computer Science";
    const major = "Blockchain";
    const graduationDate = 2023;
    const gpa = 38;

    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);
    await bridgingBlock
      .connect(institution)
      .generateCredential(
        student.address,
        studentName,
        studentID,
        degreeName,
        major,
        graduationDate,
        gpa
      );

    const [
      retrievedStudentName,
      retrievedStudentID,
      retrievedDegreeName,
      retrievedMajor,
      retrievedGraduationDate,
      retrievedgpa,
    ] = await bridgingBlock.getCredential(student.address);

    expect(retrievedStudentName).to.equal(studentName);
    expect(retrievedStudentID).to.equal(studentID);
    expect(retrievedDegreeName).to.equal(degreeName);
    expect(retrievedMajor).to.equal(major);
    expect(retrievedGraduationDate).to.equal(graduationDate);
    expect(retrievedgpa).to.equal(gpa);
  });

  it("Should retrieve institution details", async function () {
    const institutionName = "Institution 1";

    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);

    const [retrievedName, retrievedIsRegistered] =
      await bridgingBlock.getInstitution(institution.address);

    expect(retrievedName).to.equal(institutionName);
    expect(retrievedIsRegistered).to.equal(true);
  });

  it("Should retrieve names of all registered institutions", async function () {
    const institutionName1 = "Institution 1";
    const institutionName2 = "Institution 2";

    await bridgingBlock
      .connect(institution)
      .createRequestIssue("Institution 1");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution.address);
    await bridgingBlock
      .connect(institution2)
      .createRequestIssue("Institution 2");
    await bridgingBlock
      .connect(contractOwner)
      .approveRequestIssue(institution2.address);

    const institutionNames =
      await bridgingBlock.getAllRegisteredInstitutionNames();

    expect(institutionNames).to.have.lengthOf(2);
    expect(institutionNames[0]).to.equal(institutionName1);
    expect(institutionNames[1]).to.equal(institutionName2);
  });
});
