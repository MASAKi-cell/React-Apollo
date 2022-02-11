const { RESTDataSource } = require("apollo-datasource-rest");

class LaunchAPI extends RESTDataSource {
  /**
   * baseURLの設計
   */
  constructor() {
    super();
    this.baseURL = "https://api.spacexdata.com/v2/";
  }

  /**
   * launchesスキーマーから値（発射予定）を取得
   * @returns URLより取得した値（発射予定の便情報）もしくは、空の配列を返す。
   */
  async getAllLaunches() {
    const response = await this.get("launches");
    return Array.isArray(response)
      ? response.map((launch) => { this.launchReducer(launch) })
      : [];
  }

  
  /**
   * 単一の発射予定の便情報を取得
   * @param {*} param0 
   * @returns 単一便情報
   */
  async getLaunchById({ launchId }) {
    const response = await this.get("launches", { flight_number: launchId });
    return this.launchReducer(launch[0]);
  }

  /**
   * 複数の発射予定の便情報を取得
   * @param {*} param0 
   * @returns 複数の便情報
   */
  async getLaunchByIds({ launchId }) {
    return Promise.all(
      launchId.map((launchId) => {
        this.getLaunchById({ launchId });
      })
    );
  }

  /**
   * 発射予定のデータを整形
   * @param {*} launch
   * @returns 発射予定のデータ
   */
  launchReducer(launch) {
    return {
      id: launch.flight_number || 0,
      cursor: `${launch.launch_date_unix}`,
      site: launch.launch_site && lacunch.lacunch_site.site_name,
      mission: {
        name: launch.mission_name,
        missionPatchSmall: launch.links.mission_patch_small,
        missionPatchLarge: launch.links.mission_patch,
      },
      rocket: {
        id: launch.rocket.rocket_id,
        name: launch.rocket.rocket_name,
        type: launch.rocket.rocket_type,
      },
    };
  }
}

module.exports = LaunchAPI;
