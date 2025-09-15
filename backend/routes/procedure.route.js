// routes/procedure.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/index.controller');
const { passportAuth, checkRole, doctorOnly } = require('../middleware/index.middleware');

// Create a new procedure
router.post('/procedures', controller.Procedure.createProcedure);

// Get procedures by patient MR Number
router.get('/patient/:patient_MRNo', controller.Procedure.getProceduresByMRNo);

// Get all procedures with filtering
router.get('/procedures', controller.Procedure.getAllProcedures);

// Update procedure
router.put('/procedures/:procedureId', controller.Procedure.updateProcedure);

// Delete procedure
router.delete('/procedures/:procedureId', controller.Procedure.deleteProcedure);

module.exports = router;