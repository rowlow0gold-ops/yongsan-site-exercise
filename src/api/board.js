import api from "@/utils/api";

// LIST (with paging/search if you want later)
export function fetchBoardList(boardKey, params) {
  return api.get(`/api/boards/${boardKey}/posts`, { params });
}

// DETAIL
export function fetchBoardDetail(boardKey, id) {
  return api.get(`/api/boards/${boardKey}/posts/${id}`);
}

export function deleteBoardPost(boardKey, id) {
  return api.delete(`/api/boards/${boardKey}/posts/${id}`);
}
