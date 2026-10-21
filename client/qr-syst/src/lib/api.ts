
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const response = await fetch(`${API_URL}/api/auth/csrf`, {
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
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = await getCsrfToken();
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
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
