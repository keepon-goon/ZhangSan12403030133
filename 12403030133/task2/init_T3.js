const SID = "12403030133";
const C = 3;
const DB_NAME = "exam_" + SID;
const STOCK = 5 + C;
const examDB = db.getSiblingDB(DB_NAME);

if (!examDB.getCollectionNames().includes("inventory")) examDB.createCollection("inventory");
if (!examDB.getCollectionNames().includes("orders")) examDB.createCollection("orders");
examDB.inventory.deleteMany({});
examDB.orders.deleteMany({});
examDB.inventory.insertOne({ _id: "BOOK-" + SID, title: "NoSQL数据库教材", stock: STOCK });
printjson({ scenario: "T3", initialStock: STOCK, orders: 0 });
