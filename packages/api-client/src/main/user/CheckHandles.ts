interface CheckHandles {
  handles: string[]; // The prioritised list of handles to check (up to 50)
  return?: number; // Desired number of free handles to return (1 - 10)
}

export default CheckHandles;
