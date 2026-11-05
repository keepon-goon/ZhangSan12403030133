const SID = "12403030133";
const A = 0;
const DB_NAME = "exam_" + SID;
const BUY = 1 + A;
const STOCK = BUY - 1;
const examDB = db.getSiblingDB(DB_NAME);

if (!examDB.getCollectionNames().includes("inventory")) examDB.createCollection("inventory");
if (!examDB.getCollectionNames().includes("orders")) examDB.createCollection("orders");
examDB.inventory.deleteMany({});
examDB.orders.deleteMany({});
examDB.inventory.insertOne({ _id: "BOOK-" + SID, title: "NoSQL数据库教材", stock: STOCK });
printjson({ scenario: "T2", initialStock: STOCK, orders: 0 });
