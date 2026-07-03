const crypto = require('crypto');
const Major = require('../models/Major');
const seedData = require('./majorSeedData.json');

function makeSlug(code) {
  const hash = crypto.createHash('md5').update(code).digest('hex').slice(0, 8);
  return `maj-${hash}`;
}

async function seedMajors() {
  try {
    const count = await Major.countDocuments();
    if (count > 0) {
      console.log(`[seed] Majors collection already has ${count} documents, skipping seed`);
      return;
    }

    console.log('[seed] Seeding major catalog...');

    // Step 1: Insert all 学科门类
    const categories = seedData.map((cat) => ({
      name: cat.name,
      slug: makeSlug(cat.code),
      code: cat.code,
      level: '门类',
      parent: null,
      category: cat.name,
    }));
    const insertedCategories = await Major.insertMany(categories, { ordered: false });
    console.log(`[seed] Inserted ${insertedCategories.length} 学科门类`);

    // Build name→_id map for categories
    const categoryMap = {};
    for (const doc of insertedCategories) {
      categoryMap[doc.name] = doc._id;
    }

    // Step 2: Insert all 专业类 with parent references
    const allClasses = [];
    for (const cat of seedData) {
      const catId = categoryMap[cat.name];
      for (const cls of cat.classes) {
        allClasses.push({
          name: cls.name,
          slug: makeSlug(cls.code),
          code: cls.code,
          level: '专业类',
          parent: catId,
          category: cat.name,
        });
      }
    }
    const insertedClasses = await Major.insertMany(allClasses, { ordered: false });
    console.log(`[seed] Inserted ${insertedClasses.length} 专业类`);

    // Build name+category→_id map for classes
    const classMap = {};
    for (const doc of insertedClasses) {
      classMap[`${doc.category}||${doc.name}`] = doc._id;
    }

    // Step 3: Insert all 具体专业 with parent references
    const allMajors = [];
    for (const cat of seedData) {
      for (const cls of cat.classes) {
        const clsId = classMap[`${cat.name}||${cls.name}`];
        for (const major of cls.majors) {
          allMajors.push({
            name: major.name,
            slug: makeSlug(major.code),
            code: major.code,
            level: '专业',
            parent: clsId,
            category: cat.name,
          });
        }
      }
    }
    const insertedMajors = await Major.insertMany(allMajors, { ordered: false });
    console.log(`[seed] Inserted ${insertedMajors.length} 具体专业`);

    const total = insertedCategories.length + insertedClasses.length + insertedMajors.length;
    console.log(`[seed] Major seeding complete: ${total} documents total`);
  } catch (err) {
    console.error('[seed] Major seeding error:', err.message);
  }
}

module.exports = seedMajors;
