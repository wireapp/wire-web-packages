interface SendActivationCode {
  /** Email address to send the code to., */
  email?: string;

  /** E.164 phone number to send the code to. */
  phone?: string;

  /** Locale to use for the activation code template. */
  locale?: string;

  /** Request the code with a call instead (default is SMS). */
  voice_call?: boolean;
}

export default SendActivationCode;
