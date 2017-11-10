interface Connection {
  conversation?: string;
  from: string;
  last_update: string;
  message?: string;
  status: 'accepted' | 'blocked' | 'cancelled' | 'ignored' | 'pending' | 'sent';
  to: string;
}

export default Connection;
