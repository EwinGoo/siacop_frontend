import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react'
import Swal from 'sweetalert2'
import {toast} from 'react-toastify'
import {KTCard, KTCardBody, useDebounce} from '../../../../../_metronic/helpers'
import {
  actualizarHorarioAlterno,
  crearHorarioAlterno,
  eliminarHorarioAlterno,
  listarHorarioAlternos,
  listarHorarioTiposDropdown,
  listarHorariosBase,
} from './core/_requests'
import {HorarioAlterno, HorarioBase, HorarioTipo, initialHorarioAlterno} from './core/_models'
import {
  ActionButtons,
  EmptyRow,
  EstadoBadge,
  Field,
  FieldErrors,
  HorarioModal,
  ListHeader,
  ListPagination,
  LoadingRow,
  ModalActions,
  SwitchField,
  extractFieldErrors,
  getBackendMessage,
  isActive,
} from './components/HorarioCommon'
import useDateFormatter from 'src/app/hooks/useDateFormatter'

const HorarioAlternoPage = () => {
  const [items, setItems] = useState<HorarioAlterno[]>([])
  const [horariosBase, setHorariosBase] = useState<HorarioBase[]>([])
  const [tipos, setTipos] = useState<HorarioTipo[]>([])
  const [search, setSearch] = useState('')
  const [idHorarioTipo, setIdHorarioTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<HorarioAlterno>(initialHorarioAlterno)
  const [errors, setErrors] = useState<FieldErrors>({})
  const debouncedSearchTerm = useDebounce(search, 500)
  const {formatShortDate} = useDateFormatter()

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [limit, total])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listarHorarioAlternos({
        search: debouncedSearchTerm || undefined,
        id_horario_tipo: idHorarioTipo || undefined,
        estado: estado || undefined,
        page,
        limit,
      })
      setItems(response.data || [])
      setTotal(response.pagination?.total || 0)
    } catch (err: any) {
      toast.error(getBackendMessage(err, 'No se pudieron cargar horarios alternos.'))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, estado, idHorarioTipo, limit, page])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm])

  useEffect(() => {
    const init = async () => {
      try {
        const [base, tiposResponse] = await Promise.all([
          listarHorariosBase(),
          listarHorarioTiposDropdown(),
        ])
        setHorariosBase(base)
        setTipos(tiposResponse)
      } catch (err: any) {
        toast.error(getBackendMessage(err, 'No se pudieron cargar catalogos de horario.'))
      }
    }
    void init()
  }, [])

  const horarioLabel = useCallback(
    (idHorario: number | '') => {
      const horario = horariosBase.find((item) => item.id_horario === Number(idHorario))
      if (!horario) return 'Seleccione un horario'
      return `${horario.nombre_horario_tipo || 'Horario'} | ${horario.hora_inicio || '-'} - ${
        horario.hora_fin || '-'
      }`
    },
    [horariosBase]
  )

  const abrirNuevo = () => {
    setEditingId(null)
    setErrors({})
    setForm(initialHorarioAlterno)
    setFormOpen(true)
  }

  const abrirEditar = (item: HorarioAlterno) => {
    setEditingId(Number(item.id_horario_alterno))
    setErrors({})
    setForm({
      ...initialHorarioAlterno,
      ...item,
      estado_horario_alterno: isActive(item.estado_horario_alterno),
    })
    setFormOpen(true)
  }

  const cerrar = () => {
    setFormOpen(false)
    setEditingId(null)
    setErrors({})
    setForm(initialHorarioAlterno)
  }

  const validar = () => {
    const next: FieldErrors = {}
    if (!form.id_horario) next.id_horario = 'Seleccione el horario base.'
    if (!form.fecha_inicio_horario_alterno)
      next.fecha_inicio_horario_alterno = 'La fecha inicio es obligatoria.'
    if (!form.fecha_fin_horario_alterno)
      next.fecha_fin_horario_alterno = 'La fecha fin es obligatoria.'
    if (
      form.fecha_inicio_horario_alterno &&
      form.fecha_fin_horario_alterno &&
      form.fecha_inicio_horario_alterno > form.fecha_fin_horario_alterno
    ) {
      next.fecha_fin_horario_alterno = 'La fecha fin no puede ser menor a la fecha inicio.'
    }
    if (!form.hora_inicio_alterno) next.hora_inicio_alterno = 'La hora inicio es obligatoria.'
    if (!form.hora_fin_alterno) next.hora_fin_alterno = 'La hora fin es obligatoria.'
    if (
      form.hora_inicio_alterno &&
      form.hora_fin_alterno &&
      form.hora_inicio_alterno >= form.hora_fin_alterno
    ) {
      next.hora_fin_alterno = 'La hora fin debe ser mayor a la hora inicio.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validar()) return

    setSaving(true)
    setErrors({})
    try {
      const payload = {
        ...form,
        id_horario: Number(form.id_horario),
        estado_horario_alterno: form.estado_horario_alterno ? 1 : 0,
      }
      if (editingId) {
        await actualizarHorarioAlterno(editingId, payload)
        toast.success('Horario alterno actualizado correctamente.')
      } else {
        await crearHorarioAlterno(payload)
        toast.success('Horario alterno creado correctamente.')
      }
      cerrar()
      await cargar()
    } catch (err: any) {
      setErrors(extractFieldErrors(err))
      toast.error(getBackendMessage(err, 'No se pudo guardar el horario alterno.'))
    } finally {
      setSaving(false)
    }
  }

  const inactivar = async (item: HorarioAlterno) => {
    const result = await Swal.fire({
      title: 'Inactivar horario alterno',
      text: `Deseas inactivar el horario alterno del ${item.fecha_inicio_horario_alterno} al ${item.fecha_fin_horario_alterno}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, inactivar',
      cancelButtonText: 'Cancelar',
      customClass: {confirmButton: 'btn btn-danger', cancelButton: 'btn btn-light'},
      buttonsStyling: false,
    })

    if (!result.isConfirmed || !item.id_horario_alterno) return

    try {
      await eliminarHorarioAlterno(item.id_horario_alterno)
      toast.success('Horario alterno inactivado correctamente.')
      await cargar()
    } catch (err: any) {
      toast.error(getBackendMessage(err, 'No se pudo inactivar el horario alterno.'))
    }
  }

  return (
    <KTCard>
      <ListHeader
        search={search}
        onSearchChange={setSearch}
        onSearch={() => (page === 1 ? void cargar() : setPage(1))}
        loading={loading}
        buttonLabel='Nuevo alterno'
        buttonTitle='Agregar horario alterno'
        onCreate={abrirNuevo}
      >
        <select
          className='form-select form-select-solid w-175px'
          value={idHorarioTipo}
          onChange={(e) => {
            setIdHorarioTipo(e.target.value)
            setPage(1)
          }}
        >
          <option value=''>Todos los tipos</option>
          {tipos.map((tipo) => (
            <option key={tipo.id_horario_tipo} value={tipo.id_horario_tipo}>
              {tipo.nombre_horario_tipo}
            </option>
          ))}
        </select>
        <select
          className='form-select form-select-solid w-150px'
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value)
            setPage(1)
          }}
        >
          <option value=''>Todo estado</option>
          <option value='1'>Activo</option>
          <option value='0'>Inactivo</option>
        </select>
      </ListHeader>

      <KTCardBody className='py-4'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-4'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='min-w-230px'>Horario base</th>
                <th className='min-w-200px'>Rango de fechas</th>
                <th className='min-w-170px'>Horario alterno</th>
                <th className='min-w-240px'>Descripcion</th>
                <th className='min-w-120px'>Estado</th>
                <th className='text-end min-w-110px'>Acciones</th>
              </tr>
            </thead>
            <tbody className='text-gray-700 fw-semibold'>
              {loading ? (
                <LoadingRow colSpan={6} text='Cargando horarios alternos...' />
              ) : items.length === 0 ? (
                <EmptyRow colSpan={6} text='No se encontraron horarios alternos.' />
              ) : (
                items.map((item) => (
                  <tr key={item.id_horario_alterno}>
                    <td>
                      <div className='text-gray-900 fw-bold'>
                        {item.nombre_horario_tipo || horarioLabel(item.id_horario)}
                      </div>
                      <div className='text-muted fs-8 d-block d-lg-none'>
                        {item.hora_inicio || '-'} - {item.hora_fin || '-'}
                      </div>
                    </td>
                    <td>
                      {formatShortDate(item.fecha_inicio_horario_alterno)} a{' '}
                      {formatShortDate(item.fecha_fin_horario_alterno)}
                    </td>
                    <td>
                      <span className='badge badge-light-primary fw-bold'>
                        {item.hora_inicio_alterno} - {item.hora_fin_alterno}
                      </span>
                    </td>
                    <td>{item.descripcion_horario_alterno || '-'}</td>
                    <td>
                      <EstadoBadge value={item.estado_horario_alterno} />
                    </td>
                    <td className='text-end'>
                      <ActionButtons
                        onEdit={() => abrirEditar(item)}
                        onDelete={() => void inactivar(item)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ListPagination
          total={total}
          page={page}
          totalPages={totalPages}
          limit={limit}
          loading={loading}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value)
            setPage(1)
          }}
        />
      </KTCardBody>

      <HorarioModal
        show={formOpen}
        title={editingId ? 'Editar horario alterno' : 'Nuevo horario alterno'}
        onHide={cerrar}
      >
        <form onSubmit={guardar} noValidate>
          <div className='row g-6'>
            <Field className='col-12' label='Horario base' required error={errors.id_horario}>
              <select
                className={`form-select ${errors.id_horario ? 'is-invalid' : ''}`}
                value={String(form.id_horario)}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    id_horario: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value=''>Seleccione un horario</option>
                {horariosBase.map((horario) => (
                  <option key={horario.id_horario} value={horario.id_horario}>
                    {horarioLabel(horario.id_horario)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              className='col-md-6'
              label='Fecha inicio'
              required
              error={errors.fecha_inicio_horario_alterno}
            >
              <input
                type='date'
                className={`form-control ${
                  errors.fecha_inicio_horario_alterno ? 'is-invalid' : ''
                }`}
                value={form.fecha_inicio_horario_alterno}
                onChange={(e) =>
                  setForm((prev) => ({...prev, fecha_inicio_horario_alterno: e.target.value}))
                }
              />
            </Field>
            <Field
              className='col-md-6'
              label='Fecha fin'
              required
              error={errors.fecha_fin_horario_alterno}
            >
              <input
                type='date'
                className={`form-control ${errors.fecha_fin_horario_alterno ? 'is-invalid' : ''}`}
                value={form.fecha_fin_horario_alterno}
                onChange={(e) =>
                  setForm((prev) => ({...prev, fecha_fin_horario_alterno: e.target.value}))
                }
              />
            </Field>
            <Field
              className='col-md-6'
              label='Hora inicio alterno'
              required
              error={errors.hora_inicio_alterno}
            >
              <input
                type='time'
                className={`form-control ${errors.hora_inicio_alterno ? 'is-invalid' : ''}`}
                value={form.hora_inicio_alterno}
                onChange={(e) =>
                  setForm((prev) => ({...prev, hora_inicio_alterno: e.target.value}))
                }
              />
            </Field>
            <Field
              className='col-md-6'
              label='Hora fin alterno'
              required
              error={errors.hora_fin_alterno}
            >
              <input
                type='time'
                className={`form-control ${errors.hora_fin_alterno ? 'is-invalid' : ''}`}
                value={form.hora_fin_alterno}
                onChange={(e) => setForm((prev) => ({...prev, hora_fin_alterno: e.target.value}))}
              />
            </Field>
            <Field
              className='col-12'
              label='Descripcion'
              error={errors.descripcion_horario_alterno}
            >
              <textarea
                className={`form-control ${errors.descripcion_horario_alterno ? 'is-invalid' : ''}`}
                rows={3}
                value={form.descripcion_horario_alterno || ''}
                onChange={(e) =>
                  setForm((prev) => ({...prev, descripcion_horario_alterno: e.target.value}))
                }
              />
            </Field>
            <div className='col-12'>
              <SwitchField
                checked={Boolean(form.estado_horario_alterno)}
                onChange={(checked) =>
                  setForm((prev) => ({...prev, estado_horario_alterno: checked}))
                }
              />
            </div>
          </div>
          <ModalActions saving={saving} onCancel={cerrar} />
        </form>
      </HorarioModal>
    </KTCard>
  )
}

export default HorarioAlternoPage
