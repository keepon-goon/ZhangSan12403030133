《NoSQL数据库》上机测验提交项目

学号：12403030133
参数：S=33，A=0，B=1，C=3
MongoDB数据库：exam_12403030133
Redis键前缀：exam:12403030133:
Redis学生班级字段：大数据管理与应用一班

参数计算
Stock=5+C=8
Buy=1+A=1
N=1000+100C+S=1333
Q=100
task4批次数=14，尾批数量=33

目录说明
task1：MongoDB课程查询与章节维护。init.js为初始化脚本，task1.js为业务脚本。
task2：MongoDB原子扣减与事务场景。init_T1.js至init_T4.js分别重置对应场景数据；business.js实现订购逻辑；run_T1.js至run_T4.js运行场景。
task3：Redis学生信息、章节集合、成绩排行榜和会话过期验证。
task4：Redis逐条写入与普通Pipeline性能比较。
requirements.txt：Python Redis客户端依赖。

运行环境与依赖
1. MongoDB副本集、mongosh、Python 3.8或更高版本。
2. Redis 3主3从Cluster。默认启动节点为127.0.0.1:30133，与上机实验五的学号端口规划一致。集群通告地址应能由本机访问。
3. Python依赖：在项目目录执行 `& "D:\anaconda\python.exe" -m pip install -r .\requirements.txt`。
4. 在PowerShell中将MONGODB_URI设为本机副本集连接URI。连接URI应包含副本集节点地址和replicaSet参数；需要认证时将凭据放入环境变量，不写入源码。
5. Redis连接默认读取REDIS_HOST、REDIS_PORT、REDIS_USERNAME和REDIS_PASSWORD环境变量。未设置时使用127.0.0.1:30133和无密码连接。

MongoDB执行方法
以下命令均在本目录执行。先将MONGODB_URI设置为实际副本集连接URI。

task1初始化并记录初始化输出：
`mongosh "$env:MONGODB_URI" --quiet --file .\task1\init.js | Tee-Object .\task1\init_result.txt`

task1业务操作和核验：
`mongosh "$env:MONGODB_URI" --quiet --file .\task1\task1.js | Tee-Object .\task1\result.txt`

task1.js可重复执行。初始化脚本仅在需要重置课程数据时执行。

task2每个场景先运行对应初始化脚本，再运行对应业务场景。以下命令会将实际场景输出追加到task2\result.txt：

`mongosh "$env:MONGODB_URI" --quiet --file .\task2\init_T1.js`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\run_T1.js | Tee-Object -Append .\task2\result.txt`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\init_T2.js`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\run_T2.js | Tee-Object -Append .\task2\result.txt`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\init_T3.js`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\run_T3.js | Tee-Object -Append .\task2\result.txt`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\init_T4.js`
`mongosh "$env:MONGODB_URI" --quiet --file .\task2\run_T4.js | Tee-Object -Append .\task2\result.txt`

每个task2初始化脚本都会重置个人数据库中的inventory和orders集合。场景输出包含参数、成功与失败次数、最终库存、订单数量及核验结果。

Redis执行方法
从项目目录运行：
`& "D:\anaconda\python.exe" .\task3\task3.py | Tee-Object .\task3\result.txt`
`& "D:\anaconda\python.exe" .\task4\task4.py | Tee-Object .\task4\result.txt`

task3运行约6秒，以完成会话过期检查。task4会清理并重建本题的exam:12403030133:seq:和exam:12403030133:pipe:键，再核验键和值。

代码说明
MongoDB使用mongosh JavaScript。MongoDB初始化脚本与业务脚本分开保存。task2的事务使用同一会话完成库存更新和订单插入。
Redis使用redis-py的RedisCluster客户端。task4的Pipeline设置transaction=False，按100条分批执行，并单独计时两种写入方式。
源码中的个人姓名字段统一为“张三”。源码不包含数据库连接凭据。

运行结果
各题result.txt已根据本机实际运行截图填写。screenshots目录保存对应截图。完成版Word已按题号插入15张实际截图，参数表、事务测试汇总和性能表已填写。

发布记录
GitHub仓库链接：https://github.com/keepon-goon/ZhangSan12403030133

本机启动与解释器
Anaconda解释器：D:\anaconda\python.exe
本机MongoDB配置：D:\MongoDB\bin\mongod.cfg，副本集名称rs0。
PowerShell连接变量：
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/?replicaSet=rs0"
PowerShell读取Python的UTF-8输出：
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
交互式mongosh可以直接执行load("E:/Nosql/12403030133/task1/init.js")。