
const user = require("./user.controller");
const doctor = require("./doctor.controller");
const patient = require("./patient.controller");
const appointment = require("./appointment.controller");
const staff = require("./staff.controller");
const Department = require("./departments.controller");
const Refund = require("./refundOpd.controller");
const Summary = require("./summary.controller");
const Procedure = require("./procedure.controller")
const Product = require("./product.controller")
const Billing = require("./billing.controller")

const controller = {
  user,
  doctor,
  patient,
  appointment,
  staff,
  Department,
  Refund,
  Summary,
  Procedure,
  Product,
  Billing
};

module.exports = controller;
