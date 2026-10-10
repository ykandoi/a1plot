"use client";
import React, { useMemo, useState } from 'react';

/**
 * The admin dashboard's table, shared by properties, users and brokers so all
 * three behave identically.
 *
 * Replaces three divergent implementations: a properties table that needed
 * horizontal scrolling to read (ten columns inside `overflow-x: auto`), a users
 * table with no filtering, and brokers rendered as cards with neither.
 *
 * Behaviour:
 *  - fits the screen; no sideways scrolling. Columns declare a width weight and
 *    long values wrap or ellipsize rather than pushing the table wider.
 *  - every column can carry a filter in its heading: a dropdown built from the
 *    values actually present, or a text box.
 *  - click a heading to sort by it, click again to reverse, a third time to
 *    return to the table's own default order.
 *  - single click selects a row and reveals its quick actions; double click
 *    opens it. Selection is deliberate: it lets you change a row's status
 *    without leaving the table, while opening the full record stays an
 *    explicit second action rather than something a stray click triggers.
 */

const SortIcon = ({ dir }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
       style={{ opacity: dir ? 1 : 0.25, flexShrink: 0 }}>
    {dir === 'desc' ? <path d="m6 9 6 6 6-6" /> : <path d="m18 15-6-6-6 6" />}
  </svg>
);

const asText = (v) => (v === null || v === undefined ? '' : String(v));

export default function AdminTable({
  columns,
  rows,
  getRowKey,
  defaultSort,
  onRowOpen,
  renderRowActions,
  emptyMessage = 'Nothing to show.',
  caption,
}) {
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);          // { key, dir } | null -> defaultSort
  const [selected, setSelected] = useState(null);

  // Dropdown options come from the data itself, so a filter can never offer a
  // value that matches nothing.
  const options = useMemo(() => {
    const out = {};
    for (const c of columns) {
      if (c.filter !== 'select') continue;
      const seen = new Set();
      for (const r of rows) {
        const v = asText(c.value ? c.value(r) : r[c.key]).trim();
        if (v) seen.add(v);
      }
      out[c.key] = [...seen].sort((a, b) => a.localeCompare(b));
    }
    return out;
  }, [columns, rows]);

  const visible = useMemo(() => {
    let out = rows.filter(r => columns.every(c => {
      const f = filters[c.key];
      if (!f) return true;
      const v = asText(c.value ? c.value(r) : r[c.key]).toLowerCase();
      return c.filter === 'select' ? v === f.toLowerCase() : v.includes(f.toLowerCase());
    }));
    if (sort) {
      const col = columns.find(c => c.key === sort.key);
      if (col) {
        const val = (r) => (col.sortValue ? col.sortValue(r) : (col.value ? col.value(r) : r[col.key]));
        out = [...out].sort((a, b) => {
          const av = val(a), bv = val(b);
          const cmp = (typeof av === 'number' && typeof bv === 'number')
            ? av - bv
            : asText(av).localeCompare(asText(bv), undefined, { numeric: true });
          return sort.dir === 'desc' ? -cmp : cmp;
        });
      }
    } else if (defaultSort) {
      out = [...out].sort(defaultSort);
    }
    return out;
  }, [rows, columns, filters, sort, defaultSort]);

  const toggleSort = (key) => {
    setSort(s => (!s || s.key !== key) ? { key, dir: 'asc' }
      : s.dir === 'asc' ? { key, dir: 'desc' }
      : null);                                   // third click: back to default order
  };

  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-toolbar">
        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
          {visible.length === rows.length
            ? `${rows.length} ${caption || 'rows'}`
            : `${visible.length} of ${rows.length} ${caption || 'rows'}`}
        </span>
        {(activeFilters > 0 || sort) && (
          <button type="button" className="admin-table-clear" onClick={() => { setFilters({}); setSort(null); }}>
            Clear filters &amp; sorting
          </button>
        )}
      </div>

      <table className="admin-table admin-table--fit">
        <colgroup>
          {columns.map(c => <col key={c.key} style={{ width: c.width || 'auto' }} />)}
        </colgroup>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={c.align ? { textAlign: c.align } : undefined}>
                <button
                  type="button"
                  className="admin-th-sort"
                  onClick={() => toggleSort(c.key)}
                  title={`Sort by ${c.label}`}
                >
                  <span>{c.label}</span>
                  <SortIcon dir={sort && sort.key === c.key ? sort.dir : null} />
                </button>
                {c.filter === 'select' && (
                  <select
                    className="admin-th-filter"
                    value={filters[c.key] || ''}
                    onChange={e => setFilters(f => ({ ...f, [c.key]: e.target.value }))}
                    aria-label={`Filter by ${c.label}`}
                  >
                    <option value="">All</option>
                    {(options[c.key] || []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {c.filter === 'text' && (
                  <input
                    type="search"
                    className="admin-th-filter"
                    placeholder="Filter…"
                    value={filters[c.key] || ''}
                    onChange={e => setFilters(f => ({ ...f, [c.key]: e.target.value }))}
                    aria-label={`Filter by ${c.label}`}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-muted" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                {rows.length === 0 ? emptyMessage : 'No rows match these filters.'}
              </td>
            </tr>
          ) : visible.map(r => {
            const key = getRowKey(r);
            const isSelected = selected === key;
            return (
              <React.Fragment key={key}>
                <tr
                  className={`admin-table-row-clickable${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setSelected(isSelected ? null : key)}
                  onDoubleClick={() => onRowOpen && onRowOpen(r)}
                  title="Click to select · double-click to open"
                >
                  {columns.map(c => (
                    <td key={c.key} style={c.align ? { textAlign: c.align } : undefined} data-label={c.label}>
                      {c.render ? c.render(r) : asText(c.value ? c.value(r) : r[c.key])}
                    </td>
                  ))}
                </tr>
                {isSelected && renderRowActions && (
                  <tr className="admin-row-actions-row">
                    <td colSpan={columns.length}>
                      <div className="admin-row-actions" onClick={e => e.stopPropagation()}>
                        {renderRowActions(r)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
