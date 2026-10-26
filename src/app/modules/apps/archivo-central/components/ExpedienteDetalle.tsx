import {useMemo, useState} from 'react'
import {ExpedienteRegistro} from './ExpedienteRegistro'
import {Link, useLocation, useParams} from 'react-router-dom'
import {Catalogos, ModoArchivo} from '../core/types'
import {KTCard} from '../../../../../_metronic/helpers/components/KTCard'
import {KTCardBody} from '../../../../../_metronic/helpers/components/KTCardBody'
import {PageTitle} from '../../../../../_metronic/layout/core/PageData'
import {ExpedienteEncabezado} from './ExpedienteEncabezado'
import {useAdministrativo, useExpediente} from '../core/useArchivoCentral'
import {Cargando, ErrorConsulta} from './EstadoConsulta'
import {DocumentoLista} from './DocumentoLista'

export const ExpedienteDetalle = ({modo, catalogos}: {modo: ModoArchivo; catalogos: Catalogos}) => {
  const {personaId} = useParams()
  const id = Number(personaId)
  if (!/^[0-9]+$/.test(personaId ?? '') || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) {
    return (
      <div role='alert' className='alert alert-warning'>
        Identificador de administrativo inválido. <Link to='..'>Volver al buscador</Link>
      </div>
    )
  }
  return <Detalle key={id} id={id} modo={modo} catalogos={catalogos} />
}

const Detalle = ({id, modo, catalogos}: {id: number; modo: ModoArchivo; catalogos: Catalogos}) => {
  const [registro, setRegistro] = useState(false)
  const [exito, setExito] = useState('')
  const persona = useAdministrativo(id)
  const expediente = useExpediente(id, persona.data?.tiene_expediente === true)
  const location = useLocation()
  const raiz = modo === 'auditoria' ? '/apps/auditoria' : '/apps/archivo-central'
  const state = location.state as {volver?: unknown} | null
  const volver =
    typeof state?.volver === 'string' &&
    (state.volver === raiz || state.volver.startsWith(`${raiz}?`))
      ? state.volver
      : raiz
  const breadcrumbs = useMemo(
    () => [
      {
        title: modo === 'auditoria' ? 'Auditoría Interna' : 'Archivo Central',
        path: volver,
        isActive: false,
      },
      {title: 'Expediente', path: '', isActive: true},
    ],
    [modo, volver]
  )
  if (persona.isLoading) return <Cargando />
  if (persona.isError)
    return (
      <ErrorConsulta
        error={persona.error}
        reintentar={() => {
          void persona.refetch()
        }}
      />
    )
  if (!persona.data) return null
  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs} description='Consulta del expediente digital'>
        Expediente
      </PageTitle>
      {exito && (
        <div className='alert alert-success' role='status'>
          {exito}
        </div>
      )}
      {registro && (
        <ExpedienteRegistro
          persona={persona.data}
          cerrar={() => setRegistro(false)}
          registrado={() => {
            setRegistro(false)
            setExito('Expediente registrado correctamente.')
          }}
        />
      )}
      <ExpedienteEncabezado
        persona={persona.data}
        cantidad={expediente.data?.cantidad_documentos ?? persona.data.cantidad_documentos}
      />
      {!persona.data.tiene_expediente ? (
        <KTCard>
          <KTCardBody>
            <h3>Sin expediente registrado</h3>
            <p>
              El administrativo está registrado, pero todavía no tiene expediente en Archivo
              Central.
            </p>
            {modo === 'gestion' && (
              <button
                className='btn btn-sm btn-light-primary'
                disabled={!catalogos.acceso.escrituras_habilitadas}
                onClick={() => setRegistro(true)}
              >
                Crear expediente
              </button>
            )}
          </KTCardBody>
        </KTCard>
      ) : expediente.isLoading ? (
        <Cargando />
      ) : expediente.isError ? (
        <ErrorConsulta
          error={expediente.error}
          reintentar={() => {
            void expediente.refetch()
          }}
        />
      ) : (
        <KTCard>
          <KTCardBody>
            <DocumentoLista personaId={id} catalogos={catalogos} modo={modo} />
          </KTCardBody>
        </KTCard>
      )}
    </>
  )
}
