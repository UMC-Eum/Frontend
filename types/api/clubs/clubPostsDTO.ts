export type ClubPostCategory = "NOTICE" | "GREETING" | "REVIEW" | "FREE";

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
