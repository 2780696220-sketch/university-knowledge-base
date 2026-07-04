/**
 * 生产环境种子脚本 — Render 启动时自动将 JSON 数据导入 Atlas。
 *
 * 仅当对应集合为空时才导入（幂等），确保重启不丢数据。
 * 保留原始 _id 和 ObjectId 引用，确保关联完整性。
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const SEEDS_DIR = path.join(__dirname, '../../seeds');

const COLLECTIONS = [
  { file: 'users.json',       collection: 'users' },
  { file: 'sitesettings.json', collection: 'sitesettings' },
  { file: 'universities.json', collection: 'universities' },
  { file: 'majors.json',      collection: 'majors' },
  { file: 'courses.json',     collection: 'courses' },
];

/**
 * 递归转换 Extended JSON 中的 {$oid: '...'} 为 BSON ObjectId
 */
function convertObjectIds(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertObjectIds);
  if (typeof obj === 'object') {
    // Detect Extended JSON ObjectId: {"$oid": "..."}
    if (obj.$oid && typeof obj.$oid === 'string') {
      return new ObjectId(obj.$oid);
    }
    // Detect Extended JSON Date: {"$date": "..."}
    if (obj.$date && typeof obj.$date === 'string') {
      return new Date(obj.$date);
    }
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
      result[k] = convertObjectIds(v);
    }
    return result;
  }
  return obj;
}

async function prodSeed() {
  const db = mongoose.connection.db;

  console.log(`  种子目录: ${SEEDS_DIR}`);
  const dirExists = fs.existsSync(SEEDS_DIR);
  console.log(`  目录存在: ${dirExists}`);

  for (const { file, collection } of COLLECTIONS) {
    const filePath = path.join(SEEDS_DIR, file);
    console.log(`  检查 ${filePath} ...`);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠ ${file} 不存在: ${filePath}`);
      continue;
    }

    // Check if collection needs seeding
    const count = await db.collection(collection).countDocuments();
    if (count > 0) {
      console.log(`  ⊘ ${collection}: 已有 ${count} 条，跳过`);
      continue;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const docs = JSON.parse(raw);
    if (!Array.isArray(docs) || docs.length === 0) {
      console.log(`  ⚠ ${file} 为空，跳过 ${collection}`);
      continue;
    }

    // Convert Extended JSON ObjectIds/Dates to proper BSON types
    const converted = docs.map(convertObjectIds);
    console.log(`  正在导入 ${converted.length} 条到 ${collection}...`);
    await db.collection(collection).insertMany(converted);
    console.log(`  ✓ ${collection}: 已导入 ${converted.length} 条`);
  }

  console.log('  种子数据检查完毕');
}

module.exports = prodSeed;
