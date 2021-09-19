const express = require('express');
const medicineController = require('./../controllers/medicineController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();
//POST /tour/1234asfsdsgd/reviews
//GET /tour/12134245asdffg/reviews
router.use('/:medicineId/reviews', reviewRouter);

// router.param('id', medicineController.checkID);
router
  .route('/top-5-cheap')
  .get(medicineController
  .aliasTopMedicines, medicineController
  .getAllMedicines);
router.route('/medicines-stats').get(medicineController
.getMedicineStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    medicineController
  .getMonthlyPlan
  );
router
  .route('/')
  .get(medicineController
  .getAllMedicines)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    medicineController
  .createMedicine
  );

router
  .route('/:id')
  .get(medicineController
  .getMedicine)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    medicineController
  .updateMedicine
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    medicineController
  .deleteMedicine
  );

module.exports = router;
