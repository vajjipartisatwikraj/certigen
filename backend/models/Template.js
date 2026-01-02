import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    unique: true,
    required: true
  },
  templateName: {
    type: String,
    required: true,
    trim: true
  },
  imagePath: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  textFields: [{
    fieldId: {
      type: String,
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    width: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    height: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    fontSize: {
      type: Number,
      default: 48,
      min: 12,
      max: 200
    },
    fontFamily: {
      type: String,
      default: 'Arial'
    },
    fontWeight: {
      type: String,
      default: 'bold',
      enum: ['normal', 'bold', 'bolder', 'lighter']
    },
    alignment: {
      type: String,
      default: 'center',
      enum: ['left', 'center', 'right']
    },
    color: {
      type: String,
      default: '#000000'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Template = mongoose.model('Template', templateSchema);

export default Template;
