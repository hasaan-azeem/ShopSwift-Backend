export const errorHandler = (err, req, res, next) => {
  console.error("ERROR =>", err);

  // Express sets res.statusCode when you do res.status(4xx) before throwing.
  // err.statusCode is never set by Express automatically, so fall back correctly.
  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : (err.status || 500);

  res.status(statusCode).json({
    message: err.message || "Server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};