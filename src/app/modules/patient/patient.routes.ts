import express from 'express';
import { PatientController } from './patient.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { PatientValidation } from './patient.validation';

const router = express.Router();

router.get(
  '/',
  auth(UserRole.PATIENT, UserRole.ADMIN),
  validateRequest(PatientValidation.patientFilterValidationSchema),
  PatientController.getAllPatients
);

router.get(
  '/:id',
  auth(UserRole.PATIENT, UserRole.ADMIN, UserRole.PATIENT),
  PatientController.getPatientById
);

router.patch(
  '/:id',
  auth(UserRole.PATIENT, UserRole.ADMIN, UserRole.PATIENT),
  validateRequest(PatientValidation.patientUpdateValidationSchema),
  PatientController.updatePatient
);

router.delete(
  '/soft/:id',
  auth(UserRole.PATIENT, UserRole.ADMIN),
  PatientController.deletePatient
);

export const PatientRoutes = router;