export function mapAuthErrorMessage(message: string | null | undefined) {
  if (!message) return "Authentication failed.";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  if (normalized.includes("user already registered")) {
    return "This email already has an account. Try signing in instead.";
  }
  if (normalized.includes("password should be at least")) {
    return "Password does not meet minimum strength requirements.";
  }
  return message;
}
