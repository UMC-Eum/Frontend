import type { IArticleAuthor } from "../articles/articlesDTO";

export interface ICommentItem {
  commentId: number;
  parentCommentId: number | null;
  depth: number;
  contents: string;
  isMine?: boolean;
  // 서버 스펙상 탈퇴 회원 등의 댓글은 author가 null로 내려온다.
  author: IArticleAuthor | null;
  createdAt: string;
  updatedAt?: string | null;
  replies?: ICommentItem[];
}

export interface ICommentCreateRequest {
  contents: string;
  parentCommentId?: number | null;
}

export interface ICommentCreateResponse extends ICommentItem {
  articleId: number;
}

export interface ICommentsGetParams {
  cursor?: string | null;
  limit?: number;
}

export interface ICommentsGetResponse {
  articleId: number;
  totalCount: number;
  comments: ICommentItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ICommentUpdateRequest {
  contents: string;
}

export interface ICommentUpdateResponse {
  commentId: number;
  contents: string;
  updatedAt: string;
}

export interface ICommentDeleteResponse {
  commentId: number;
  deletedAt: string;
}
