import React from 'react'
import './styles.scss'

const Pagination = ({ total, page, pageSize, onChange, className, buttonSize }) => {

  const totalPages = Math.ceil(total / pageSize)
  const pages = new Array(totalPages).fill(null)
  const handleChange = page => onChange && onChange(page)

  return (
    <div className={`component-pagination ${className} size-${buttonSize}`}>
      <button className="prev-page" disabled={page <= 1} onClick={() => handleChange(page - 1)}><i className="icon-arrow-left"></i></button>
      {pages.map((_, index) => (<button key={index} className="page" data-active={index + 1 === page} onClick={() => handleChange(index + 1)}>{index + 1}</button>))}
      <button className="next-page" disabled={page >= totalPages} onClick={() => handleChange(page + 1)}><i className="icon-arrow-right"></i></button>
    </div>
  )

}

Pagination.defaultProps = {
  total: 0,
  page: 1,
  pageSize: 12,
  className: '',
  buttonSize: 'medium'
}

export default React.memo(Pagination)