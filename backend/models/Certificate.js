import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  recipientName: {
    type: String,
    required: true,
    trim: true
  },
  recipientEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed
  },
  pdfUrl: {
    type: String,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ templateId: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
