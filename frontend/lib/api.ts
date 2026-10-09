/**
 * API Client for Django Backend
 * Handles all communication with the Django REST API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Reservation Types
export type PaymentMethod = 'card' | 'cash' | 'cash_on_pickup' | 'cash_on_delivery';

export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time?: string;
  time_slot_id?: number;
  adult_guests: number;
  child_guests: number;
  guests?: number;
  occasion?: string;
  special_requests?: string;
  branch?: string;
  branch_slug?: string;
  payment_method?: PaymentMethod;
  source?: 'web' | 'mobile' | 'admin' | 'phone' | 'walk_in' | 'partner';
}

export interface Reservation extends ReservationData {
  id: number;
  reference: string;
  status: string;
  payment_status: string;
  deposit_required: boolean;
  deposit_amount: string;
  payment_method: PaymentMethod;
  branch_details?: Branch;
  google_calendar_event_id?: string;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

// Contact Message Types
export interface ContactMessageData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactMessage extends ContactMessageData {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Catering Request Types
export interface CateringRequestData {
  name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  venue_address?: string;
  message?: string;
}

export interface CateringRequest extends CateringRequestData {
  id: number;
  status: string;
  estimated_budget?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Branch Types
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  is_flagship: boolean;
  is_active: boolean;
  google_maps_url?: string;
  description?: string;
  code?: string;
  slug: string;
  booking_enabled: boolean;
  currency: string;
  booking_interval_minutes: number;
  default_booking_duration_minutes: number;
  min_advance_minutes: number;
  max_advance_days: number;
  max_online_party_size: number;
  online_capacity: number;
  deposit_policy: 'none' | 'fixed' | 'per_guest';
  deposit_amount: string;
  accepted_payment_methods?: PaymentMethod[];
  online_payments_enabled?: boolean;
  sort_order: number;
}

export interface ReservationLookup {
  id: number;
  reference: string;
  status: string;
  payment_status: string;
  payment_method: PaymentMethod;
  deposit_required: boolean;
  deposit_amount: string;
  date: string;
  time: string;
  adult_guests: number;
  child_guests: number;
  branch_name: string;
  currency: string;
}

export interface MenuItemOption {
  id: number;
  name: string;
  additional_price: string;
  display_order: number;
}

export interface MenuItem {
  id: number;
  code: string;
  name: string;
  description: string;
  price: string;
  dietary_labels: string[];
  spice_level: number;
  is_popular: boolean;
  is_chef_special: boolean;
  display_order: number;
  branch_slugs: string[];
  options: MenuItemOption[];
}

export interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  items: MenuItem[];
}

export interface AvailabilitySlot {
  id: number;
  time: string;
  label: string;
  available: boolean;
  capacity: number;
  booked_guests: number;
  remaining_capacity: number;
}

/** Flatten DRF error payloads ({field: ["msg"]}) into one readable sentence. */
function readableError(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map(readableError).filter(Boolean).join(' ');
  if (typeof raw === 'object') return Object.values(raw as Record<string, unknown>).map(readableError).filter(Boolean).join(' ');
  return String(raw);
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const rawError = errorData.detail || errorData.message || errorData;
      return { error: readableError(rawError) || `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Reservation API
 */
export const reservationAPI = {
  /**
   * Create a new reservation
   */
  create: async (data: ReservationData): Promise<ApiResponse<Reservation>> => {
    return apiFetch<Reservation>('/reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  availability: async (branch: string, date: string, guests: number): Promise<ApiResponse<{ branch: Branch; date: string; slots: AvailabilitySlot[] }>> => {
    const params = new URLSearchParams({ branch, date, guests: String(guests) });
    return apiFetch<{ branch: Branch; date: string; slots: AvailabilitySlot[] }>(`/reservations/availability/?${params}`);
  },

  createPaymentIntent: async (id: number, email: string): Promise<ApiResponse<{ client_secret: string; publishable_key: string }>> => {
    return apiFetch<{ client_secret: string; publishable_key: string }>(`/reservations/${id}/payment-intent/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  createCheckoutSession: async (id: number, email: string): Promise<ApiResponse<{ checkout_url: string }>> => {
    return apiFetch<{ checkout_url: string }>(`/reservations/${id}/checkout-session/`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  lookup: async (reference: string, email: string): Promise<ApiResponse<ReservationLookup>> => {
    const params = new URLSearchParams({ reference, email });
    return apiFetch<ReservationLookup>(`/reservations/lookup/?${params}`);
  },

  /**
   * Get all reservations
   */
  list: async (): Promise<ApiResponse<Reservation[]>> => {
    return apiFetch<Reservation[]>('/reservations/');
  },

  /**
   * Get a single reservation by ID
   */
  get: async (id: number): Promise<ApiResponse<Reservation>> => {
    return apiFetch<Reservation>(`/reservations/${id}/`);
  },

  /**
   * Update a reservation
   */
  update: async (id: number, data: Partial<ReservationData>): Promise<ApiResponse<Reservation>> => {
    return apiFetch<Reservation>(`/reservations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a reservation
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return apiFetch<void>(`/reservations/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Confirm a reservation
   */
  confirm: async (id: number): Promise<ApiResponse<{ status: string }>> => {
    return apiFetch<{ status: string }>(`/reservations/${id}/confirm/`, {
      method: 'POST',
    });
  },

  /**
   * Cancel a reservation
   */
  cancel: async (id: number): Promise<ApiResponse<{ status: string }>> => {
    return apiFetch<{ status: string }>(`/reservations/${id}/cancel/`, {
      method: 'POST',
    });
  },
};

/**
 * Contact Message API
 */
export const contactAPI = {
  /**
   * Create a new contact message
   */
  create: async (data: ContactMessageData): Promise<ApiResponse<ContactMessage>> => {
    return apiFetch<ContactMessage>('/contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all contact messages
   */
  list: async (): Promise<ApiResponse<ContactMessage[]>> => {
    return apiFetch<ContactMessage[]>('/contacts/');
  },

  /**
   * Get a single contact message by ID
   */
  get: async (id: number): Promise<ApiResponse<ContactMessage>> => {
    return apiFetch<ContactMessage>(`/contacts/${id}/`);
  },

  /**
   * Mark message as read
   */
  markRead: async (id: number): Promise<ApiResponse<{ status: string }>> => {
    return apiFetch<{ status: string }>(`/contacts/${id}/mark_read/`, {
      method: 'POST',
    });
  },

  /**
   * Mark message as replied
   */
  markReplied: async (id: number): Promise<ApiResponse<{ status: string }>> => {
    return apiFetch<{ status: string }>(`/contacts/${id}/mark_replied/`, {
      method: 'POST',
    });
  },
};

/**
 * Catering Request API
 */
export const cateringAPI = {
  /**
   * Create a new catering request
   */
  create: async (data: CateringRequestData): Promise<ApiResponse<CateringRequest>> => {
    return apiFetch<CateringRequest>('/catering/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all catering requests
   */
  list: async (): Promise<ApiResponse<CateringRequest[]>> => {
    return apiFetch<CateringRequest[]>('/catering/');
  },

  /**
   * Get a single catering request by ID
   */
  get: async (id: number): Promise<ApiResponse<CateringRequest>> => {
    return apiFetch<CateringRequest>(`/catering/${id}/`);
  },

  /**
   * Update catering request status
   */
  updateStatus: async (id: number, status: string): Promise<ApiResponse<{ status: string }>> => {
    return apiFetch<{ status: string }>(`/catering/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};

/**
 * Branch API
 */
export const branchAPI = {
  /**
   * Get all active branches
   */
  list: async (): Promise<ApiResponse<Branch[]>> => {
    const response = await apiFetch<Branch[] | Paginated<Branch>>('/branches/');
    if (response.error || !response.data) return { error: response.error || 'Unable to load branches.' };
    return { data: Array.isArray(response.data) ? response.data : response.data.results };
  },

  /**
   * Get a single branch by ID
   */
  get: async (id: number): Promise<ApiResponse<Branch>> => {
    return apiFetch<Branch>(`/branches/${id}/`);
  },
};

export const menuAPI = {
  list: async (branch?: string): Promise<ApiResponse<MenuCategory[]>> => {
    const suffix = branch ? `?branch=${encodeURIComponent(branch)}` : '';
    return apiFetch<MenuCategory[]>(`/menus/${suffix}`);
  },
};

export default {
  reservations: reservationAPI,
  contacts: contactAPI,
  catering: cateringAPI,
  branches: branchAPI,
  menus: menuAPI,
};
