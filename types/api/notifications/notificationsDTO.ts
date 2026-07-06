export interface INotification {
  notificationId: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: number;
    nickname: string;
    profileImageUrl: string | null;
  } | null;
}
//v1/notifications(get)
export interface INotificationsGetResponse {
  nextCursor: string | null;
  items: INotification[];
}
//v1/notifications/hearts(get)
export interface INotificationHeartGetResponse {
  nextCursor: string | null;
  items: INotification[];
}
//v1/notifications/chats(get)
export interface INotificationChatGetResponse {
  nextCursor: string | null;
  items: INotification[];
}
//v1/notifications/clubs(get)
export interface INotificationClubGetResponse {
  nextCursor: string | null;
  items: INotification[];
}
