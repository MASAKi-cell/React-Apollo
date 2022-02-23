const { DataSource } = require("apollo-datasource");
const isEmail = require("isemail");

class UserAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }

  /**
   * This function gets called with the datasource config
   * including things like caches and context（ユーザー情報を取得する為のリクエスト内容を含む）
   */
  initialize(config) {
    this.context = config.context;
  }

  /**
   * email情報からデータベースのユーザー情報を取得もしくは新たにユーザー情報を作成
   * @param {*} param0
   * @returns ユーザー情報
   */
  async findOrCreateUser({ email: emailArg } = {}) {
    const email =
      this.context && this.context.user ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) {
      return null;
    }

    // 既存のユーザー情報を検索するもしくは、新たに作成。
    const users = await this.store.users.findOrCreate({ where: { email } });
    return users && users[0] ? users[0] : null;
  }

  /**
   * launchIds配列を受け取り、result配列に格納する。
   * @params launchIds
   * @return results
   */
  async bookTrips({ launchIds }) {
    const userId = this.context.user.id;

    if (!userId) {
      return;
    }

    let results = [];

    for (const launchId of launchIds) {
      const res = await this.bookTrip({ launchId });
      if (res) {
        results.push(res);
      }
    }
    return results;
  }

  /**
   *
   * @param {*} param0
   * @returns res or false
   */
  async bookTrip({ launchId }) {
    const userId = this.context.user.id;
    const res = await this.store.trips.findOrCreate({
      where: { userId, launchId },
    });
    return res && res.length ? res[0].get() : false;
  }

  /**
   * 予約キャンセルを実施
   * @param {*} param0
   * @returns
   */
  async cancelTrip({ launchId }) {
    const userId = this.context.user.id;
    return !!this.store.trips.destroy({ where: { userId, launchId } });
  }

  /**
   * ログインユーザーの全てのID情報を返却
   * @returns
   */
  async getLaunchIdsByUser() {
    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId },
    });
    return found && found.length
      ? found.map((l) => l.dataValues.launchId).filter((l) => !!l)
      : [];
  }

  /**
   * ログインユーザーが予約した便を表示する。
   * @param {*} param0 
   * @returns 
   */
  async isBookedOnLaunch({ launchId }) {
    if (!this.context || !this.context.user) {
      return false;
    }

    const userId = this.context.user.id;
    const found = await this.store.trips.findAll({
      where: { userId, launchId },
    });
    return found && found.length > 0;
  }
}

module.exports = UserAPI;
