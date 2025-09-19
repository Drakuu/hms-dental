const User = require("./user.model");
const Doctor = require("./doctor.model");
const Patient = require("./patient.model");
const staff = require("./staff.model");
const Department = require("./department.model");
const counter = require("./counter.model");
const Refund = require("./refundopd.model");
const Appointment = require("./appointment.model");
const Procedure = require("./procedure.model")
const Product = require("./product.model")
const Billing = require("./billing.model")


const Hospital = {
    User,
    Doctor,
    Patient,
    staff,
    Department,
    counter,
    Refund,
    Appointment,
    Procedure,
    Product,
    Billing
};

module.exports = Hospital;
