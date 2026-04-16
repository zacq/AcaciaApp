export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'vet';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type AnimalStatus = 'active' | 'sold' | 'dead' | 'culled' | 'archived';
export type BreedingStatus = 'open' | 'exposed' | 'pregnant' | 'bred' | 'retired';
export type HealthStatus = 'healthy' | 'under_treatment' | 'monitor' | 'critical';
export type BreedingClass = 'Fullblood' | 'Purebred' | 'Commercial';
export type BornAs = 'single' | 'twin' | 'triplet' | 'quad';
export type ImageSlot = 'front' | 'side' | 'rear';

export interface Animal {
  id: string;

  // Identification
  tag_number: string;
  visual_id?: string;
  eid?: string;                     // Electronic ID (RFID)
  name?: string;                    // Animal name
  pedigree_id?: string;             // Registry pedigree ID
  registration_number?: string;

  // Classification
  species: string;
  breed: string;
  sex: 'male' | 'female';
  breeding_class?: BreedingClass;
  born_as?: BornAs;
  color_markings?: string;
  color_type?: string;

  // Dates
  birth_date: string;
  acquisition_date?: string;

  // Parentage
  sire_id?: string;
  dam_id?: string;
  dam_sire?: string;                // Text fallback for unregistered dam sire
  sire_sire?: string;               // Text fallback for unregistered sire sire
  adopted_dam?: string;
  breeder_name?: string;
  source_country?: string;
  import_batch?: string;

  // Status
  status: AnimalStatus;
  breeding_status?: BreedingStatus;
  health_status?: HealthStatus;
  cull?: boolean;

  // Regulatory
  scrapie_tag?: string;

  // Physical (cached latest — always write to animal_weights too)
  weight_kg?: number;
  body_condition_score?: number;
  withdrawal_status?: boolean;
  withdrawal_end_date?: string;

  // Group
  current_group_id?: string;

  // Breed genetics
  breed_percentage?: number;        // e.g. 87.5

  notes?: string;
  created_at: string;
  updated_at?: string;
  archived_at?: string;
}

export interface AnimalImage {
  id: string;
  animal_id: string;
  file_url: string;
  file_path: string;
  slot: ImageSlot;
  is_primary: boolean;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
}

export interface AnimalWeight {
  id: string;
  animal_id: string;
  weight_kg: number;
  recorded_at: string;
  age_days?: number;
  condition_score?: number;
  recorded_by?: string;
  notes?: string;
  created_at: string;
}

export interface AnimalGroup {
  id: string;
  name: string;
  purpose?: string;
  location?: string;
  created_at: string;
}

export interface Treatment {
  id: string;
  animal_id: string;
  medicine_id?: string;
  medicine_name?: string;
  dosage?: string;
  treatment_date: string;
  withdrawal_days?: number;
  withdrawal_end_date?: string;
  administered_by?: string;
  notes?: string;
  created_at: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  reminder_at?: string;
  is_pinned?: boolean;
  created_by: string;
  created_at: string;
}
