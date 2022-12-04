export const ResponseStatus = {
  Success: 'success',
  Fail: 'fail',
  Error: 'error',
} as const;

export type SuccessResponse<T = unknown> = {
  responseCode: number;
  status: typeof ResponseStatus.Success;
  data?: T;
};

export type FailResponse<T = Record<string, string>> = {
  responseCode: number;
  status: typeof ResponseStatus.Fail;
  data: T;
};

export type ErrorResponse = {
  responseCode: number;
  status: typeof ResponseStatus.Error;
  message: string;
};

export type ApiResponse<T = unknown> =
  | SuccessResponse<T>
  | FailResponse<T>
  | ErrorResponse;

export function generateApiResponse(
  responseCode: number,
  status: typeof ResponseStatus.Success,
  data?: unknown,
): SuccessResponse;

export function generateApiResponse(
  responseCode: number,
  status: typeof ResponseStatus.Fail,
  data: Record<string, string>,
): FailResponse;

export function generateApiResponse(
  responseCode: number,
  status: typeof ResponseStatus.Error,
  message: string,
): ErrorResponse;

export function generateApiResponse(
  responseCode: number,
  status: typeof ResponseStatus[keyof typeof ResponseStatus],
  data?: unknown,
): ApiResponse {
  if (status === ResponseStatus.Success) {
    return {
      responseCode,
      status,
      data,
    };
  }

  if (status === ResponseStatus.Fail) {
    return {
      responseCode,
      status,
      data:
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, string>)
          : { error: 'Error details not provided.' },
    };
  }

  if (status === ResponseStatus.Error) {
    return {
      responseCode,
      status,
      message:
        data && typeof data === 'string' ? data : 'Error message not provided.',
    };
  }

  throw new Error('Error generating API response.');
}
