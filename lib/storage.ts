// Local storage utility as an alternative to Supabase
// This provides simple client-side storage for reservations and contact forms

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  occasion?: string;
  specialRequests?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

export interface CateringRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  message?: string;
  createdAt: string;
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Reservation Storage
export const reservationStorage = {
  save: (reservation: Omit<Reservation, 'id' | 'createdAt'>): Reservation => {
    const newReservation: Reservation = {
      ...reservation,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const existing = reservationStorage.getAll();
    existing.push(newReservation);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('khanz_reservations', JSON.stringify(existing));
    }
    
    return newReservation;
  },

  getAll: (): Reservation[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem('khanz_reservations');
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Reservation | null => {
    const reservations = reservationStorage.getAll();
    return reservations.find(r => r.id === id) || null;
  },

  delete: (id: string): boolean => {
    const reservations = reservationStorage.getAll();
    const filtered = reservations.filter(r => r.id !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('khanz_reservations', JSON.stringify(filtered));
    }
    
    return filtered.length < reservations.length;
  },
};

// Contact Message Storage
export const contactStorage = {
  save: (message: Omit<ContactMessage, 'id' | 'createdAt'>): ContactMessage => {
    const newMessage: ContactMessage = {
      ...message,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const existing = contactStorage.getAll();
    existing.push(newMessage);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('khanz_contacts', JSON.stringify(existing));
    }
    
    return newMessage;
  },

  getAll: (): ContactMessage[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem('khanz_contacts');
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): ContactMessage | null => {
    const messages = contactStorage.getAll();
    return messages.find(m => m.id === id) || null;
  },

  delete: (id: string): boolean => {
    const messages = contactStorage.getAll();
    const filtered = messages.filter(m => m.id !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('khanz_contacts', JSON.stringify(filtered));
    }
    
    return filtered.length < messages.length;
  },
};

// Catering Request Storage
export const cateringStorage = {
  save: (request: Omit<CateringRequest, 'id' | 'createdAt'>): CateringRequest => {
    const newRequest: CateringRequest = {
      ...request,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const existing = cateringStorage.getAll();
    existing.push(newRequest);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('khanz_catering', JSON.stringify(existing));
    }
    
    return newRequest;
  },

  getAll: (): CateringRequest[] => {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem('khanz_catering');
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): CateringRequest | null => {
    const requests = cateringStorage.getAll();
    return requests.find(r => r.id === id) || null;
  },

  delete: (id: string): boolean => {
    const requests = cateringStorage.getAll();
    const filtered = requests.filter(r => r.id !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('khanz_catering', JSON.stringify(filtered));
    }
    
    return filtered.length < requests.length;
  },
};

// Export all storage utilities
export const storage = {
  reservations: reservationStorage,
  contacts: contactStorage,
  catering: cateringStorage,
};

export default storage;
