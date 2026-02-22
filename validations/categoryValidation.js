export const validateCategory = (data) => {
  if (!data || !data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    return { ok: false, message: "Category name is required" };
  }
  return { ok: true };
};
