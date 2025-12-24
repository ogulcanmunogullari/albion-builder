// utils/data-fetcher.ts

// Eğer env dosyası okunamazsa varsayılan olarak '/api' kullan
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Endpoint başında / varsa kaldır (çift slash olmasın)
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  // URL oluştur (örn: /api/items?slot=head)
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}/${cleanEndpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Veri çekme hatası: ${response.status} ${response.statusText}`
      );
    }

    // 204 No Content dönerse boş obje dön
    if (response.status === 204) return {} as T;

    return await response.json();
  } catch (error) {
    console.error(`Fetch hatası (${url}):`, error);
    throw error;
  }
}
