const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '课程名称不能为空'],
      trim: true,
    },
    slug: { type: String, unique: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major',
      required: [true, '所属专业类不能为空'],
    },
    category: {
      type: String,
      enum: ['专业课', '选修课'],
      required: [true, '课程类别不能为空'],
    },
    majorCategory: {
      type: String,
      required: [true, '学科门类不能为空'],
    },
    videos: [
      {
        bvid: { type: String },
        title: { type: String },
        thumbnail: { type: String, default: '' },
        playCount: { type: Number, default: 0 },
        duration: { type: String, default: '' },
        author: { type: String, default: '' },
        url: { type: String, default: '' },
        pubdate: { type: Number, default: 0 },
      },
    ],
    books: [
      {
        title: { type: String },
        author: { type: String, default: '' },
        cover: { type: String, default: '' },
        url: { type: String, default: '' },
        publisher: { type: String, default: '' },
        year: { type: String, default: '' },
        extension: { type: String, default: '' },
        size: { type: String, default: '' },
      },
    ],
    enriched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate slug
courseSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    let baseSlug = slugify(this.name, { lower: true, strict: true, locale: 'zh' });
    if (!baseSlug || /^\d+$/.test(baseSlug)) {
      baseSlug = 'course-' + (baseSlug || Date.now());
    }
    this.slug = baseSlug;
  }
  next();
});

courseSchema.index({ parent: 1, category: 1 });
courseSchema.index({ majorCategory: 1 });
courseSchema.index({ enriched: 1, parent: 1 });

module.exports = mongoose.model('Course', courseSchema);
