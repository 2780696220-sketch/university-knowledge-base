const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Media = require('../models/Media');

// 上传文件
exports.upload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: '请选择要上传的文件' });
    }

    const results = [];

    for (const file of req.files) {
      // 生成缩略图
      const thumbFilename = 'thumb-' + file.filename;
      const thumbPath = path.join(file.destination, thumbFilename);

      let width = 0;
      let height = 0;

      try {
        const metadata = await sharp(file.path).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;

        await sharp(file.path)
          .resize(400, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbPath);
      } catch (imgErr) {
        console.error('缩略图生成失败:', imgErr.message);
      }

      const media = await Media.create({
        originalName: file.originalname,
        filename: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        thumbnailUrl: `/uploads/${thumbFilename}`,
        width,
        height,
        uploadedBy: req.user.id,
      });

      results.push(media);
    }

    res.status(201).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

// 媒体列表
exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const total = await Media.countDocuments();
    const media = await Media.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: media,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// 删除媒体
exports.remove = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 删除物理文件
    const basePath = path.join(__dirname, '../../uploads');
    const filePath = path.join(basePath, media.filename);
    const thumbPath = path.join(basePath, 'thumb-' + media.filename);

    try { fs.unlinkSync(filePath); } catch (_) {}
    try { fs.unlinkSync(thumbPath); } catch (_) {}

    await Media.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: '文件已删除' });
  } catch (err) {
    next(err);
  }
};
