import sql, { join, Sql, raw, empty } from "sql-template-tag"

import { isNotNull } from "@/lib/utils"

import type { DB } from "./backends"
import type {
  Review,
  Location,
  Specialty,
  Category,
  HealthProvider,
} from "./models"
import type { LatLngBounds } from "leaflet"

enum TABLE {
  PROVIDER = "provider",
  REVIEW = "review",
  CATEGORY = "category",
  SPECIALTY = "specialty",
  LOCATION = "location",
}

type NoResult = {
  contract?: undefined
}

type MaybeResult<T> = T | NoResult

type RawReview = {
  contract: string
  author_name: string
  author_photo_url: string | null
  rating: number
  text: string
  time: number
}
const parseReview = (review: MaybeResult<RawReview>): Review | null => {
  if (review.contract === undefined) {
    return null
  }
  return {
    contract: review.contract,
    author_name: review.author_name,
    author_photo_url: review.author_photo_url,
    rating: review.rating,
    text: review.text,
    time: new Date(review.time),
  }
}

type RawLocation = {
  contract: string
  lat: number
  lng: number
  address: string
  postal_code: string | null
  country: string
  state: string
  city: string
}
const parseLocation = (location: MaybeResult<RawLocation>): Location | null => {
  if (location.contract === undefined) {
    return null
  }
  return {
    contract: location.contract,
    lat: location.lat,
    lng: location.lng,
    address: location.address,
    postal_code: location.postal_code,
    country: location.country,
    state: location.state,
    city: location.city,
  }
}

type RawSpecialty = {
  contract: string
  specialty: string
  is_primary: boolean
}
const parseSpecialty = (
  specialty: MaybeResult<RawSpecialty>
): Specialty | null => {
  if (specialty.contract === undefined) {
    return null
  }
  return {
    contract: specialty.contract,
    specialty: specialty.specialty,
    is_primary: specialty.is_primary,
  }
}

type RawCategory = {
  contract: string
  category: string
}
const parseCategory = (category: MaybeResult<RawCategory>): Category | null => {
  if (category.contract === undefined) {
    return null
  }
  return {
    contract: category.contract,
    category: category.category,
  }
}

type RawHealthProvider = {
  contract: string
  name: string
  network: string
  type: string
  phone_number: string | null
  status: string
  website: string | null
  google_url: string
  rating: number | null
  total_ratings: number
}
const parseHealthProvider = (
  provider: MaybeResult<RawHealthProvider>,
  locations: Record<string, Location>,
  reviews: Record<string, Review[]>,
  categories: Record<string, Category[]>,
  specialties: Record<string, Specialty[]>
): HealthProvider | null => {
  if (provider.contract === undefined) {
    return null
  }
  return {
    contract: provider.contract,
    name: provider.name,
    network: provider.network,
    type: provider.type,
    phone_number: provider.phone_number,
    status: provider.status,
    website: provider.website,
    google_url: provider.google_url,
    rating: provider.rating,
    total_ratings: provider.total_ratings,
    location: locations[provider.contract],
    specialties: specialties[provider.contract] ?? [],
    categories: categories[provider.contract] ?? [],
    reviews: reviews[provider.contract] ?? [],
  }
}

function indexValues<T extends { contract: string }, I>(
  rawArray: I[],
  parser: (value: I) => T | null,
  toArray: true
): Record<string, T[]>
function indexValues<T extends { contract: string }, I>(
  rawArray: I[],
  parser: (value: I) => T | null,
  toArray: false
): Record<string, T>
function indexValues<T extends { contract: string }, I>(
  rawArray: I[],
  parser: (value: I) => T | null,
  toArray: boolean
): Record<string, T | T[]> {
  const array = rawArray.map(parser).filter(isNotNull)
  const indexed: Record<string, T | T[]> = {}
  for (const item of array) {
    if (toArray) {
      if (indexed[item.contract] === undefined) {
        indexed[item.contract] = []
      }
      ;(indexed[item.contract] as T[]).push(item)
    } else {
      indexed[item.contract] = item
    }
  }
  return indexed
}

const findMany = <T>(db: DB, query: Sql) => {
  return db.query(query) as Promise<MaybeResult<T>[]>
}

export async function fetchProviders(
  db: DB,
  contracts: string[]
): Promise<HealthProvider[]> {
  if (contracts.length === 0) {
    return []
  }
  // Define queries
  const reviewsQuery = sql`SELECT contract, author_name, author_photo_url, rating, "text", "time" FROM ${raw(
    TABLE.REVIEW
  )} WHERE contract IN (${join(contracts)})`
  const categoriesQuery = sql`SELECT contract, category FROM ${raw(
    TABLE.CATEGORY
  )} WHERE contract IN (${join(contracts)})`
  const specialtiesQuery = sql`SELECT contract, specialty, is_primary FROM ${raw(
    TABLE.SPECIALTY
  )} WHERE contract IN (${join(contracts)})`
  const locationsQuery = sql`SELECT contract, lat, lng, address, postal_code, country, state, city FROM ${raw(
    TABLE.LOCATION
  )} WHERE contract IN (${join(contracts)})`
  const providersQuery = sql`SELECT * FROM ${raw(
    TABLE.PROVIDER
  )} WHERE contract IN (${join(contracts)})`

  // Execute all queries in parallel
  const [reviews, categories, specialties, locations, rawProviders] =
    await Promise.all([
      findMany<RawReview>(db, reviewsQuery).then((reviews) =>
        indexValues(reviews, parseReview, true)
      ),
      findMany<Category>(db, categoriesQuery).then((categories) =>
        indexValues(categories, parseCategory, true)
      ),
      findMany<Specialty>(db, specialtiesQuery).then((specialties) =>
        indexValues(specialties, parseSpecialty, true)
      ),
      findMany<Location>(db, locationsQuery).then((locations) =>
        indexValues(locations, parseLocation, false)
      ),
      findMany<HealthProvider>(db, providersQuery),
    ])

  // Parse providers and include reviews, categories, specialties, and locations
  return rawProviders
    .map((provider) => {
      return parseHealthProvider(
        provider,
        locations,
        reviews,
        categories,
        specialties
      )
    })
    .filter(isNotNull)
}

export type ProviderFilters = {
  bounds?: LatLngBounds
  name?: string
  sort?: "name" | "rating"
  specialties?: string[]
  categories?: string[]
}

export async function filterProviders(
  db: DB,
  { bounds, name, specialties, categories }: ProviderFilters = {}
): Promise<string[]> {
  // Each filter is a separate query
  const filters: Sql[] = [sql`p.status IN (${join(["OPERATIONAL"])})`]
  const joins: Sql[] = []

  if (bounds !== undefined) {
    filters.push(
      sql`l.lat BETWEEN ${bounds.getSouth()} AND ${bounds.getNorth()}`
    )
    filters.push(sql`l.lng BETWEEN ${bounds.getWest()} AND ${bounds.getEast()}`)
    joins.push(
      sql`${raw(`JOIN ${TABLE.LOCATION} l ON l.contract = p.contract`)}`
    )
  }

  if (name !== undefined && name.length > 0) {
    filters.push(sql`p.name LIKE ${`%${name}%`}`)
  }

  if (specialties !== undefined && specialties.length > 0) {
    filters.push(sql`s.specialty IN (${join(specialties)})`)
    joins.push(
      sql`${raw(`JOIN ${TABLE.SPECIALTY} s ON s.contract = p.contract`)}`
    )
  }

  if (categories !== undefined && categories.length > 0) {
    filters.push(sql`c.category IN (${join(categories)})`)
    joins.push(
      sql`${raw(`JOIN ${TABLE.CATEGORY} c ON c.contract = p.contract`)}`
    )
  }

  // Define the query and include filters and joins
  const query = sql`SELECT DISTINCT p.contract FROM ${raw(TABLE.PROVIDER)} p
    ${joins.length > 0 ? join(joins, " ") : empty}
		WHERE ${join(filters, " AND ")}`

  // Execute the query and remove nulls
  const contracts = (await db.query(query)) as MaybeResult<{
    contract: string
  }>[]
  return contracts
    .map((c) => (c.contract ? c.contract : null))
    .filter(isNotNull)
}

export const filterFetchProvider = async (
  db: DB,
  filters: ProviderFilters = {}
) => {
  // Fetch providers by contract, fetch their info and sort them
  const contracts = await filterProviders(db, filters)
  const results = await fetchProviders(db, contracts)
  switch (filters.sort) {
    case "name":
      return results.sort((a, b) => a.name.localeCompare(b.name))
    case "rating":
      return results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    default:
      return results
  }
}

export const fetchSpecialties = async (db: DB): Promise<Specialty[]> => {
  const query = sql`SELECT DISTINCT specialty FROM ${raw(TABLE.SPECIALTY)}`
  const specialties = (await db.query(query)) as Specialty[]
  return specialties
    .filter((s) => s.specialty && s.specialty.length > 0)
    .sort((a, b) => a.specialty.localeCompare(b.specialty))
}

export const fetchCategories = async (db: DB): Promise<Category[]> => {
  const query = sql`SELECT DISTINCT category FROM ${raw(TABLE.CATEGORY)}`
  const categories = (await db.query(query)) as Category[]
  return categories
    .filter((s) => s.category && s.category.length > 0)
    .filter(isNotNull)
    .sort((a, b) => a.category.localeCompare(b.category))
}
