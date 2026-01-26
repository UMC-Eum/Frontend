//v1/notifications(get)
export interface INotification {
  notificationId: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
export interface INotificationsGetResponse {
  nextCursor: string | null;
  items: INotification[];
}
//v1/notifications/{notificationId}/read(patch)
// {
//   "resultType": "SUCCESS",
//   "success": {
//     "data": null
//   },
//   "error": null,
//   "meta": {
//     "timestamp": "2025-12-30T04:10:00.000Z",
//     "path": "/api/v1/notifications/1/read"
//   }
// }
