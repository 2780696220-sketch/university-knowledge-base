const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema(
  {
    schoolName: { type: String, default: '大学云课堂' },
    schoolNameEn: { type: String, default: 'University Cloud Classroom' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    tagline: { type: String, default: '追求卓越，知行合一' },
    heroImageUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#1d4ed8' },
    secondaryColor: { type: String, default: '#f59e0b' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    socialLinks: {
      wechat: { type: String, default: '' },
      weibo: { type: String, default: '' },
      bilibili: { type: String, default: '' },
    },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    footerText: { type: String, default: '' },
  },
  { timestamps: true }
);

// 静态方法：获取或创建设置单例
siteSettingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
