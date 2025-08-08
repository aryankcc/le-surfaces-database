export interface Slab {
  id: string;
  slab_id: string | null;
  family: string;
  formulation: string;
  version: string | null;
  status: string;
  category: 'current' | 'development' | 'outbound';
  quantity: number | null;
  received_date: string;
  sent_to_location: string | null;
  sent_to_date: string | null;
  notes: string | null;
  image_url: string | null;
  box_shared_link: string | null;
  size: string | null;
  mold: string | null;
  buyer: string | null;
  cost_3cm: number | null;
  price_3cm: number | null;
  cost_2cm: number | null;
  price_2cm: number | null;
  created_at: string;
  updated_at: string;
}