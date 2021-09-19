const mongoose = require('mongoose');
const Medicine = require('./medicineModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    medicine: {
      type: mongoose.Schema.ObjectId,
      ref: 'Medicine',
      required: [true, 'Review must belong to a medicine']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
reviewSchema.index({ medicine: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  //   this.populate({
  //     path: 'medicine',
  //     select: 'name'
  //   })
  this.populate({
    path: 'user',
    select: 'name'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(medicineId) {
  const stats = await this.aggregate([
    {
      $match: { medicine: medicineId }
    },
    {
      $group: {
        _id: '$medicine',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  await Medicine.findByIdAndUpdate(medicineId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.medicine);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  // this.r = await this.findOne() does not work here
  this.r.constructor.calcAverageRatings(this.r.medicine);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
