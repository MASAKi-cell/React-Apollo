const SQL = require("sequelize");


// ページネーションの実装
module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  getCursor = () => null,
}) => {

  // 指定したページネーションの番号が１以下であれば、空の配列を返す
  if (pageSize < 1) {
    return [];
  }

  // cursorがない場合は、指定したページネーションの番号までを返す
  if (!cursor) {
    return results.slice(0, pageSize);
  }

  // cursorがある最初の要素の位置を返す
  const cursorIndex = results.findIndex((item) => {

    // データにcursorがあれば、返却なければcursorを生成する
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // cursorがあればtrue、なければfalseを返す
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0 ? cursorIndex === results.length - 1 
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize)
        )
    : results.slice(0, pageSize);
};

module.exports.createStore = () => {
  const Op = SQL.Op;
  const operatorsAliases = {
    $in: Op.in,
  };

  const db = new SQL("database", "username", "password", {
    dialect: "sqlite",
    storage: "./store.sqlite",
    operatorsAliases,
    logging: false,
  });

  const users = db.define("user", {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    email: SQL.STRING,
    token: SQL.STRING,
  });

  const trips = db.define("trip", {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    launchId: SQL.INTEGER,
    userId: SQL.INTEGER,
  });

  return { users, trips };
};
