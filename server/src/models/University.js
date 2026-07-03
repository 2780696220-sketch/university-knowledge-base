const mongoose = require('mongoose');
const slugify = require('slugify');

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '院校名称不能为空'],
      unique: true,
      trim: true,
    },
    slug: { type: String, unique: true },
    logoUrl: { type: String, default: '' },
    province: { type: String, required: [true, '省份不能为空'] },
    city: { type: String, default: '' },
    type: {
      type: String,
      enum: ['综合', '理工', '师范', '医药', '农林', '财经', '政法', '体育', '艺术', '民族', '语言', '军事'],
      required: [true, '院校类型不能为空'],
    },
    level: {
      type: String,
      enum: ['本科', '专科'],
      required: [true, '办学层次不能为空'],
    },
    website: { type: String, default: '' },
    is985: { type: Boolean, default: false },
    is211: { type: Boolean, default: false },
    isDoubleFirstClass: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    ranking: { type: Number, default: null, index: true },
  },
  { timestamps: true }
);

// 自动生成 slug
universitySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true, locale: 'zh' });
    if (!baseSlug || /^\d+$/.test(baseSlug)) {
      baseSlug = 'uni-' + (baseSlug || Date.now());
    }
    this.slug = baseSlug;
  }
  next();
});

universitySchema.index({ province: 1, level: 1 });
universitySchema.index({ type: 1, level: 1 });
universitySchema.index({ isPinned: -1, ranking: 1, level: 1, name: 1 });

module.exports = mongoose.model('University', universitySchema);
