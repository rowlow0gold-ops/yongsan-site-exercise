import api from "@/lib/api";

export const registerStart   = ()                 => api.post("/api/webauthn/register/start");
export const registerFinish  = (payload)          => api.post("/api/webauthn/register/finish", payload);
export const loginStart      = ()                 => api.post("/api/webauthn/login/start");
export const loginFinish     = (payload)          => api.post("/api/webauthn/login/finish", payload);
export const listCredentials = ()                 => api.get("/api/webauthn/credentials");
export const revokeCredential = (id)              => api.delete(`/api/webauthn/credentials/${id}`);
