export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (err?.code === 11000) {
    statusCode = 400;

    const fields = err?.keyValue ? Object.keys(err.keyValue).join(", ") : "field";
    const values = err?.keyValue ? JSON.stringify(err.keyValue) : "";

    return res.status(statusCode).json({
      message: `Duplicate key error on ${fields}`,
      keyValue: err.keyValue,        
      keyPattern: err.keyPattern,   
    });
  }

  return res.status(statusCode).json({
    message: err.message || "Server Error",
 
  });
}

