interface InvitationRequest {
  email?: string;
  invitee_name: string;
  inviter_name: string;
  locale?: string;
  message: string;
  phone?: string;
}

export default InvitationRequest;
