export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
    success: true,
    data,
    message
});

export const errorResponse = (message: string, error?: any): ApiResponse<any> => ({
    success: false,
    message,
    error
});
