const crypto = require('crypto');
const Course = require('../models/Course');
const Major = require('../models/Major');
const seedData = require('./courseSeedData.json');

function makeSlug(code) {
  const hash = crypto.createHash('md5').update(code).digest('hex').slice(0, 8);
  return `crs-${hash}`;
}

async function seedCourses() {
  try {
    const count = await Course.countDocuments();
    if (count > 0) {
      console.log(`[seed] Courses collection already has ${count} documents, skipping seed`);
      return;
    }

    console.log('[seed] Seeding course data...');

    // Build a map: "门类名||专业类名" -> 专业类 _id
    const classes = await Major.find({ level: '专业类' }).lean();
    const classMap = {};
    for (const cls of classes) {
      classMap[`${cls.category}||${cls.name}`] = cls._id;
    }

    let courseIndex = 0;
    const allCourses = [];

    for (const cat of seedData) {
      for (const cls of cat.classes) {
        const parentId = classMap[`${cat.name}||${cls.name}`];
        if (!parentId) {
          console.warn(`[seed] Could not find Major for ${cat.name} > ${cls.name}, skipping`);
          continue;
        }

        // Insert required courses
        for (const courseName of cls.courses.required) {
          courseIndex++;
          allCourses.push({
            name: courseName,
            slug: makeSlug(`course-${courseIndex}`),
            parent: parentId,
            category: '专业课',
            majorCategory: cat.name,
          });
        }

        // Insert elective courses
        for (const courseName of cls.courses.elective) {
          courseIndex++;
          allCourses.push({
            name: courseName,
            slug: makeSlug(`course-${courseIndex}`),
            parent: parentId,
            category: '选修课',
            majorCategory: cat.name,
          });
        }
      }
    }

    if (allCourses.length > 0) {
      const inserted = await Course.insertMany(allCourses, { ordered: false });
      console.log(`[seed] Inserted ${inserted.length} courses`);
    }

    console.log('[seed] Course seeding complete');
  } catch (err) {
    console.error('[seed] Course seeding error:', err.message);
  }
}

module.exports = seedCourses;
