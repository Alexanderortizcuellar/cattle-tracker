export interface Cattle {
  id: number;
  name: string | null;
  number: string | null;
  mark: string | null;
  description: string | null;
  sex: 'MALE' | 'FEMALE';
  breed: string | null;
  date_of_birth: string | null;
  acquisition_type: string | null;
  acquisition_date: string | null;
  acquisition_price: number | null;
  seller: string | null;
  status: 'ACTIVE' | 'SOLD' | 'DEAD';
  status_date: string | null;
  sale_price: number | null;
  death_date: string | null;
  death_reason: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}
