import { X } from 'lucide-react'

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>
}
export function Card({ children, className = '' }) { return <section className={`card ${className}`}>{children}</section> }
export function Field({ label, hint, children, className = '' }) {
  return <label className={`field ${className}`}><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
export function Badge({ children, tone = 'blue' }) { return <span className={`badge badge-${tone}`}>{children}</span> }
export function Metric({ label, value, sub, tone = 'blue' }) {
  return <Card className={`metric metric-${tone}`}><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</Card>
}
export function PageHeader({ title, subtitle, actions }) {
  return <header className="page-header"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="actions">{actions}</div>}</header>
}
export function Empty({ children = 'Nenhum dado encontrado.' }) { return <div className="empty">{children}</div> }
export function Loading() { return <div className="loading"><span /> Carregando...</div> }
export function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}>
    <header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20}/></button></header>
    <div className="modal-body">{children}</div>{footer && <footer>{footer}</footer>}
  </div></div>
}
export function Progress({ value = 0 }) { return <div className="progress"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div> }
export function DataTable({ columns, rows, empty = 'Nenhum registro.' }) {
  if (!rows.length) return <Empty>{empty}</Empty>
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={row.id || i}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>)}</tr>)}</tbody></table></div>
}
export function Toast({ message, tone = 'success' }) { return message ? <div className={`toast toast-${tone}`}>{message}</div> : null }
