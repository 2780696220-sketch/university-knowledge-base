const Joi = require('joi');
const University = require('../models/University');

// ========== 公开接口 ==========

exports.getPublicList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 60;
    const { search, province, type, level } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (province) query.province = province;
    if (type) query.type = type;
    if (level) query.level = level;

    const total = await University.countDocuments(query);
    const data = await University.find(query)
      .select('name slug logoUrl province city type level is985 is211 isDoubleFirstClass isPinned')
      .sort({ isPinned: -1, ranking: 1, level: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPublicBySlug = async (req, res, next) => {
  try {
    const university = await University.findOne({ slug: req.params.slug }).lean();
    if (!university) {
      return res.status(404).json({ success: false, message: '院校不存在' });
    }
    res.json({ success: true, data: university });
  } catch (err) {
    next(err);
  }
};

// ========== 管理接口 ==========

exports.getAdminList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { search, province, type, level, is985, is211, isDoubleFirstClass } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    if (province) query.province = province;
    if (type) query.type = type;
    if (level) query.level = level;
    if (is985 === 'true') query.is985 = true;
    if (is211 === 'true') query.is211 = true;
    if (isDoubleFirstClass === 'true') query.isDoubleFirstClass = true;

    const total = await University.countDocuments(query);
    const data = await University.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id).lean();
    if (!university) {
      return res.status(404).json({ success: false, message: '院校不存在' });
    }
    res.json({ success: true, data: university });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().messages({ 'any.required': '院校名称不能为空' }),
      province: Joi.string().required().messages({ 'any.required': '省份不能为空' }),
      city: Joi.string().allow('').default(''),
      type: Joi.string().valid('综合', '理工', '师范', '医药', '农林', '财经', '政法', '体育', '艺术', '民族', '语言', '军事').required(),
      level: Joi.string().valid('本科', '专科').required(),
      website: Joi.string().allow('').default(''),
      logoUrl: Joi.string().allow('').default(''),
      is985: Joi.boolean().default(false),
      is211: Joi.boolean().default(false),
      isDoubleFirstClass: Joi.boolean().default(false),
      isPinned: Joi.boolean().default(false),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const university = await University.create(value);
    res.status(201).json({ success: true, data: university });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: '院校名称已存在' });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const fields = [
      'name', 'province', 'city', 'type', 'level', 'website', 'logoUrl',
      'is985', 'is211', 'isDoubleFirstClass', 'isPinned',
    ];
    const updateData = {};
    for (const key of fields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const university = await University.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!university) {
      return res.status(404).json({ success: false, message: '院校不存在' });
    }
    res.json({ success: true, data: university });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: '院校名称已存在' });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({ success: false, message: '院校不存在' });
    }
    res.json({ success: true, message: '院校已删除' });
  } catch (err) {
    next(err);
  }
};

exports.batchImport = async (req, res, next) => {
  try {
    const { universities } = req.body;
    if (!universities || !Array.isArray(universities) || universities.length === 0) {
      return res.status(400).json({ success: false, message: '请提供院校数组' });
    }

    const result = await University.insertMany(universities, { ordered: false });
    res.status(201).json({
      success: true,
      message: `成功导入 ${result.length} 所院校`,
      count: result.length,
    });
  } catch (err) {
    if (err.writeErrors) {
      res.status(207).json({
        success: true,
        message: `部分导入成功: ${err.insertedDocs?.length || 0} 条`,
        count: err.insertedDocs?.length || 0,
        errors: err.writeErrors.length,
      });
    } else {
      next(err);
    }
  }
};
