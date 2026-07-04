import type { ClubAuthority } from "../club/clubDTO";
import type { ICommentItem } from "../comments/commentsDTO";

export type ArticleCategory =
  | "NOTICE"
  | "CHECKIN"
  | "REVIEW"
  | "FREE"
  | "FAQ"
  | (string & {});

export type ArticleSort = "recent" | "popular";

export interface IArticleAuthor {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  authority?: ClubAuthority;
}

export interface IArticlePhoto {
  photoId: number;
  photoUrl: string;
}

export interface IArticlesGetParams {
  category?: ArticleCategory;
  sort?: ArticleSort;
  cursor?: string | null;
  limit?: number;
}

export interface IArticleListItem {
  articleId: number;
  title: string | null;
  preview: string;
  category: ArticleCategory;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string | null;
  author: IArticleAuthor;
  createdAt: string;
}

export interface IArticlesGetResponse {
  clubId: number;
  articles: IArticleListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface IArticleCreateRequest {
  title?: string | null;
  contents: string;
  category: ArticleCategory;
  photoUrls?: string[];
}

export interface IArticleResponse {
  articleId: number;
  clubId: number;
  title: string | null;
  contents: string;
  category: ArticleCategory;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  isMine?: boolean;
  author: IArticleAuthor;
  photos: IArticlePhoto[];
  comments?: ICommentItem[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface IArticleCreateResponse extends IArticleResponse {}

export interface IArticleUpdateRequest {
  title?: string | null;
  contents?: string;
  category?: ArticleCategory;
  photoUrls?: string[];
}

export interface IArticleUpdateResponse {
  articleId: number;
  updatedAt: string;
}

export interface IArticleDeleteResponse {
  articleId: number;
  deletedAt: string;
}

export interface IArticleLikeResponse {
  articleId: number;
  isLiked: boolean;
  likeCount: number;
}

export interface IArticlePinRequest {
  isPinned: boolean;
}

export interface IArticlePinResponse {
  articleId: number;
  isPinned: boolean;
  updatedAt: string;
}

export interface IArticleArchiveParams extends IArticlesGetParams {}

export interface IArticleArchiveItem {
  photoId: number;
  articleId: number;
  photoUrl: string;
  createdAt: string;
}

export interface IArticleArchiveResponse {
  items: IArticleArchiveItem[];
  nextCursor: string | null;
  hasMore: boolean;
}
