const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// このルートは、クライアントがチェックアウトセッションを取得するためだけのもの
// :tourIDは、チェックアウトセッションに、ツアー名やツアー料金など必要なデータをすべて入力するため必要
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.isOwner, bookingController.deleteBooking);

module.exports = router;
