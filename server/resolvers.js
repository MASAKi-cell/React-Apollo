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

        // ユーザーIDを取得
        const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
        if(!launchIds.length) {
          return [];
        }

        // IDから発射予定の便情報を取得
        return (dataSources.launchAPI.getLaunchByIds({launchIds}) || []);

      }
    },
    me: (_, __, { dataSources }) => 
      dataSources.userAPI.findOrCreateUser(),
      Mission: {
        missionPatch: (Mission, { size } = { size: 'LARGE' }) => {
        return size === 'SMALL' ? mission.missionPatchSmall : mission.missionPatchLarge;
      }
    },
    Mutation: {
      bookTrips: async (_, { launchIds }, { dataSources }) => {
        const results = await dataSources.userAPI.bookTrips({ launchIds });
        const launches = await dataSources.launchAPI.getLaunchesByIds({
          launchIds,
        });
    
        return {
          success: results && results.length === launchIds.length,
          message:
            results.length === launchIds.length
              ? 'trips booked successfully'
              : `the following launches couldn't be booked: ${launchIds.filter(
                  id => !results.includes(id),
                )}`,
          launches,
        };
      },
      cancelTrip: async (_, { launchId }, { dataSources }) => {
        const result = await dataSources.userAPI.cancelTrip({ launchId });
    
        if (!result)
          return {
            success: false,
            message: 'failed to cancel trip',
          };
    
        const launch = await dataSources.launchAPI.getLaunchById({ launchId });
        return {
          success: true,
          message: 'trip cancelled',
          launches: [launch],
        };
      },
      login: async (_, { email }, { dataSources }) => {
        const user = await dataSources.userAPI.findOrCreateUser({ email });
  
        if(user) {
          return Buffer.from(email).toString('base64');
        }
      }
    }
  }
};
