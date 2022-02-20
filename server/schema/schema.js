const { gql } = require("apollo-server");

const typeDefs = gql`
  # 発射情報、ユーザー情報のデータを取得
  type Query {
    launches(pageSize: Int, after: String): LaunchConnection!
    launch(id: ID!): Launch
    me: User
  }

  # 発射予定情報を格納
  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  # ロケット情報
  type Rocket {
    id: ID!
    name: String
    type: String
  }

  # ユーザー情報を格納
  type User {
    id: ID!
    email: String!
    trips: [Launch]!
  }

  # 宇宙飛行ミッションのエンブレム
  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  # エンブレムのサイズ情報
  enum PatchSize {
    SMALL
    LARGE
  }

  # 旅行を予約またはキャンセル（エラーの場合は不可）
  # TripUpdateResponseを返す
  type Mutation {
    bookTrip(launchIds: [ID]!): TripUpdateResponse!
    cancelTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): String
  }

  # レスポンスが成功/失敗の状態、message、変更対象のlaunchを返す
  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }

  type LaunchConnection {
    cursor: String!
    hasMore: Boolean!
    launches: [Launch]!
  }
`;

module.exports = typeDefs;
