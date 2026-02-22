export const validateRegister = (data) => {
  const { name, email, password } = data;
  if (!name || !email || !password) return { ok: false, message: "Name, email and password are required" };
  if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters" };
  return { ok: true };
};

export const validateLogin = (data) => {
  const { email, password } = data;
  if (!email || !password) return { ok: false, message: "Email and password are required" };
  return { ok: true };
};