/**
 * API Client for Django Backend
 * Handles all communication with the Django REST API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Reservation Types
export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  special_requests?: string;
}

export interface Reservation extends ReservationData {
  id: number;
  status: string;
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
      return {
        error: errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
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
    return apiFetch<Branch[]>('/branches/');
  },

  /**
   * Get a single branch by ID
   */
  get: async (id: number): Promise<ApiResponse<Branch>> => {
    return apiFetch<Branch>(`/branches/${id}/`);
  },
};

export default {
  reservations: reservationAPI,
  contacts: contactAPI,
  catering: cateringAPI,
  branches: branchAPI,
};
