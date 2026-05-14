export const queryKeys = {
  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
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
    posts: () => [...queryKeys.clubs.all, "posts"] as const,
    post: (postId: number) => [...queryKeys.clubs.posts(), postId] as const,
    comments: (postId: number) => [...queryKeys.clubs.post(postId), "comments"] as const,
  },
} as const;
