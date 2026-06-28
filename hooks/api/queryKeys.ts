export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    testAccounts: () => [...queryKeys.auth.all, "testAccounts"] as const,
  },
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
    visitors: (params: object) => [...queryKeys.users.me(), "visitors", params] as const,
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
    list: (scope: "all" | "heart" | "chat", size: number) =>
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
    messages: (chatRoomId: number, size: number) =>
      [...queryKeys.chats.room(chatRoomId), "messages", { size }] as const,
  },
  clubs: {
    all: ["clubs"] as const,
    list: (size: number, filters?: Record<string, unknown>) =>
      [...queryKeys.clubs.all, "list", { size, ...filters }] as const,
    recommended: (size: number, filters?: Record<string, unknown>) =>
      [...queryKeys.clubs.all, "recommended", { size, ...filters }] as const,
    topHosts: (size: number, filters?: Record<string, unknown>) =>
      [...queryKeys.clubs.all, "topHosts", { size, ...filters }] as const,
    myClubs: (size: number) =>
      [...queryKeys.clubs.all, "myClubs", { size }] as const,
    liked: (size: number) =>
      [...queryKeys.clubs.all, "liked", { size }] as const,
    detail: (clubId: number) => [...queryKeys.clubs.all, clubId] as const,
    archives: (clubId: number, size: number) =>
      [...queryKeys.clubs.detail(clubId), "archives", { size }] as const,
    meetings: (clubId: number, size: number) =>
      [...queryKeys.clubs.detail(clubId), "meetings", { size }] as const,
    meeting: (clubId: number, meetingId: number) =>
      [...queryKeys.clubs.meetings(clubId, 0), meetingId] as const,
    meetingAttendees: (clubId: number, meetingId: number, size: number) =>
      [...queryKeys.clubs.meeting(clubId, meetingId), "attendees", { size }] as const,
    posts: (clubId?: number, size?: number, category?: string) =>
      clubId
        ? [...queryKeys.clubs.detail(clubId), "posts", { size, category }] as const
        : [...queryKeys.clubs.all, "posts"] as const,
    post: (postId: number) => [...queryKeys.clubs.posts(), postId] as const,
    comments: (postId: number) => [...queryKeys.clubs.post(postId), "comments"] as const,
  },
  club: {
    all: ["club"] as const,
    list: (params: object) => [...queryKeys.club.all, "list", params] as const,
    detail: (clubId: number) => [...queryKeys.club.all, "detail", clubId] as const,
    recommended: () => [...queryKeys.club.all, "recommended"] as const,
    topHosts: (limit: number) => [...queryKeys.club.all, "topHosts", { limit }] as const,
    my: (params: object) => [...queryKeys.club.all, "my", params] as const,
    archives: (clubId: number, params: object) =>
      [...queryKeys.club.detail(clubId), "archives", params] as const,
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
