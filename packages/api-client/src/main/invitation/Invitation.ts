interface Invitation {
  created_at: string;
  email?: string;
  id: string;
  inviter: string;
  name: string;
  phone?: string;
}

export default Invitation;
