const ApiError = require("./ApiError.utils.js");

/**
 * Middleware to wrap async functions for error handling.
 * Automatically catches errors and responds with a standardized JSON format.
 *
 * @param {Function} fn - The async function to be wrapped.
 * @returns {Function} A function that catches errors and passes them to the next middleware.
 */
const catchAsync = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn(`API Error:`, error);
      return res
        .status(error.statusCode)
        .json(new ApiError(error.statusCode, null, error.message));
    }

    console.error("Unexpected Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = catchAsync;
