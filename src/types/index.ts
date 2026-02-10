export interface Animal {
  id?: string | number
  mark: string
  number: string
  name: string
  sex: 'Macho' | 'Hembra'
  date_of_birth: string
  breed: string
  acquisition_type: 'Compra' | 'Nacimiento' | 'Donación' | 'Negocio'
  sellerId?: string
  acquisition_date: string
  acquisition_price: number
  status: 'Activo' | 'Vendido' | 'Muerto'
  sale_price?: number
  sale_date?: string
  notes?: string
  updated_at?: string
  buyerId?: string
  death_reason?: string
  death_date?: string
  motherId?: string | number | null
}


export interface Breed {
  id?: string
  name: string
  code: string
  origin_country: string
}

export interface Contact {
  id?: string
  name: string
  phone: string
  address: string
  type: 'Vendedor' | 'Comprador' | 'Ambos'
}
