import { FunctionComponent } from "react"

import { StarIcon as OutlineStarIcon } from "@heroicons/react/outline"
import { StarIcon as SolidStarIcon } from "@heroicons/react/solid"
import classnames from "classnames"

import type { HealthProvider } from "@/database/models"

type ProviderItemProps = {
  provider: HealthProvider
  simple?: boolean
}

const Rating: FunctionComponent<{
  rating: number | null
  totalRatings: number
}> = ({ rating, totalRatings }) => {
  if (rating === null) {
    return <span className="leading-5">{`Nenhuma avaliação`}</span>
  }
  const roundedRating = Math.min(5, Math.max(1, Math.round(rating)))
  const stars = Array.from({ length: roundedRating }, (_, i) => (
    <SolidStarIcon key={i} className="text-yellow-400 h-5 w-5" />
  ))
  stars.push(
    ...Array.from({ length: 5 - roundedRating }).map((_, i) => (
      <OutlineStarIcon
        key={i + roundedRating}
        className="text-yellow-400 h-5 w-5"
      />
    ))
  )
  return (
    <span className="flex flex-row h-5">
      <span className="mr-1 self-center">{rating}</span>
      <span className="flex flex-row">{stars}</span>
      <span className="ml-1 self-center">{`(${totalRatings})`}</span>
    </span>
  )
}

const ProviderItem: FunctionComponent<ProviderItemProps> = ({
  provider,
  simple,
}) => {
  const wrapname =
    provider.name.length > 80
      ? provider.name.slice(0, 80).trimEnd() + "..."
      : provider.name

  const primarySpecialty = provider.specialties.find((s) => s.is_primary)
  const otherSpecialties = provider.specialties.length - 1

  return (
    <div
      className={classnames(
        "flex flex-col justify-between bg-white text-black dark:bg-neutral-800 dark:text-slate-200",
        {
          "rounded-md shadow hover:shadow-lg transition duration-200": !simple,
        }
      )}>
      <div
        className={classnames("flex flex-col", {
          "p-4": !simple,
        })}>
        {primarySpecialty && (
          <div className="flex flex-row align-middle justify-start mb-2 -ml-1">
            <div className="px-2 py-1 rounded-full font-bold bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-800 w-max text-xs self-center">
              {primarySpecialty.specialty}
            </div>
            {otherSpecialties > 0 && (
              <span className="ml-1 text-xs self-center">{`+${otherSpecialties}`}</span>
            )}
          </div>
        )}
        <div className="flex flex-row">
          <span className="text-lg font-bold leading-5 text-black dark:text-white">
            {wrapname}
          </span>
        </div>
        <div className="flex flex-row mt-2">
          <Rating
            rating={provider.rating}
            totalRatings={provider.total_ratings}
          />
        </div>
        <div className="flex flex-row mt-2">
          <span className="text-sm">{provider.location.address}</span>
        </div>
        {provider.phone_number && (
          <div className="flex flex-row mt-2">
            <a
              href={`tel:${provider.phone_number}`}
              className="text-base font-bold">
              {provider.phone_number}
            </a>
          </div>
        )}
      </div>
      <div>
        <hr className="mt-2 dark:border-neutral-600" />
        <div className="flex flex-row justify-between mt-2 px-4 pb-4">
          <span>
            {provider.website && (
              <a
                target="_blank"
                className="text-base font-bold"
                href={provider.website}
                rel="noreferrer">
                Website
              </a>
            )}
          </span>
          <a
            target="_blank"
            className="text-base font-bold"
            href={provider.google_url}
            rel="noreferrer">
            Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProviderItem
