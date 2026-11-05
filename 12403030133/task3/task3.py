import time

from common import connect_redis, print_json


SID = "12403030133"
CLASS_NAME = "大数据管理与应用一班"
C = 3
SCORE = 70 + C
PREFIX = "exam:" + SID + ":"
STUDENT_KEY = PREFIX + "student"
CHAPTERS_KEY = PREFIX + "completed"
RANK_KEY = PREFIX + "rank"
SESSION_KEY = PREFIX + "session"


def top_three(client):
    rows = client.zrevrange(RANK_KEY, 0, 2, withscores=True)
    return [
        {"rank": "第" + str(index + 1) + "名", "member": member, "score": int(score)}
        for index, (member, score) in enumerate(rows)
    ]


client = connect_redis()
for key in [STUDENT_KEY, CHAPTERS_KEY, RANK_KEY, SESSION_KEY]:
    client.delete(key)

print("1. 学生信息Hash")
client.hset(STUDENT_KEY, mapping={
    "studentId": SID,
    "name": "张三",
    "className": CLASS_NAME,
    "courseId": "COURSE-" + SID + "-01",
    "status": "learning",
})
client.hset(STUDENT_KEY, "status", "completed")
print_json({
    "name": client.hget(STUDENT_KEY, "name"),
    "status": client.hget(STUDENT_KEY, "status"),
    "hash": client.hgetall(STUDENT_KEY),
})

print("2. 已完成章节Set")
chapter_counts = []
for chapter_id in ["CH01", "CH02", "CH02", "CH03"]:
    client.sadd(CHAPTERS_KEY, chapter_id)
    chapter_counts.append({"submitted": chapter_id, "count": client.scard(CHAPTERS_KEY)})
print_json({
    "countsAfterEachSubmission": chapter_counts,
    "chapters": sorted(client.smembers(CHAPTERS_KEY)),
    "CH02Completed": bool(client.sismember(CHAPTERS_KEY, "CH02")),
    "CH04Completed": bool(client.sismember(CHAPTERS_KEY, "CH04")),
    "duplicateSubmissionKeptCount": chapter_counts[1]["count"] == chapter_counts[2]["count"],
})

print("3. 成绩排行榜Sorted Set")
client.zadd(RANK_KEY, {
    "Student:" + SID: SCORE,
    "demo:01": 85,
    "demo:02": 90,
    "demo:03": 60,
    "demo:04": 80,
})
before_update = top_three(client)
client.zincrby(RANK_KEY, 20, "Student:" + SID)
after_update = top_three(client)
student_score = int(client.zscore(RANK_KEY, "Student:" + SID))
student_rank = client.zrevrank(RANK_KEY, "Student:" + SID) + 1
print_json({
    "top3BeforeUpdate": before_update,
    "top3AfterUpdate": after_update,
    "studentScore": student_score,
    "studentRank": "第" + str(student_rank) + "名",
})

print("4. 会话String过期")
client.set(SESSION_KEY, "session-" + SID, ex=5)
session_type_before_expiry = client.type(SESSION_KEY)
print_json({
    "key": SESSION_KEY,
    "value": client.get(SESSION_KEY),
    "ttlSeconds": client.ttl(SESSION_KEY),
    "typeBeforeExpiry": session_type_before_expiry,
})

print("5. 数据类型核验")
types = {
    "studentHash": client.type(STUDENT_KEY),
    "completedSet": client.type(CHAPTERS_KEY),
    "rankSortedSet": client.type(RANK_KEY),
    "sessionString": session_type_before_expiry,
}
print_json({
    "types": types,
    "reasons": {
        "Hash": "按字段维护一条学生信息记录。",
        "Set": "保存不重复的已完成章节并支持成员判断。",
        "Sorted Set": "按成绩排序并查询分数名次。",
        "String": "保存单个会话标识并设置过期时间。",
    },
})

time.sleep(6.1)
session_exists = bool(client.exists(SESSION_KEY))
session_ttl = client.ttl(SESSION_KEY)
print("会话过期核验")
print_json({
    "existsAfterWait": session_exists,
    "ttlAfterWait": session_ttl,
    "passed": not session_exists and session_ttl == -2,
})
client.close()
