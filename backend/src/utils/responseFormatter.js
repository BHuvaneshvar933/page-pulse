export const successResponse = (data) => ({
    success: true,
    data,
    timestamp: new Date().toISOString(),
});

export const errorResponse = (code, message) => ({
    success: false,
    error: {
        code,
        message,
    },
    timestamp: new Date().toISOString(),
});