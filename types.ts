// types.ts

export interface Batch {
  id: string;
  batch_number: string;
  exporter_name: string;
  crop_type: string;
  quantity_kg: number;
  location: string;
  destination_country: string;
  harvest_date: string;
  submitted_at: string;
  status: string;
  variety?: string;
  unit?: string;
  lab_reports?: string[];
  farm_photos?: string[];
  tests?: string[]; // ✅ Added this field
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_role: string;
  actor_name: string;
  details: Record<string, any>;
  created_at: string;
}