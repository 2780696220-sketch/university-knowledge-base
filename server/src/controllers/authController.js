const Joi = require('joi');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// 登录
exports.login = async (req, res, next) => {
  try {
    const schema = Joi.object({
      username: Joi.string().required().messages({
        'any.required': '请输入用户名',
      }),
      password: Joi.string().required().messages({
        'any.required': '请输入密码',
      }),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findOne({ username: value.username });
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const isMatch = await user.comparePassword(value.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// 获取当前用户信息
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// 修改密码
exports.changePassword = async (req, res, next) => {
  try {
    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(6).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(value.currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }

    user.password = value.newPassword;
    await user.save();

    res.json({ success: true, message: '密码修改成功' });
  } catch (err) {
    next(err);
  }
};
