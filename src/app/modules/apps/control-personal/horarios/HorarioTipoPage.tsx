import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react'
import Swal from 'sweetalert2'
import {toast} from 'react-toastify'
import {KTCard, KTCardBody, useDebounce} from '../../../../../_metronic/helpers'
import {
  actualizarHorarioTipo,
  crearHorarioTipo,
  eliminarHorarioTipo,
  listarHorarioTipos,
} from './core/_requests'
import {HorarioTipo, initialHorarioTipo} from './core/_models'
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

const HorarioTipoPage = () => {
  const [items, setItems] = useState<HorarioTipo[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<HorarioTipo>(initialHorarioTipo)
  const [errors, setErrors] = useState<FieldErrors>({})
  const debouncedSearchTerm = useDebounce(search, 500)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [limit, total])

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const response = await listarHorarioTipos(debouncedSearchTerm || '', page, limit)
      setItems(response.data || [])
      setTotal(response.pagination?.total || 0)
    } catch (err: any) {
      toast.error(getBackendMessage(err, 'No se pudieron cargar los tipos de horario.'))
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, limit, page])

  useEffect(() => {
    void cargar()
  }, [cargar])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm])

  const abrirNuevo = () => {
    setEditingId(null)
    setErrors({})
    setForm(initialHorarioTipo)
    setFormOpen(true)
  }

  const abrirEditar = (item: HorarioTipo) => {
    setEditingId(Number(item.id_horario_tipo))
    setErrors({})
    setForm({...initialHorarioTipo, ...item, estado_horario_tipo: isActive(item.estado_horario_tipo)})
    setFormOpen(true)
  }

  const cerrar = () => {
    setFormOpen(false)
    setEditingId(null)
    setErrors({})
    setForm(initialHorarioTipo)
  }

  const validar = () => {
    const next: FieldErrors = {}
    if (!form.nombre_horario_tipo?.trim()) next.nombre_horario_tipo = 'El nombre es obligatorio.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validar()) return

    setSaving(true)
    setErrors({})
    try {
      const payload = {...form, estado_horario_tipo: form.estado_horario_tipo ? 1 : 0}
      if (editingId) {
        await actualizarHorarioTipo(editingId, payload)
        toast.success('Tipo de horario actualizado correctamente.')
      } else {
        await crearHorarioTipo(payload)
        toast.success('Tipo de horario creado correctamente.')
      }
      cerrar()
      await cargar()
    } catch (err: any) {
      setErrors(extractFieldErrors(err))
      toast.error(getBackendMessage(err, 'No se pudo guardar el tipo de horario.'))
    } finally {
      setSaving(false)
    }
  }

  const inactivar = async (item: HorarioTipo) => {
    const result = await Swal.fire({
      title: 'Inactivar tipo de horario',
      text: `Deseas inactivar "${item.nombre_horario_tipo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, inactivar',
      cancelButtonText: 'Cancelar',
      customClass: {confirmButton: 'btn btn-danger', cancelButton: 'btn btn-light'},
      buttonsStyling: false,
    })

    if (!result.isConfirmed || !item.id_horario_tipo) return

    try {
      await eliminarHorarioTipo(item.id_horario_tipo)
      toast.success('Tipo de horario inactivado correctamente.')
      await cargar()
    } catch (err: any) {
      toast.error(getBackendMessage(err, 'No se pudo inactivar el tipo de horario.'))
    }
  }

  return (
    <KTCard>
      <ListHeader
        search={search}
        onSearchChange={setSearch}
        onSearch={() => (page === 1 ? void cargar() : setPage(1))}
        loading={loading}
        buttonLabel='Nuevo tipo'
        buttonTitle='Agregar tipo de horario'
        onCreate={abrirNuevo}
      />
      <KTCardBody className='py-4'>
        <div className='table-responsive'>
          <table className='table align-middle table-row-dashed fs-6 gy-4'>
            <thead>
              <tr className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
                <th className='min-w-220px'>Tipo de horario</th>
                <th className='min-w-280px'>Descripcion</th>
                <th className='min-w-150px'>Funcionarios</th>
                <th className='min-w-120px'>Estado</th>
                <th className='min-w-160px'>Creacion</th>
                <th className='text-end min-w-110px'>Acciones</th>
              </tr>
            </thead>
            <tbody className='text-gray-700 fw-semibold'>
              {loading ? (
                <LoadingRow colSpan={6} text='Cargando tipos de horario...' />
              ) : items.length === 0 ? (
                <EmptyRow colSpan={6} text='No se encontraron tipos de horario.' />
              ) : (
                items.map((item) => (
                  <tr key={item.id_horario_tipo}>
                    <td>
                      <div className='text-gray-900 fw-bold'>{item.nombre_horario_tipo}</div>
                      <div className='text-muted fs-8'>ID: {item.id_horario_tipo}</div>
                    </td>
                    <td>{item.descripcion_horario_tipo || '-'}</td>
                    <td>
                      <span className='badge badge-light-info fw-bold'>
                        {item.total_funcionarios_asignados ?? 0}
                      </span>
                    </td>
                    <td><EstadoBadge value={item.estado_horario_tipo} /></td>
                    <td>{item.fecha_creacion_horario_tipo || '-'}</td>
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

      <HorarioModal show={formOpen} title={editingId ? 'Editar tipo de horario' : 'Nuevo tipo de horario'} onHide={cerrar}>
        <form onSubmit={guardar} noValidate>
          <div className='row g-6'>
            <Field className='col-md-8' label='Nombre' required error={errors.nombre_horario_tipo}>
              <input
                className={`form-control ${errors.nombre_horario_tipo ? 'is-invalid' : ''}`}
                value={form.nombre_horario_tipo}
                onChange={(e) => setForm((prev) => ({...prev, nombre_horario_tipo: e.target.value}))}
                autoFocus
              />
            </Field>
            <div className='col-md-4 d-flex align-items-end'>
              <SwitchField checked={Boolean(form.estado_horario_tipo)} onChange={(checked) => setForm((prev) => ({...prev, estado_horario_tipo: checked}))} />
            </div>
            <Field className='col-12' label='Descripcion' error={errors.descripcion_horario_tipo}>
              <textarea
                className={`form-control ${errors.descripcion_horario_tipo ? 'is-invalid' : ''}`}
                rows={3}
                value={form.descripcion_horario_tipo || ''}
                onChange={(e) => setForm((prev) => ({...prev, descripcion_horario_tipo: e.target.value}))}
              />
            </Field>
          </div>
          <ModalActions saving={saving} onCancel={cerrar} />
        </form>
      </HorarioModal>
    </KTCard>
  )
}

export default HorarioTipoPage
