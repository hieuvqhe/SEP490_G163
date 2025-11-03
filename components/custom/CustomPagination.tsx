import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface CustomPaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function CustomPagination({
  totalPages,
  currentPage,
  onPageChange,
}: CustomPaginationProps) {
  // Helper tạo danh sách trang hiển thị ngắn gọn
  const renderPageNumbers = () => {
    const pages = []
    const maxVisible = 3
    const start = Math.max(1, currentPage - 1)
    const end = Math.min(totalPages, start + maxVisible - 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        {/* Nút Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) onPageChange(currentPage - 1)
            }}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-40"
                : "hover:bg-zinc-700 hover:text-white"
            }
          />
        </PaginationItem>

        {/* Trang đầu */}
        {currentPage > 2 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(1)
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
            {currentPage > 3 && <PaginationEllipsis />}
          </>
        )}

        {/* Các trang giữa */}
        {renderPageNumbers().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault()
                onPageChange(page)
              }}
              isActive={page === currentPage}
              className={
                page === currentPage
                  ? "bg-zinc-700 text-white"
                  : "hover:bg-zinc-700 hover:text-white"
              }
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Trang cuối */}
        {currentPage < totalPages - 1 && (
          <>
            {currentPage < totalPages - 2 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(totalPages)
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Nút Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) onPageChange(currentPage + 1)
            }}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-zinc-700 hover:text-white"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
