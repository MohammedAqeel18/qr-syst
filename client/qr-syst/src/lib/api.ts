
type CsrfResponse = {
  success: boolean;
  csrfToken: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

async function getCsrfToken(): Promise<string> {
  const response = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
  });

  const data = (await response.json()) as CsrfResponse;

  if (!response.ok || !data.csrfToken) {
    throw new Error("Could not obtain a CSRF token. Please sign in again.");
  }

  return data.csrfToken;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  const normalizedPath = path.split("?")[0];
  const isSafeMethod = ["GET", "HEAD", "OPTIONS"].includes(method);
  const isLoginRequest = normalizedPath === "/api/auth/login";

  if (!isSafeMethod && !isLoginRequest) {
    const csrfToken = await getCsrfToken();
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(path, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    const validationMessages = errorData?.errors
      ?.map((error) => `${error.field}: ${error.message}`)
      .join("; ");

    throw new Error(
      validationMessages ||
        errorData?.message ||
        `API request failed with status ${response.status}`,
    );
  }

  return data as T;
}
