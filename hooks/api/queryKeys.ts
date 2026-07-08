export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    testAccounts: () => [...queryKeys.auth.all, "testAccounts"] as const,
  },
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
    detail: (userId: number) => [...queryKeys.users.all, "detail", userId] as const,
    visitors: (params: object) => [...queryKeys.users.me(), "visitors", params] as const,
    active: (params: object) => [...queryKeys.users.all, "active", params] as const,
    likedClubs: (params: object) =>
      [...queryKeys.users.me(), "clubs", "liked", params] as const,
  },
  recommendations: {
    all: ["recommendations"] as const,
    list: (size: number) => [...queryKeys.recommendations.all, { size }] as const,
  },
  socials: {
    all: ["socials"] as const,
    hearts: {
      all: () => [...queryKeys.socials.all, "hearts"] as const,
      sent: (size: number) => [...queryKeys.socials.hearts.all(), "sent", { size }] as const,
      received: (size: number) =>
        [...queryKeys.socials.hearts.all(), "received", { size }] as const,
    },
    blocks: (size: number) => [...queryKeys.socials.all, "blocks", { size }] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (scope: "all" | "heart" | "chat" | "club", size: number) =>
      [...queryKeys.notifications.all, scope, { size }] as const,
  },
  agreements: {
    all: ["agreements"] as const,
    list: () => [...queryKeys.agreements.all, "list"] as const,
    status: () => [...queryKeys.agreements.all, "status"] as const,
  },
  onboarding: {
    all: ["onboarding"] as const,
    voiceAnalyze: () => [...queryKeys.onboarding.all, "voiceAnalyze"] as const,
    presign: () => [...queryKeys.onboarding.all, "presign"] as const,
    profile: () => [...queryKeys.onboarding.all, "profile"] as const,
    idealPersonalities: () =>
      [...queryKeys.onboarding.all, "idealPersonalities"] as const,
  },
  chats: {
    all: ["chats"] as const,
    rooms: (size: number) => [...queryKeys.chats.all, "rooms", { size }] as const,
    room: (chatRoomId: number) => [...queryKeys.chats.all, "rooms", chatRoomId] as const,
    clubRoom: (clubId: number) =>
      [...queryKeys.chats.all, "clubs", clubId, "room"] as const,
    messages: (chatRoomId: number, size: number) =>
      [...queryKeys.chats.room(chatRoomId), "messages", { size }] as const,
  },
  clubs: {
    all: ["clubs"] as const,
    posts: () => [...queryKeys.clubs.all, "posts"] as const,
    post: (postId: number) => [...queryKeys.clubs.posts(), postId] as const,
    comments: (postId: number) => [...queryKeys.clubs.post(postId), "comments"] as const,
  },
  club: {
    all: ["club"] as const,
    list: (params: object) => [...queryKeys.club.all, "list", params] as const,
    detail: (clubId: number) => [...queryKeys.club.all, "detail", clubId] as const,
    recommended: (params: object = {}) =>
      [...queryKeys.club.all, "recommended", params] as const,
    todayRecommended: (limit: number) =>
      [...queryKeys.club.all, "todayRecommended", { limit }] as const,
    topHosts: (limit: number) => [...queryKeys.club.all, "topHosts", { limit }] as const,
    my: () => [...queryKeys.club.all, "my"] as const,
    archives: (clubId: number, params: object) =>
      [...queryKeys.club.detail(clubId), "archives", params] as const,
    recentSearches: () => [...queryKeys.club.all, "recentSearches"] as const,
  },
  articles: {
    all: (clubId: number) => [...queryKeys.club.detail(clubId), "articles"] as const,
    list: (clubId: number, params: object) =>
      [...queryKeys.articles.all(clubId), "list", params] as const,
    detail: (clubId: number, articleId: number) =>
      [...queryKeys.articles.all(clubId), articleId] as const,
    archive: (clubId: number, params: object) =>
      [...queryKeys.articles.all(clubId), "archive", params] as const,
  },
  comments: {
    all: (clubId: number, articleId: number) =>
      [...queryKeys.articles.detail(clubId, articleId), "comments"] as const,
    list: (clubId: number, articleId: number, params: object) =>
      [...queryKeys.comments.all(clubId, articleId), "list", params] as const,
  },
  meetings: {
    all: (clubId: number) => [...queryKeys.club.detail(clubId), "meetings"] as const,
    list: (clubId: number, params: object) =>
      [...queryKeys.meetings.all(clubId), "list", params] as const,
    detail: (clubId: number, meetingId: number) =>
      [...queryKeys.meetings.all(clubId), meetingId] as const,
    attendees: (clubId: number, meetingId: number, params: object) =>
      [...queryKeys.meetings.detail(clubId, meetingId), "attendees", params] as const,
  },
  host: {
    all: ["host"] as const,
    club: (clubId: number) => [...queryKeys.host.all, "club", clubId] as const,
    membersBase: (clubId: number) =>
      [...queryKeys.host.club(clubId), "members"] as const,
    members: (clubId: number, params: object) =>
      [...queryKeys.host.membersBase(clubId), params] as const,
  },
} as const;
