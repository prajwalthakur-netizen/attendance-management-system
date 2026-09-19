const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // stored as 'YYYY-MM-DD' for easy querying/grouping
      required: true,
    },
    punchIn: {
      time: { type: Date },
      selfieUrl: { type: String },
      location: locationSchema,
    },
    punchOut: {
      time: { type: Date },
      selfieUrl: { type: String },
      location: locationSchema,
    },
    totalWorkingHours: {
      type: Number, // in hours, decimal
      default: 0,
    },
    status: {
      type: String,
      enum: ['Incomplete', 'Completed'],
      default: 'Incomplete',
    },
    validation: {
      status: {
        type: String,
        enum: ['Pending', 'Valid', 'Invalid'],
        default: 'Pending',
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      remarks: {
        type: String,
        default: '',
      },
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance record for same employee on same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);