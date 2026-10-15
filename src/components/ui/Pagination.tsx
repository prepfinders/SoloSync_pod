import Link from "next/link";

export function Pagination({
  page,
  pageSize,
  total,
  makeHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  makeHref: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="mt-3 flex items-center justify-between text-sm text-ink-2" aria-label="Pagination">
      <span>
        Page {page} of {pages} · {total.toLocaleString()} rows
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className="btn-ghost" href={makeHref(page - 1)}>
            Previous
          </Link>
        ) : (
          <span className="btn-ghost opacity-50">Previous</span>
        )}
        {page < pages ? (
          <Link className="btn-ghost" href={makeHref(page + 1)}>
            Next
          </Link>
        ) : (
          <span className="btn-ghost opacity-50">Next</span>
        )}
      </div>
    </nav>
  );
}
