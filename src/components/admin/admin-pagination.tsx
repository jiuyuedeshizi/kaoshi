import Link from "next/link";

export function AdminPagination({
  pathname,
  page,
  totalPages,
  params,
}: {
  pathname: string;
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const createHref = (nextPage: number) => {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        search.set(key, value);
      }
    });

    search.set("page", String(nextPage));
    return `${pathname}?${search.toString()}`;
  };

  return (
    <div className="pagination-row">
      <span className="muted">
        第 {page} / {totalPages} 页
      </span>
      <div className="actions-row">
        <Link
          className="button-ghost"
          aria-disabled={page <= 1}
          href={page > 1 ? createHref(page - 1) : createHref(1)}
        >
          上一页
        </Link>
        <Link
          className="button-ghost"
          aria-disabled={page >= totalPages}
          href={page < totalPages ? createHref(page + 1) : createHref(totalPages)}
        >
          下一页
        </Link>
      </div>
    </div>
  );
}
