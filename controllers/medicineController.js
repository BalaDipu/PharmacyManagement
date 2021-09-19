// const appError = require('../utils/appError');
const Medicine = require('./../models/medicineModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const factory = require('./factoryController');

exports.aliasTopMedicines = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllMedicines = factory.getAll(Medicine);
exports.getMedicine = factory.getOne(Medicine, { path: 'reviews' });
exports.createMedicine = factory.createOne(Medicine);
exports.updateMedicine = factory.updateOne(Medicine);
exports.deleteMedicine = factory.deleteOne(Medicine);

exports.getMedicineStats = catchAsync(async (req, res, next) => {
  const stats = await Medicine.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numMedicine: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Medicine.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numMedicineStarts: { $sum: 1 },
        medicines: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numMedicineStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
// ////////////////ager ta niche
// // const fs = require('fs');
// const Tour = require('./../models/tourModel');
// // const tours = JSON.parse(
// //   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// // );

// // exports.checkID = (req, res, next, val) => {
// //   console.log(`Tour id is: ${val}`);

// //   if (req.params.id * 1 > tours.length) {
// //     return res.status(404).json({
// //       status: 'fail',
// //       message: 'Invalid ID'
// //     });
// //   }
// //   next();
// // };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);

//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime
//     // results: tours.length,
//     // data: {
//     //   tours
//     // }
//   });
// };

// exports.getTour = (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1;
//   //  const tour = tours.find(el => el.id === id);
//   // res.status(200).json({
//   //   status: 'success',
//   //   data: {
//   //     tour
//   //   }
//   // });
// };

// exports.createTour = (req, res) => {
//   res.status(201).json({
//     status: 'success'
//     // data: {
//     //   tour: newTour
//     // }
//   });
// };
// // console.log(req.body);
// // const newId = tours[tours.length - 1].id + 1;
// // const newTour = Object.assign({ id: newId }, req.body);

// // tours.push(newTour);

// // fs.writeFile(
// //   `${__dirname}/dev-data/data/tours-simple.json`,
// //   JSON.stringify(tours),
// //   err => {
// //     res.status(201).json({
// //       status: 'success',
// //       data: {
// //         tour: newTour
// //       }
// //     });
// //   }
// // );

// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated tour here...>'
//     }
//   });
// };

// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// };
