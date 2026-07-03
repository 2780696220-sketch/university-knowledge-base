const Major = require('../models/Major');

// GET /api/majors/categories — 获取所有学科门类
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Major.find({ level: '门类' })
      .select('name slug code level isPinned')
      .sort({ code: 1 })
      .lean();

    // Get child counts for each category
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const classCount = await Major.countDocuments({ parent: cat._id, level: '专业类' });
        return { ...cat, classCount };
      })
    );

    res.json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
};

// GET /api/majors?parent=<id> — 获取某父级下的子级
exports.getChildren = async (req, res, next) => {
  try {
    const { parent } = req.query;
    if (!parent) {
      return res.status(400).json({ success: false, message: '请提供 parent 参数' });
    }

    const children = await Major.find({ parent, level: { $ne: '门类' } })
      .select('name slug code level isPinned')
      .sort({ code: 1 })
      .lean();

    // If these are 专业类, get their 专业 counts
    const withCounts = await Promise.all(
      children.map(async (child) => {
        if (child.level === '专业类') {
          const majorCount = await Major.countDocuments({ parent: child._id, level: '专业' });
          return { ...child, majorCount };
        }
        return child;
      })
    );

    res.json({ success: true, data: withCounts });
  } catch (err) {
    next(err);
  }
};

// GET /api/majors/search?q= — 搜索专业
exports.search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: '请提供搜索关键词' });
    }

    const results = await Major.find({
      name: { $regex: q.trim(), $options: 'i' },
    })
      .select('name slug code level category parent')
      .limit(50)
      .lean();

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// GET /api/majors/:slug — 获取单个专业详情
exports.getBySlug = async (req, res, next) => {
  try {
    const major = await Major.findOne({ slug: req.params.slug }).lean();
    if (!major) {
      return res.status(404).json({ success: false, message: '专业不存在' });
    }

    // If this is a 专业类, get parent and children
    let parent = null;
    let children = [];

    if (major.parent) {
      parent = await Major.findById(major.parent).select('name slug level').lean();
    }

    if (major.level === '门类' || major.level === '专业类') {
      children = await Major.find({ parent: major._id })
        .select('name slug code level')
        .sort({ code: 1 })
        .lean();
    }

    res.json({ success: true, data: { ...major, parent, children } });
  } catch (err) {
    next(err);
  }
};
