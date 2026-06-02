// Lightweight REST client for the Metabook Node.js backend.
// Replaces the previous Firebase Auth + Firestore integration.

import { Book, Store, UserProfile, Order, Favorite, NewsArticle, UserRole, OrderStatus, PrintRequest, PrintRequestStatus } from './types';

const TOKEN_KEY = 'metabook_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  // Auth
  register: (email: string, password: string, role: UserRole) =>
    request<{ token: string; profile: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; profile: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ profile: UserProfile }>('/auth/me'),
  updateRole: (role: UserRole) =>
    request<{ profile: UserProfile }>('/auth/role', {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  // Users (admin)
  getUsers: () => request<UserProfile[]>('/users'),
  approveUser: (uid: string, approved: boolean) =>
    request<{ ok: boolean }>(`/users/${uid}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ approved }),
    }),
  deleteUser: (uid: string) =>
    request<{ ok: boolean }>(`/users/${uid}`, { method: 'DELETE' }),

  // Books
  getBooks: () => request<Book[]>('/books'),
  createBook: (book: Omit<Book, 'id'>) =>
    request<Book>('/books', { method: 'POST', body: JSON.stringify(book) }),
  updateBook: (book: Book) =>
    request<Book>(`/books/${book.id}`, { method: 'PUT', body: JSON.stringify(book) }),
  deleteBook: (id: string) =>
    request<{ ok: boolean }>(`/books/${id}`, { method: 'DELETE' }),

  // Stores
  getStores: () => request<Store[]>('/stores'),
  saveStore: (store: Partial<Store>) =>
    request<Store>('/stores', { method: 'POST', body: JSON.stringify(store) }),
  updateStore: (store: Store) =>
    request<Store>(`/stores/${store.id}`, { method: 'PUT', body: JSON.stringify(store) }),
  deleteStore: (id: string) =>
    request<{ ok: boolean }>(`/stores/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request<Order[]>('/orders'),
  createOrder: (order: Partial<Order>) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateOrderStatus: (id: string, status: OrderStatus, adminNote?: string) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, adminNote }) }),

  // Print Requests
  getPrintRequests: () => request<PrintRequest[]>('/print-requests'),
  createPrintRequest: (req: Omit<PrintRequest, 'id' | 'userId' | 'userEmail' | 'status' | 'createdAt'>) =>
    request<PrintRequest>('/print-requests', { method: 'POST', body: JSON.stringify(req) }),
  updatePrintRequestStatus: (id: string, status: PrintRequestStatus, adminNote?: string) =>
    request<PrintRequest>(`/print-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, adminNote }) }),
  getPrintRequestFile: (id: string) =>
    request<{ fileData: string; fileName: string }>(`/print-requests/${id}/file`),

  // Favorites
  getFavorites: () => request<Favorite[]>('/favorites'),
  toggleFavorite: (bookId: string) =>
    request<{ favorited: boolean }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    }),

  // News
  getNews: () => request<NewsArticle[]>('/news'),
  createNews: (news: Omit<NewsArticle, 'id' | 'createdAt' | 'authorName'>) =>
    request<NewsArticle>('/news', { method: 'POST', body: JSON.stringify(news) }),
  deleteNews: (id: string) =>
    request<{ ok: boolean }>(`/news/${id}`, { method: 'DELETE' }),
};
