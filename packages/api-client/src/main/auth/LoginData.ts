interface LoginData {
  code?: string;
  email?: string;
  handle?: string;
  password?: number | string;
  persist: boolean;
  phone?: string;
}

export default LoginData;
