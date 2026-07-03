const mongoose = require('mongoose');
const slugify = require('slugify');

const majorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '专业名称不能为空'],
      trim: true,
    },
    slug: { type: String, unique: true },
    code: { type: String, default: '' },
    level: {
      type: String,
      enum: ['门类', '专业类', '专业'],
      required: [true, '层级不能为空'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major',
      default: null,
    },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate slug
majorSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true, locale: 'zh' });
    if (!baseSlug || /^\d+$/.test(baseSlug)) {
      baseSlug = 'major-' + (baseSlug || Date.now());
    }
    this.slug = baseSlug;
  }
  next();
});

majorSchema.index({ level: 1 });
majorSchema.index({ parent: 1 });
majorSchema.index({ category: 1, level: 1 });
majorSchema.index({ name: 1 });

module.exports = mongoose.model('Major', majorSchema);
