const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// aggregateはpromiseを返す
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // thisはcurrent Modelを指す。aggregateは常にmodel上で呼ぶ
  const stats = await this.aggregate([
    {
      //Reviewsのdatabaseの中からこのtourIdをもつreviewを絞り込む
      $match: { tour: tourId },
    },
    {
      // _idは、グループ化したいdocumentに共通するフィールドで、ここでもツアーになります。
      $group: {
        _id: '$tour',
        // ツアーごとに1つずつ追加していくだけなので、前のstapでマッチングした各ツアーが対象です。
        // ex) tourに5個レビューがあったなら、5個のreview documentがあり、ratingsは5になる
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// POSTによって新しいレビューが作成された後に呼び出します。
reviewSchema.post('save', function () {
  // thisは現在のdocumentで、コンストラクタは基本的にそのドキュメントを作成したモデル(Review)である。
  // calcAverageRatingsはモデル上で呼ぶ
  // Second this points to current review
  this.constructor.calcAverageRatings(this.tour);
  // なぜnextがいらないかは、udemy 168参照
});
/*
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // thisはcurrent query。goalはreview documentを取得したい
  // this.rは現在のdocument。1つ上の行のthisに該当する
  this.r = await this.findOne();
  console.log(this.r);
  next();
});
*/
// reviewが更新や削除されたときにもツアーのreview情報が更新される
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.tour);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
