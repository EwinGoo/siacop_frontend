import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react'
import Swal from 'sweetalert2'
import {toast} from 'react-toastify'
import {KTCard, KTCardBody, useDebounce} from '../../../../../_metronic/helpers'
import {
  actualizarHorario,
  crearHorario,
  eliminarHorario,
  listarHorarioTiposDropdown,
  listarHorarios,
} from './core/_requests'
import {Horario, HorarioTipo, initialHorario} from './core/_models'
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

const HorarioPage = () => {
  const [items, setItems] = useState<Horario[]>([])
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
  const [form, setForm] = useState<Horario>(initialHorario)
  const [errors, setErrors] = useState<FieldErrors>({})
  const debouncedSearchTerm = useDebounce(search, 500)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [limit, total])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listarHorarios({
        search: debouncedSearchTerm || undefined,
        id_horario_tipo: idHorarioTipo || undefined,
        estado: estado || undefined,
        page,
        limit,
      })
      setItems(response.data || [])
      setTotal(response.pagination?.total || 0)
    } catch (err: any) {
      toast.error(getBackendMessage(err, 'No se pudieron cargar los horarios.'))
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
        setTipos(await listarHorarioTiposDropdown())
      } catch (err: any) {
        toast.error(getBackendMessage(err, 'No se pudieron cargar los tipos de horario.'))
      }
    }
    void init()
  }, [])

  const abrirNuevo = () => {
    setEditingId(null)
    setErrors({})
    setForm(initialHorario)
    setFormOpen(true)
  }

  const abrirEditar = (item: Horario) => {
    setEditingId(Number(item.id_horario))
    setErrors({})
    setForm({...initialHorario, ...item, estado_horario: isActive(item.estado_horario)})
    setFormOpen(true)
  }

  const cerrar = () => {
    setFormOpen(false)
    setEditingId(null)
    setErrors({})
    setForm(initialHorario)
  }

  const validar = () => {
    const next: FieldErrors = {}
    if (!form.id_horario_tipo) next.id_horario_tipo = 'Seleccione el tipo de horario.'
    if (!form.hora_inicio) next.hora_inicio = 'La hora inicio es obligatoria.'
    if (!form.hora_fin) next.hora_fin = 'La hora fin es obligatoria.'
    if (form.hora_inicio && form.hora_fin && form.hora_inicio >= form.hora_fin) {
      next.hora_fin = 'La hora fin debe ser mayor a la hora inicio.'
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
        id_horario_tipo: Number(form.id_horario_tipo),
        estado_horario: form.estado_horario ? 1 : 0,
      }
      if (editingId) {
        await actualizarHorario(editingId, payload)
        toast.success('Horario actualizado correctamente.')
      } else {
        await crearHorario(payload)
        toast.success('Horario creado correctamente.')
      }
      cerrar()
      await cargar()
    } catch (err: any) {
      setErrors(extractFieldErrors(err))
      toast.error(getBackendMessage(err, 'No se pudo guardar el horario.'))
    } finally {
      setSaving(false)
    }
  }

  const inactivar = async (item: Horario) => {
    const result = await Swal.fire({
      title: 'Inactivar horario',
      text: `Deseas inactivar el horario ${item.hora_inicio} - ${item.hora_fin}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, inactivar',
      cancelButtonText: 'Cancelar',
      customClass: {confirmButton: 'btn btn-danger', cancelButton: 'btn btn-light'},
      buttonsStyling: false,
    })

    if (!result.isConfirmed || !item.id_horario) return

    try {
      await eliminarHorario(item.id_horario)
      toast.success('Horario inactivado correctamente.')
      await cargar()
    } catch (err: any) {
      toast.error(getBackendMessage(err, 'No se pudo inactivar el horario.'))
    }
  }

  return (
    <KTCard>
      <ListHeader
        search={search}
        onSearchChange={setSearch}
        onSearch={() => (page === 1 ? void cargar() : setPage(1))}
        loading={loading}
        buttonLabel='Nuevo horario'
        buttonTitle='Agregar horario'
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
                <th className='min-w-220px'>Tipo de horario</th>
                <th className='min-w-170px'>Hora inicio</th>
                <th className='min-w-170px'>Hora fin</th>
                <th className='min-w-260px'>Descripcion</th>
                <th className='min-w-120px'>Estado</th>
                <th className='text-end min-w-110px'>Acciones</th>
              </tr>
            </thead>
            <tbody className='text-gray-700 fw-semibold'>
              {loading ? (
                <LoadingRow colSpan={6} text='Cargando horarios...' />
              ) : items.length === 0 ? (
                <EmptyRow colSpan={6} text='No se encontraron horarios.' />
              ) : (
                items.map((item) => (
                  <tr key={item.id_horario}>
                    <td>
                      <div className='text-gray-900 fw-bold'>{item.nombre_horario_tipo || '-'}</div>
                      <div className='text-muted fs-8'>ID: {item.id_horario}</div>
                    </td>
                    <td><span className='badge badge-light-primary fw-bold'>{item.hora_inicio}</span></td>
                    <td><span className='badge badge-light-info fw-bold'>{item.hora_fin}</span></td>
                    <td>{item.descripcion_horario || '-'}</td>
                    <td><EstadoBadge value={item.estado_horario} /></td>
                    <td className='text-end'>
                      <ActionButtons onEdit={() => abrirEditar(item)} onDelete={() => void inactivar(item)} />
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

      <HorarioModal show={formOpen} title={editingId ? 'Editar horario' : 'Nuevo horario'} onHide={cerrar}>
        <form onSubmit={guardar} noValidate>
          <div className='row g-6'>
            <Field className='col-12' label='Tipo de horario' required error={errors.id_horario_tipo}>
              <select
                className={`form-select ${errors.id_horario_tipo ? 'is-invalid' : ''}`}
                value={String(form.id_horario_tipo)}
                onChange={(e) => setForm((prev) => ({...prev, id_horario_tipo: e.target.value === '' ? '' : Number(e.target.value)}))}
              >
                <option value=''>Seleccione un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id_horario_tipo} value={tipo.id_horario_tipo}>
                    {tipo.nombre_horario_tipo}
                  </option>
                ))}
              </select>
            </Field>
            <Field className='col-md-6' label='Hora inicio' required error={errors.hora_inicio}>
              <input
                type='time'
                className={`form-control ${errors.hora_inicio ? 'is-invalid' : ''}`}
                value={form.hora_inicio}
                onChange={(e) => setForm((prev) => ({...prev, hora_inicio: e.target.value}))}
              />
            </Field>
            <Field className='col-md-6' label='Hora fin' required error={errors.hora_fin}>
              <input
                type='time'
                className={`form-control ${errors.hora_fin ? 'is-invalid' : ''}`}
                value={form.hora_fin}
                onChange={(e) => setForm((prev) => ({...prev, hora_fin: e.target.value}))}
              />
            </Field>
            <Field className='col-12' label='Descripcion' error={errors.descripcion_horario}>
              <textarea
                className={`form-control ${errors.descripcion_horario ? 'is-invalid' : ''}`}
                rows={3}
                value={form.descripcion_horario || ''}
                onChange={(e) => setForm((prev) => ({...prev, descripcion_horario: e.target.value}))}
              />
            </Field>
            <div className='col-12'>
              <SwitchField checked={Boolean(form.estado_horario)} onChange={(checked) => setForm((prev) => ({...prev, estado_horario: checked}))} />
            </div>
          </div>
          <ModalActions saving={saving} onCancel={cerrar} />
        </form>
      </HorarioModal>
    </KTCard>
  )
}

export default HorarioPage
