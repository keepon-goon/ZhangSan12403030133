const SID = "12403030133";
const S = 33;
const A = 0;
const DB_NAME = "exam_" + SID;
const COURSE_ID = "COURSE-" + SID + "-01";
const examDB = db.getSiblingDB(DB_NAME);

print("1. 张老师授课且状态为OPEN的课程");
const openCourses = examDB.courses.aggregate([
  { $match: { teacher: "张老师", status: "OPEN" } },
  {
    $project: {
      _id: 0,
      courseId: "$_id",
      title: 1,
      chapterCount: { $size: "$chapters" }
    }
  }
]).toArray();
printjson(openCourses);

print("2. 局部修改CH02标题");
const renameResult = examDB.courses.updateOne(
  { _id: COURSE_ID, "chapters.chapterId": "CH02" },
  { $set: { "chapters.$.title": "Redis基础与应用-" + S } }
);
printjson(renameResult);
printjson(examDB.courses.findOne({ _id: COURSE_ID }));

print("3. 连续两次增加CH03");
const chapter = { chapterId: "CH03", title: "Redis高级操作", hours: 2 + A };
const addResult1 = examDB.courses.updateOne(
  { _id: COURSE_ID, "chapters.chapterId": { $ne: "CH03" } },
  { $push: { chapters: chapter } }
);
const addResult2 = examDB.courses.updateOne(
  { _id: COURSE_ID, "chapters.chapterId": { $ne: "CH03" } },
  { $push: { chapters: chapter } }
);
printjson({ firstAdd: addResult1, secondAdd: addResult2 });

const finalCourse = examDB.courses.findOne({ _id: COURSE_ID });
const chapter3Count = finalCourse.chapters.filter(item => item.chapterId === "CH03").length;
const chapter2 = finalCourse.chapters.find(item => item.chapterId === "CH02");
print("4. 核验结果");
printjson({
  chapter2Title: chapter2.title,
  chapter3Count: chapter3Count,
  totalChapters: finalCourse.chapters.length,
  teacher: finalCourse.teacher,
  status: finalCourse.status,
  teacherPreserved: finalCourse.teacher === "张老师",
  statusPreserved: finalCourse.status === "OPEN",
  updatedCourse: finalCourse
});
print("说明：$set和带章节编号条件的$push只修改目标章节数组项，课程其他字段及已有章节保持原值。");
