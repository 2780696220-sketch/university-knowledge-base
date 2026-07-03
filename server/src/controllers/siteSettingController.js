const SiteSetting = require('../models/SiteSetting');

// 公开：获取站点设置
exports.getPublic = async (req, res, next) => {
  try {
    const settings = await SiteSetting.getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// 管理：更新站点设置
exports.update = async (req, res, next) => {
  try {
    const allowedFields = [
      'schoolName', 'schoolNameEn', 'logoUrl', 'faviconUrl', 'tagline',
      'heroImageUrl', 'primaryColor', 'secondaryColor',
      'contactEmail', 'contactPhone', 'address',
      'socialLinks', 'seoDescription', 'seoKeywords', 'footerText',
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const settings = await SiteSetting.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};
