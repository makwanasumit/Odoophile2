'use client'
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

export const Pagination: React.FC<{
  className?: string,
  page: number,
  totalPages: number,
  searchQuery?: string
  readingList?: boolean
}> = (props) => {
  const { className, page, totalPages, searchQuery, readingList = "" } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  // Function to generate proper URLs with search query parameters
  const getPageUrl = (pageNum: number) => {
    if (readingList === true) {
      if (searchQuery) {
        return `/reading-list/page/${pageNum}?query=${encodeURIComponent(searchQuery)}`
      }
      return `/reading-list/page/${pageNum}`
    }

    if (searchQuery) {
      return `/posts/page/${pageNum}?query=${encodeURIComponent(searchQuery)}`
    }
    return `/posts/page/${pageNum}`
  }


  // If there are no pages, don't show pagination
  if (totalPages <= 1) return null;



  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            {hasPrevPage ? (
              <Link href={getPageUrl(page - 1)} passHref legacyBehavior>
                <PaginationPrevious />
              </Link>
            ) : (
              <PaginationPrevious disabled />
            )}
          </PaginationItem>

          {hasExtraPrevPages && (
            <>
              <PaginationItem>
                <Link href={getPageUrl(1)} passHref legacyBehavior>
                  <PaginationLink>1</PaginationLink>
                </Link>
              </PaginationItem>
              {page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {hasPrevPage && (
            <PaginationItem>
              <Link href={getPageUrl(page - 1)} passHref legacyBehavior>
                <PaginationLink>{page - 1}</PaginationLink>
              </Link>
            </PaginationItem>
          )}

          <PaginationItem>
            <Link href={getPageUrl(page)} passHref legacyBehavior>
              <PaginationLink isActive>{page}</PaginationLink>
            </Link>
          </PaginationItem>

          {hasNextPage && (
            <PaginationItem>
              <Link href={getPageUrl(page + 1)} passHref legacyBehavior>
                <PaginationLink>{page + 1}</PaginationLink>
              </Link>
            </PaginationItem>
          )}

          {hasExtraNextPages && (
            <>
              {page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <Link href={getPageUrl(totalPages)} passHref legacyBehavior>
                  <PaginationLink>{totalPages}</PaginationLink>
                </Link>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            {hasNextPage ? (
              <Link href={getPageUrl(page + 1)} passHref legacyBehavior>
                <PaginationNext />
              </Link>
            ) : (
              <PaginationNext disabled />
            )}
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}