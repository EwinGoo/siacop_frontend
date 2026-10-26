/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx'
import {useMemo} from 'react'
import {PaginationState} from 'src/_metronic/helpers'
import {useQueryRequest} from '../../core/QueryRequestProvider'
import {useQueryResponseLoading, useQueryResponsePagination} from '../../core/QueryResponseProvider'

const mappedLabel = (label: string): string => {
  if (label === '&laquo; Anterior') {
    return 'Anterior'
  }

  if (label === 'Siguiente &raquo;') {
    return 'Siguiente'
  }

  return label
}

const ListPagination = () => {
  const pagination = useQueryResponsePagination()
  const isLoading = useQueryResponseLoading()
  const {updateState} = useQueryRequest()

  const normalizedPagination: PaginationState | null = useMemo(() => {
    if (!pagination || pagination.pageCount < 1) {
      return null
    }

    const links: Array<{label: string; active: boolean; url: string | null; page: number | null}> =
      []

    links.push({
      label: '&laquo; Anterior',
      active: false,
      url: pagination.previous,
      page: pagination.currentPage > 1 ? pagination.currentPage - 1 : null,
    })

    for (let i = 1; i <= pagination.pageCount; i += 1) {
      links.push({
        label: i.toString(),
        active: i === pagination.currentPage,
        url: `?page=${i}&items_per_page=${pagination.items_per_page}`,
        page: i,
      })
    }

    links.push({
      label: 'Siguiente &raquo;',
      active: false,
      url: pagination.next,
      page: pagination.currentPage < pagination.pageCount ? pagination.currentPage + 1 : null,
    })

    return {
      ...pagination,
      links,
    }
  }, [pagination])

  const updatePage = (page: number | undefined | null) => {
    if (!page || isLoading || !normalizedPagination || normalizedPagination.page === page) {
      return
    }

    updateState({
      page,
      items_per_page: normalizedPagination.items_per_page,
    })
  }

  const PAGINATION_PAGES_COUNT = 5

  const paginationLinks = useMemo(() => {
    if (!normalizedPagination?.links?.length) {
      return []
    }

    const scopedLinks = [...normalizedPagination.links]
    const previousLink = scopedLinks.shift()!
    const nextLink = scopedLinks.pop()!
    const halfOfPagesCount = Math.floor(PAGINATION_PAGES_COUNT / 2)
    const currentPage = normalizedPagination.currentPage

    let pageLinks = [previousLink]

    if (normalizedPagination.pageCount <= PAGINATION_PAGES_COUNT) {
      pageLinks = [...pageLinks, ...scopedLinks]
    } else if (currentPage <= halfOfPagesCount + 1) {
      pageLinks = [...pageLinks, ...scopedLinks.slice(0, PAGINATION_PAGES_COUNT)]
    } else if (currentPage >= normalizedPagination.pageCount - halfOfPagesCount) {
      pageLinks = [...pageLinks, ...scopedLinks.slice(-PAGINATION_PAGES_COUNT)]
    } else {
      pageLinks = [
        ...pageLinks,
        ...scopedLinks.slice(currentPage - halfOfPagesCount - 1, currentPage + halfOfPagesCount),
      ]
    }

    pageLinks.push(nextLink)

    return pageLinks
  }, [normalizedPagination])

  if (!normalizedPagination) {
    return null
  }

  return (
    <div className='row'>
      <div className='col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start' />
      <div className='col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'>
        <div id='kt_table_users_paginate'>
          <ul className='pagination'>
            <li
              className={clsx('page-item', {
                disabled: isLoading || normalizedPagination.currentPage === 1,
              })}
            >
              <a onClick={() => updatePage(1)} style={{cursor: 'pointer'}} className='page-link'>
                Primero
              </a>
            </li>

            {paginationLinks.map((link) => (
              <li
                key={`${link.label}-${link.page}`}
                className={clsx('page-item', {
                  active: link.active,
                  disabled: isLoading || link.page === null,
                  previous: link.label.includes('Anterior'),
                  next: link.label.includes('Siguiente'),
                })}
              >
                <a
                  className={clsx('page-link', {
                    'page-text':
                      link.label.includes('Anterior') || link.label.includes('Siguiente'),
                    'me-5': link.label.includes('Anterior'),
                  })}
                  onClick={() => updatePage(link.page)}
                  style={{cursor: link.page ? 'pointer' : 'default'}}
                >
                  {mappedLabel(link.label)}
                </a>
              </li>
            ))}

            <li
              className={clsx('page-item', {
                disabled:
                  isLoading || normalizedPagination.currentPage === normalizedPagination.pageCount,
              })}
            >
              <a
                onClick={() => updatePage(normalizedPagination.pageCount)}
                style={{cursor: 'pointer'}}
                className='page-link'
              >
                Último
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export {ListPagination}
