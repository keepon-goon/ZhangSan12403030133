<div align="center">

# NoSQL Lab

**《NoSQL数据库》上机测验**

![MongoDB](https://img.shields.io/badge/MongoDB-8.0.8-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cluster-DC382D?logo=redis&logoColor=white)
![Python](https://img.shields.io/badge/Python-Anaconda-3776AB?logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-mongosh-F7DF1E?logo=javascript&logoColor=black)

学号 **12403030133** · S = 33 · A = 0 · B = 1 · C = 3

[运行说明](./12403030133/readme.txt) · [提交目录](./12403030133/) · [实验报告](./12403030133/124030301-丁祎-12403030133.docx)

</div>

## 实验内容

MongoDB 副本集与 Redis 三主三从 Cluster 环境下的四项实验，包含源码、实际运行结果和截图。

| 题目 | 实现内容 | 查看 |
| :--- | :--- | :--- |
| 01 · 课程维护 | 数组查询、章节局部更新、重复新增核验 | [源码](./12403030133/task1/task1.js) · [结果](./12403030133/task1/result.txt) |
| 02 · 库存与订单 | 条件原子扣减、事务提交与异常回滚 | [源码](./12403030133/task2/business.js) · [结果](./12403030133/task2/result.txt) |
| 03 · 学习记录 | Hash、Set、Sorted Set、会话过期 | [源码](./12403030133/task3/task3.py) · [结果](./12403030133/task3/result.txt) |
| 04 · 批量写入 | 同步逐条写入与普通 Pipeline 比较 | [源码](./12403030133/task4/task4.py) · [结果](./12403030133/task4/result.txt) |

## 实测记录

- **事务验证**：正常订购、库存不足、中途异常、连续购买，四个场景均通过核验。
- **写入完整性**：每种方案写入 **1,333** 个键；Pipeline 共 **14** 批，尾批 **33** 条，键和值核验通过。
- **本次耗时**：逐条写入 **278.896 ms**，Pipeline **25.404 ms**。

每题的 `screenshots/` 目录保存实际截图。环境配置、依赖与执行命令见[运行说明](./12403030133/readme.txt)。
