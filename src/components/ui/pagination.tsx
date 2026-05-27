"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

// ─── Helper: generate visible page numbers with ellipsis ───
function getVisiblePages(current: number, total: number, siblingCount = 1): (number | "ellipsis-start" | "ellipsis-end")[] {
  // Always show first and last page, plus `siblingCount` siblings around current
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = []

  if (total <= 7 + siblingCount * 2) {
    // Show all pages if total is small enough
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  const leftSiblingIndex = Math.max(current - siblingCount, 1)
  const rightSiblingIndex = Math.min(current + siblingCount, total)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < total - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount
    for (let i = 1; i <= leftCount; i++) pages.push(i)
    pages.push("ellipsis-end")
    pages.push(total)
  } else if (showLeftEllipsis && !showRightEllipsis) {
    pages.push(1)
    pages.push("ellipsis-start")
    const rightCount = 3 + 2 * siblingCount
    for (let i = total - rightCount + 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push("ellipsis-start")
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pages.push(i)
    pages.push("ellipsis-end")
    pages.push(total)
  }

  return pages
}

// ─── Types ───
interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
  siblingCount?: number
}

// ─── Main Pagination Component ───
export function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
  siblingCount = 1,
}: PaginationBarProps) {
  const [jumpValue, setJumpValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages(currentPage, totalPages, siblingCount)

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handleJump = () => {
    const page = parseInt(jumpValue, 10)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
    setJumpValue("")
  }

  const handleJumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJump()
    } else if (e.key === "Escape") {
      setJumpValue("")
      inputRef.current?.blur()
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Page Info Bar */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Showing <span className="font-medium text-slate-700 dark:text-slate-300">{startItem}</span>
          {" - "}
          <span className="font-medium text-slate-700 dark:text-slate-300">{endItem}</span>
          {" of "}
          <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems.toLocaleString()}</span> vehicles
        </span>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span>Page</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPage}</span>
          <span>of</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages.toLocaleString()}</span>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm transition-all duration-200",
            currentPage <= 1
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer active:scale-95"
          )}
          aria-label="Go to first page"
        >
          <ChevronsLeftIcon className="h-4 w-4" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className={cn(
            "inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg text-sm transition-all duration-200",
            currentPage <= 1
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer active:scale-95"
          )}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-0.5 mx-1">
          {visiblePages.map((page, idx) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex items-center justify-center h-9 w-9 text-slate-400 dark:text-slate-500 select-none"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                </span>
              )
            }

            const isActive = page === currentPage
            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "inline-flex items-center justify-center h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95",
                  isActive
                    ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                )}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {(page as number).toLocaleString()}
              </button>
            )
          })}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className={cn(
            "inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg text-sm transition-all duration-200",
            currentPage >= totalPages
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer active:scale-95"
          )}
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className={cn(
            "inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm transition-all duration-200",
            currentPage >= totalPages
              ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer active:scale-95"
          )}
          aria-label="Go to last page"
        >
          <ChevronsRightIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Jump to Page */}
      {totalPages > 7 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Jump to</span>
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={handleJumpKeyDown}
            placeholder="#"
            className={cn(
              "w-16 h-8 text-center text-sm rounded-lg border",
              "bg-white dark:bg-slate-900",
              "border-slate-200 dark:border-slate-700",
              "text-slate-700 dark:text-slate-300",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500",
              "transition-all duration-200",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
          <button
            onClick={handleJump}
            disabled={!jumpValue}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200",
              jumpValue
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-95"
                : "bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed"
            )}
          >
            Go
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Legacy exports (kept for backward compatibility, not used by new PaginationBar) ───
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<"button">, "size"> &
  React.ComponentProps<"button">

function PaginationLink({
  className,
  isActive,
  size,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "inline-flex items-center justify-center h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer active:scale-95",
        isActive
          ? "bg-gradient-to-b from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
      , className)}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon className="h-4 w-4" />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon className="h-4 w-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
