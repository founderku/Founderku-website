export type StoreStyleId = "klasik" | "hangat" | "minimalis" | "elegan" | "bold";

export interface Profile {
  id: string;
  email: string;
  trial_ends_at: string | null;
  pro_expires_at: string | null;
  store_slug: string | null;
  store_style: StoreStyleId;
  is_admin: boolean;
  created_at: string;
}

// Bentuk data dari fungsi get_store_profile_by_slug/get_store_profile_by_id (kolom aman doang, bukan
// email) - dipakai di halaman publik /l/[slug] dan /toko/[storeSlug].
export interface StoreProfile {
  id: string;
  store_slug: string | null;
  has_pro: boolean;
  store_style: StoreStyleId;
}

export interface PageRow {
  id: string;
  user_id: string;
  slug: string;
  product_name: string;
  tagline: string | null;
  original_price: number | null;
  promo_price: number | null;
  highlights: string[] | null;
  image_url: string | null;
  whatsapp_number: string;
  status: "active" | "locked" | "taken_down";
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface TakedownRow {
  id: string;
  page_id: string;
  reason: string;
  taken_down_by: string | null;
  notified_user: boolean;
  created_at: string;
}
