const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/university-website';
const ATLAS_URI = 'mongodb+srv://2780696220_db_user:Tyh061226@cluster0.zz5s9za.mongodb.net/university-website?retryWrites=true&w=majority';

async function migrate() {
  console.log('连接本地 MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('本地已连接');

  console.log('连接 Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('Atlas 已连接');

  const localDb = localConn.db;
  const atlasDb = atlasConn.db;
  
  const collections = await localDb.listCollections().toArray();
  console.log(`找到 ${collections.length} 个集合: ${collections.map(c => c.name).join(', ')}`);

  for (const col of collections) {
    const name = col.name;
    const docs = await localDb.collection(name).find({}).toArray();
    console.log(`  ${name}: ${docs.length} 条`);
    
    if (docs.length > 0) {
      const existingCount = await atlasDb.collection(name).countDocuments();
      if (existingCount > 0) {
        console.log(`    Atlas 中已有 ${existingCount} 条，跳过`);
        continue;
      }
      await atlasDb.collection(name).insertMany(docs);
      console.log(`    ✓ 已写入 Atlas`);
    }
  }

  console.log('迁移完成!');
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('迁移失败:', err.message);
  process.exit(1);
});
