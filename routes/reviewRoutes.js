const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    // すべてのレビューの更新を一般ユーザーもできてしまうと困るので、自分の投稿したレビューだけ変更できるようにする
    // udemy 165コメント欄参照
    authController.restrictTo('user', 'admin'),
    reviewController.isOwner,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.isOwner,
    reviewController.deleteReview
  );

module.exports = router;
