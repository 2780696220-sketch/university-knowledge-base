/**
 * 生产环境种子脚本 — Render 启动时自动将 JSON 数据导入 Atlas。
 *
 * 仅当对应集合为空时才导入（幂等），确保重启不丢数据。
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const SEEDS_DIR = path.join(__dirname, '../../seeds');

const COLLECTIONS = [
  { file: 'users.json',       collection: 'users' },
  { file: 'sitesettings.json', collection: 'sitesettings' },
  { file: 'universities.json', collection: 'universities' },
  { file: 'majors.json',      collection: 'majors' },
  { file: 'courses.json',     collection: 'courses' },
];

async function prodSeed() {
  const db = mongoose.connection.db;

  for (const { file, collection } of COLLECTIONS) {
    // Check if collection needs seeding
    const count = await db.collection(collection).countDocuments();
    if (count > 0) {
      console.log(`  ⊘ ${collection}: 已有 ${count} 条，跳过`);
      continue;
    }

    const filePath = path.join(SEEDS_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠ ${file} 不存在，跳过 ${collection}`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const docs = JSON.parse(raw);
    if (!Array.isArray(docs) || docs.length === 0) {
      console.log(`  ⚠ ${file} 为空，跳过 ${collection}`);
      continue;
    }

    // Strip _id so MongoDB generates new ObjectIds
    const cleaned = docs.map(({ _id, ...rest }) => rest);
    await db.collection(collection).insertMany(cleaned);
    console.log(`  ✓ ${collection}: 已导入 ${cleaned.length} 条`);
  }

  console.log('  种子数据检查完毕');
}

module.exports = prodSeed;
