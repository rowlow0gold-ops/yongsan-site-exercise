import api from "@/lib/api";

// LIST (with paging/search if you want later)
export function fetchBoardList(boardKey, params) {
  return api.get(`/api/boards/${boardKey}/posts`, { params });
}

// DETAIL — never carries a password. If a guest-private post requires one,
// the server returns 403 with guestPost: true and the client calls
// unlockBoardPost below with the password in the request body.
export function fetchBoardDetail(boardKey, id) {
  return api.get(`/api/boards/${boardKey}/posts/${id}`);
}

// UNLOCK — POSTs the password in the request body so it never lands in URLs,
// access logs, or browser history. Rate-limited per (post, IP) server-side.
export function unlockBoardPost(boardKey, id, password) {
  return api.post(`/api/boards/${boardKey}/posts/${id}/unlock`, { password });
}

export function deleteBoardPost(boardKey, id, password) {
  // If your backend expects body on DELETE:
  return api.delete(`/api/boards/${boardKey}/posts/${id}`, {
    data: password ? { password } : undefined,
  });
}
