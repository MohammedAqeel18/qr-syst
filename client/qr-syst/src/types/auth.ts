
export interface Admin {
  id: string;
  email: string;
  role: string;
}

export interface CurrentAdminResponse {
  success: boolean;
  admin: Admin;
}
