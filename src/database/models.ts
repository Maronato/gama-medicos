export type Location = {
  contract: string
  lat: number
  lng: number
  address: string
}

export type Specialty = {
  contract: string
  specialty: string
  is_primary: boolean
}

export type Category = {
  contract: string
  category: string
}

export type HealthProvider = {
  contract: string
  name: string
  phone_number: string | null
  status: string
  website: string | null
  google_url: string
  rating: number | null
  total_ratings: number
  location: Location
  specialties: Specialty[]
  categories: Category[]
}
