export interface Slab {
  id: string;
  slab_id: string;
  family: string;
  formulation: string;
  version: string | null;
  status: string;
  sku: string | null;
  quantity: number | null;
  received_date: string;
  sent_to_location: string | null;
  sent_to_date: string | null;
  notes: string | null;
  image_url: string | null;
  box_shared_link: string | null;
  created_at: string;
  updated_at: string;
}