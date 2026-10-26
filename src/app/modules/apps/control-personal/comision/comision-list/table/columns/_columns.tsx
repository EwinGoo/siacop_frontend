import {Column} from 'react-table'
import {InfoCell} from './InfoCell'
import {ActionsCell} from './ActionsCell'
import {CustomHeader} from './CustomHeader'
import {SelectionCell} from './SelectionCell'
import {SelectionHeader} from './SelectionHeader'
import {Comision, ComisionPDFData} from '../../core/_models'
import {DateCell} from './DateCell'
import {EstadoBadge} from '../components/EstadoBadge'
import HorarioCell from './HorarioCell'

// type GetColumnsProps = {
//   isAdmin: boolean
// }

interface ComisionTablePermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canCreate: boolean
  canManage: boolean
  hasActionPermissions: boolean // Computed property
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: ComisionPDFData) => void
  onCancelPDF: () => void
}

export const getColumns = (
  permissions: ComisionTablePermissions
): ReadonlyArray<Column<Comision>> => {
  const columns: Column<Comision>[] = []

  // if (isAdmin) {
  if (permissions.canManage) {
    columns.push({
      Header: (props) => <SelectionHeader tableProps={props} />,
      id: 'selection',
      Cell: ({...props}) => <SelectionCell id={props.data[props.row.index].id_comision} />,
    })
  }

  columns.push(
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='N°' className='min-w-10px w-10px' />
      ),
      id: 'numero',
      Cell: ({row}) => <span>{row.index + 1}</span>,
    },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Acciones' className='w-actions' />,
      id: 'actions',
      Cell: ({...props}) => (
        <ActionsCell
          id={props.data[props.row.index].id_comision}
          estado={props.data[props.row.index].estado_boleta_comision}
          hash={props.data[props.row.index].hash}
          carnet={props.data[props.row.index].ci}
          tipo={props.data[props.row.index].tipo_comision}
          onPreparePDF={permissions.onPreparePDF}
          onShowPDF={permissions.onShowPDF}
          onCancelPDF={permissions.onCancelPDF}
        />
      ),
    },
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='Tipo' className='min-w-100px text-center' />
      ),
      id: 'tipo_comision',
      Cell: ({...props}) => <InfoCell comision={props.data[props.row.index]} />,
    },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Código' className='min-w-100px' />,
      accessor: 'id_temporal',
    },
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='Solicitante' className='min-w-150px' />
      ),
      accessor: 'nombre_generador',
    },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Fecha' className='min-w-120px' />,
      accessor: 'fecha_comision',
      Cell: ({row}) => <DateCell comision={row.original} />,
    },
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='Horario' className='min-w-150px' />
      ),
      id: 'horario',
      Cell: ({row}) => (
        <HorarioCell
          horaSalida={row.original.hora_salida}
          horaRetorno={row.original.hora_retorno}
        />
      ),
    },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Estado' className='min-w-100px' />,
      accessor: 'estado_boleta_comision',
      Cell: ({value}) => <EstadoBadge estado={value} />,
    }
  )

  return columns
}
