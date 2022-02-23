const { paginateResults } = require('./utils');

module.exports = {
  // launches、launch、meのリゾルバーを定義
  Query: {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        hasMore: launches.length ? launches[launches.length - 1].cursor !== allLaunches[allLaunches.length - 1].cursor : false 
      }
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    User: {
      trips: async (_, __, { dataSources }) => {
        const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

        // 空の配列を返す
        if(!launchIds.length) {
          return [];
        }

        // IDから発射予定の便情報を取得
        return dataSources.launch.getLaunchByIds(launchIds);

      }
    },
    me: (_, __, { dataSources }) => 
      dataSources.userAPI.findOrCreateUser(),
    Mission: {
      missionPatch: (Mission, { size } = { size: 'LARGE' }) => {
        return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge;
      }
    }
  },
};
