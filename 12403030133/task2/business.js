globalThis.runTask2Scenario = function (scenario) {
  const SID = "12403030133";
  const A = 0;
  const C = 3;
  const DB_NAME = "exam_" + SID;
  const BOOK_ID = "BOOK-" + SID;
  const STOCK = 5 + C;
  const BUY = 1 + A;
  const examDB = db.getSiblingDB(DB_NAME);
  const scenarioSettings = {
    T1: { initialStock: STOCK, attempts: 1, forceError: false },
    T2: { initialStock: BUY - 1, attempts: 1, forceError: false },
    T3: { initialStock: STOCK, attempts: 1, forceError: true },
    T4: { initialStock: STOCK, attempts: Math.floor(STOCK / BUY) + 1, forceError: false }
  };
  const settings = scenarioSettings[scenario];
  const startingInventory = examDB.inventory.findOne({ _id: BOOK_ID });
  const actualInitialStock = startingInventory.stock;
  let successCount = 0;
  const outcomes = [];

  function placeOrder(requestId, forceError) {
    const session = db.getMongo().startSession({ readPreference: { mode: "primary" } });
    let transactionStarted = false;
    try {
      session.startTransaction({
        readConcern: { level: "local" },
        writeConcern: { w: "majority" }
      });
      transactionStarted = true;
      const transactionDB = session.getDatabase(DB_NAME);
      const decrement = transactionDB.inventory.updateOne(
        { _id: BOOK_ID, stock: { $gte: BUY } },
        { $inc: { stock: -BUY } }
      );
      if (decrement.matchedCount === 0) {
        session.abortTransaction();
        transactionStarted = false;
        return { success: false, kind: "INSUFFICIENT_OR_MISSING" };
      }
      if (forceError) {
        const error = new Error("T3中途异常：订单插入前回滚");
        error.name = "ForcedOrderError";
        throw error;
      }
      transactionDB.orders.insertOne({
        _id: requestId,
        bookId: BOOK_ID,
        studentId: SID,
        quantity: BUY
      });
      session.commitTransaction();
      transactionStarted = false;
      return { success: true, kind: "COMMITTED" };
    } catch (error) {
      if (transactionStarted) session.abortTransaction();
      return {
        success: false,
        kind: error.name === "ForcedOrderError" ? "FORCED_ERROR" : "DATABASE_ERROR",
        message: String(error)
      };
    } finally {
      session.endSession();
    }
  }

  for (let index = 0; index < settings.attempts; index += 1) {
    const requestId = "REQ-" + SID + "-" + scenario + "-" + new ObjectId().toString() + "-" + (index + 1);
    const outcome = placeOrder(requestId, settings.forceError);
    outcomes.push(outcome);
    if (outcome.success) successCount += 1;
  }

  const finalInventory = examDB.inventory.findOne({ _id: BOOK_ID });
  const orders = examDB.orders.find({}).toArray();
  const expectedSuccessCount = scenario === "T1" ? 1 :
    scenario === "T4" ? Math.floor(STOCK / BUY) : 0;
  const expectedFailureCount = settings.attempts - expectedSuccessCount;
  const expectedFinalStock = settings.initialStock - expectedSuccessCount * BUY;
  const ordersValid = orders.every(order =>
    order.bookId === BOOK_ID && order.studentId === SID && order.quantity === BUY
  );
  const rollbackVerified = scenario !== "T3" ||
    (outcomes[0].kind === "FORCED_ERROR" && finalInventory.stock === STOCK && orders.length === 0);
  const failureKindsValid = outcomes.every(outcome => outcome.success ||
    outcome.kind === (scenario === "T3" ? "FORCED_ERROR" : "INSUFFICIENT_OR_MISSING"));
  const passed = actualInitialStock === settings.initialStock &&
    successCount === expectedSuccessCount &&
    settings.attempts - successCount === expectedFailureCount &&
    finalInventory.stock === expectedFinalStock &&
    orders.length === expectedSuccessCount &&
    ordersValid && rollbackVerified && failureKindsValid;

  const outcomeCounts = {};
  for (const outcome of outcomes) {
    outcomeCounts[outcome.kind] = (outcomeCounts[outcome.kind] || 0) + 1;
  }
  printjson({
    scenario: scenario,
    initialStock: actualInitialStock,
    buy: BUY,
    attempts: settings.attempts,
    successCount: successCount,
    failureCount: settings.attempts - successCount,
    finalStock: finalInventory.stock,
    orderCount: orders.length,
    outcomeCounts: outcomeCounts,
    errors: outcomes.filter(outcome => outcome.message).map(outcome => outcome.message),
    rollbackVerified: rollbackVerified,
    passed: passed
  });
  if (!passed) throw new Error(scenario + "核验未通过");
};
