const SID = "12403030133";
const DB_NAME = "exam_" + SID;
const examDB = db.getSiblingDB(DB_NAME);

examDB.courses.deleteMany({});
examDB.courses.insertMany([
  {
    _id: "COURSE-" + SID + "-01",
    title: "NoSQL数据库",
    teacher: "张老师",
    status: "OPEN",
    chapters: [
      { chapterId: "CH01", title: "MongoDB基础", hours: 2 },
      { chapterId: "CH02", title: "Redis基础", hours: 2 }
    ]
  },
  {
    _id: "COURSE-" + SID + "-02",
    title: "数据库原理",
    teacher: "张老师",
    status: "CLOSED",
    chapters: [{ chapterId: "CH01", title: "关系模型", hours: 2 }]
  },
  {
    _id: "COURSE-" + SID + "-03",
    title: "机器学习",
    teacher: "李老师",
    status: "OPEN",
    chapters: [
      { chapterId: "CH01", title: "分类", hours: 2 },
      { chapterId: "CH02", title: "聚类", hours: 2 }
    ]
  }
]);

printjson({ database: DB_NAME, initializedCourses: examDB.courses.countDocuments({}) });
