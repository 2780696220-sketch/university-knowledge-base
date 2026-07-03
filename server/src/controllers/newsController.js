const Joi = require('joi');
const News = require('../models/News');

// 公开：新闻列表（分页 + 分类筛选）
exports.getPublicList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category } = req.query;

    const query = { isPublished: true };
    if (category && ['announcement', 'news', 'event', 'academic'].includes(category)) {
      query.category = category;
    }

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .select('title slug summary coverImageUrl category isPinned publishedAt viewCount')
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// 公开：新闻详情（通过 slug）
exports.getPublicBySlug = async (req, res, next) => {
  try {
    const news = await News.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'username')
      .lean();

    if (!news) {
      return res.status(404).json({ success: false, message: '新闻不存在' });
    }

    // 增加阅读量
    await News.findByIdAndUpdate(news._id, { $inc: { viewCount: 1 } });

    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

// 管理：全部列表
exports.getAdminList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { category, status } = req.query;

    const query = {};
    if (category && ['announcement', 'news', 'event', 'academic'].includes(category)) {
      query.category = category;
    }
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: news,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// 管理：单条详情
exports.getById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username');
    if (!news) {
      return res.status(404).json({ success: false, message: '新闻不存在' });
    }
    res.json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

// 管理：创建
exports.create = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      summary: Joi.string().allow(''),
      content: Joi.string().allow(''),
      coverImageUrl: Joi.string().allow(''),
      category: Joi.string().valid('announcement', 'news', 'event', 'academic').default('news'),
      isPublished: Joi.boolean().default(false),
      isPinned: Joi.boolean().default(false),
      publishedAt: Joi.date().default(Date.now),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const news = await News.create({
      ...value,
      author: req.user.id,
    });

    res.status(201).json({ success: true, data: news });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: '该标题已存在，请修改标题' });
    }
    next(err);
  }
};

// 管理：更新
exports.update = async (req, res, next) => {
  try {
    const fields = [
      'title', 'summary', 'content', 'coverImageUrl', 'category',
      'isPublished', 'isPinned', 'publishedAt',
    ];

    const updateData = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const news = await News.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });

    if (!news) {
      return res.status(404).json({ success: false, message: '新闻不存在' });
    }

    res.json({ success: true, data: news });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: '该标题已存在，请修改标题' });
    }
    next(err);
  }
};

// 管理：删除
exports.remove = async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: '新闻不存在' });
    }
    res.json({ success: true, message: '新闻已删除' });
  } catch (err) {
    next(err);
  }
};
