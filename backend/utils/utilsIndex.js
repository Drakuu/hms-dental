// utils/utilsIndex.js

const generateUniqueUserId = require("./generateUniqueUserId.utils");
const generateUniqueDoctorId = require("./generateUniqueDoctorId");
const generateUniqueMrNo = require("./generateUniqueMrNo");  
const generateUniqueAdmissionNo = require("./generaetUniqueAdmissionNo");
const generateUniqueToken = require("./generateUniqueToken");
const generateUniqueId = require("./generateUniqueId");
const generateUniqueStaffId = require("./generateUniqueStaffId");
const generateDepartmentToken =require("./generateDepartmentToken")

const utils = {
  generateUniqueUserId,
  generateUniqueDoctorId,
  generateUniqueMrNo,
  generateUniqueAdmissionNo,
  generateUniqueToken,
  generateUniqueId,
  generateUniqueStaffId,
  generateDepartmentToken,
  
};

module.exports = utils;
