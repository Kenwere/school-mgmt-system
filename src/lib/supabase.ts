import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ClassRecord = {
  id: string;
  name: string;
  stream: string;
  teacher: string;
  room: string;
  fee_amount: number;
  created_at?: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  admission_no: string;
  gender: string;
  parent: string;
  phone: string;
  email?: string;
  class_id?: string;
  class_name?: string;
  status: "Active" | "Suspended";
  fees_status: "Paid" | "Partial" | "Pending";
  photo_url?: string;
  created_at?: string;
};

export const formatKES = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
