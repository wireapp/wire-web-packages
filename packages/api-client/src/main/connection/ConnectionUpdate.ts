interface ConnectionUpdate {
  status: 'accepted' | 'blocked' | 'cancelled' | 'ignored' | 'pending' | 'sent';
}

export default ConnectionUpdate;
