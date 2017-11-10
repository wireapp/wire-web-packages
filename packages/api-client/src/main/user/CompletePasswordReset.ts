interface CompletePasswordReset {
  code: string;
  email?: string;
  key?: string;
  password: string;
  phone?: string;
}

export default CompletePasswordReset;
