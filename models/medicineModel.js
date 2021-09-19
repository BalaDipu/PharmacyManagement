const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A medicine must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'the maximum length of the name must be below 50']
      // validate: [validator.isAlpha, 'Medicine name must only contain characters']
    },
    companyName: {
      type: String,
      required: [true, 'A medicine must have a company name'],
      maxlength: [50, 'the maximum length of the company name must be below 50'],
      minlength: [5, 'the minimum length of the company name must be higher than 5']
      // validate: [validator.isAlpha, 'Medicine name must only contain characters']
    },
    slug: {
      type: String
    },
    group: {
      type: String,
      required: [true, 'A medicine must have a group']
    },
    expirationDate: {
      type: Date,
      required: [true, 'A medicine must have  expiration date']
    },
    weightOfDrug: {
      type: String,
      required: [true, 'A medicine must have weight'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'the ratig must be below 5'],
      min: [1, 'the rating must be avobe 1'],
      set: val => Math.round(val * 10) / 10 //4.66666666......val=5..but vail*10=47/10=4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A medicine must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below of the regular price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretMedicine: {
      type: Boolean,
      default: false
    }
    // availableShop: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Shop'
    //   }
    // ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// medicineSchema.index({ ratingsAverage: 1 });
medicineSchema.index({ price: 1, ratingsAverage: 1 });
medicineSchema.index({ slug: 1 });
// medicineSchema.virtual('durationWeeks').get(function() {
//   return this.duration / 7;
// });

medicineSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'medicine',
  localField: '_id'
});

//document middleware
medicineSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//query middleware
medicineSchema.pre(/^find/, function(next) {
  this.find({ secretMedicine: { $ne: true } });
  this.start = Date.now();
  next();
});

// medicineSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'availableShop',
//     select: '-__v -passwordChangedAt'
//   });
//   next();
// });
medicineSchema.post(/^find/, function(docs, next) {
  console.log(`the query took ${Date.now() - this.start} millisecond`);
  // console.log(docs);
  next();
});

//aggregation middleware
medicineSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretMedicine: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Medicine = mongoose.model('Medicine', medicineSchema);
module.exports = Medicine;
