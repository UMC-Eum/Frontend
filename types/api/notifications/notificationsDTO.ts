export interface INotification {
  notificationId: number | string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: number | string;
    nickname: string;
    profileImageUrl: string | null;
  } | null;
  target?: {
    clubId?: number | string;
    articleId?: number | string;
    commentId?: number | string;
    chatRoomId?: number | string;
    roomId?: number | string;
  } | null;
  clubId?: number | string | null;
  chatRoomId?: number | string | null;
  roomId?: number | string | null;
  club?: {
    id?: number | string;
    clubId?: number | string;
  } | null;
  data?: {
    clubId?: number | string;
    articleId?: number | string;
    postId?: number | string;
    chatRoomId?: number | string;
    roomId?: number | string;
    club?: {
      id?: number | string;
      clubId?: number | string;
    } | null;
  } | null;
  payload?: {
    clubId?: number | string;
    articleId?: number | string;
    postId?: number | string;
    chatRoomId?: number | string;
    roomId?: number | string;
    club?: {
      id?: number | string;
      clubId?: number | string;
    } | null;
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
