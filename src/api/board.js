import api from "@/lib/api";

// LIST (with paging/search if you want later)
export function fetchBoardList(boardKey, params) {
  return api.get(`/api/boards/${boardKey}/posts`, { params });
}

// DETAIL
export function fetchBoardDetail(boardKey, id, password) {
  const params = password ? { password } : {};
  return api.get(`/api/boards/${boardKey}/posts/${id}`, { params });
}

export function deleteBoardPost(boardKey, id, password) {
  // If your backend expects body on DELETE:
  return api.delete(`/api/boards/${boardKey}/posts/${id}`, {
    data: password ? { password } : undefined,
  });
}
