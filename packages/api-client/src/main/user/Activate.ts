interface Activate {
  /** The activation code */
  code: string;
  /**
   * Whether to perform a dryrun, i.e. to only
   * check whether activation would succeed.
   * Dry-runs never issue access cookies or
   * tokens on success but failures still
   * count towards the maximum failure count.
   */
  dryrun?: boolean;

  /** A known email address to activate. */
  email?: string;

  /** An opaque key to activate, as it was sent by the API. */
  key?: string;

  /**
   * An optional label to associate with the
   * access cookie, if one is granted during
   * account activation
   */
  label?: string;

  /** A known phone number to activate. */
  phone?: string;
}

export default Activate;
