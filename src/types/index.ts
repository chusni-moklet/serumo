export type UserRole = "superadmin" | "admin" | "user";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  area: number;              // luas m²
  room_facilities: string[]; // fasilitas bawaan ruangan
  image_url: string;
  virtual_tour_url: string;
  map_image: string;
  gallery: string[];
  created_at: string;
}

export interface Facility {
  id: string;
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  notes: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  room?: Room;
  user?: UserProfile;
  payment?: Payment;
  booking_facilities?: BookingFacility[];
}

export interface BookingFacility {
  id: string;
  booking_id: string;
  facility_id: string;
  quantity: number;
  facility?: Facility;
}

export interface Payment {
  id: string;
  booking_id: string;
  proof_url: string;
  status: "pending" | "verified" | "rejected";
  created_at: string;
}
