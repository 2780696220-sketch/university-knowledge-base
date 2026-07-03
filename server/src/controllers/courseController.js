const Course = require('../models/Course');

// GET /api/courses?parent=<专业类_id>
exports.getByParent = async (req, res, next) => {
  try {
    const { parent } = req.query;
    if (!parent) {
      return res.status(400).json({ success: false, message: '请提供 parent 参数' });
    }

    const courses = await Course.find({ parent })
      .select('name slug category majorCategory enriched')
      .sort({ name: 1 })
      .lean();

    // Group by category
    const data = {
      required: courses.filter((c) => c.category === '专业课'),
      elective: courses.filter((c) => c.category === '选修课'),
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/courses/:id — full course detail including videos & materials
exports.getById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .select('name slug category majorCategory enriched videos books parent')
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: '课程不存在' });
    }

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};
