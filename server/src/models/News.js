const mongoose = require('mongoose');
const slugify = require('slugify');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
    },
    slug: { type: String, unique: true },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImageUrl: { type: String, default: '' },
    category: {
      type: String,
      enum: ['announcement', 'news', 'event', 'academic'],
      default: 'news',
    },
    isPublished: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 自动生成 slug
newsSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true, strict: true, locale: 'zh' });
    // 如果 slug 纯数字或过短，加前缀
    if (!baseSlug || /^\d+$/.test(baseSlug)) {
      baseSlug = 'news-' + (baseSlug || Date.now());
    }
    this.slug = baseSlug;
  }
  next();
});

newsSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('News', newsSchema);
