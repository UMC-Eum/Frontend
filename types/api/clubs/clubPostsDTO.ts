export type ClubPostCategory = "NOTICE" | "CHECKIN" | "REVIEW" | "FREE";

export interface IClubPostAuthor {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
}

export interface IClubPostImage {
  imageId: number;
  imageUrl: string;
}

export interface IClubPostCommentItem {
  commentId: number;
  author: IClubPostAuthor;
  content: string;
  createdAt: string;
  isMine?: boolean;
}

export interface IClubPostDetailResponse {
  postId: number;
  clubId: number;
  category: ClubPostCategory;
  title: string | null;
  content: string;
  author: IClubPostAuthor;
  images: IClubPostImage[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked: boolean;
  isMine?: boolean;
}

export interface IClubPostCreateRequest {
  category: ClubPostCategory;
  title?: string | null;
  content: string;
  imageUrls?: string[];
}

export interface IClubPostCreateResponse {
  postId: number;
  articleId?: number;
}

export interface IClubPostUpdateRequest {
  category?: ClubPostCategory;
  title?: string | null;
  content?: string;
  imageUrls?: string[];
}

export interface IClubPostCommentCreateRequest {
  content: string;
}

export interface IClubPostCommentCreateResponse {
  commentId: number;
}

export interface IClubPostCommentsGetResponse {
  nextCursor: string | null;
  items: IClubPostCommentItem[];
}

export interface IClubPostCommentUpdateRequest {
  content: string;
}

export interface IClubPostsGetRequest {
  cursor?: string | null;
  size: number;
  category?: ClubPostCategory | "ALL";
}

export interface IClubPostListItem {
  postId: number;
  clubId: number;
  category: ClubPostCategory;
  title?: string | null;
  content: string;
  author: IClubPostAuthor;
  thumbnailImageUrl?: string | null;
  imageCount?: number;
  likeCount: number;
  commentCount: number;
  isPinned?: boolean;
  isMine?: boolean;
  createdAt: string;
}

export interface IClubPostsGetResponse {
  nextCursor: string | null;
  items: IClubPostListItem[];
}
