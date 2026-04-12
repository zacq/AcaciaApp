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

export interface Animal {
  id: string;
  tag_number: string;
  species: string;
  breed: string;
  sex: 'male' | 'female';
  birth_date: string;
  status: AnimalStatus;
  breeding_status?: BreedingStatus;
  health_status?: HealthStatus;
  current_group_id?: string;
  weight_kg?: number;
  withdrawal_status?: boolean;
  withdrawal_end_date?: string;
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
  dosage?: string;
  treatment_date: string;
  withdrawal_days?: number;
  withdrawal_end_date?: string;
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
