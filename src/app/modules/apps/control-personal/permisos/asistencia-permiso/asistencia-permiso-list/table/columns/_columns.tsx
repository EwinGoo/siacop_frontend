import {Column} from 'react-table'
import {InfoCell} from './InfoCell'
import {ActionsCell} from './ActionsCell'
import {CustomHeader} from './CustomHeader'
import {SelectionCell} from './SelectionCell'
import {SelectionHeader} from './SelectionHeader'
import {AsistenciaPermiso, PermisoPDFData} from '../../core/_models'
import {DateCell} from './DateCell'
import {EstadoBadge} from 'src/app/modules/apps/control-personal/comision/comision-list/table/components/EstadoBadge'

type GetColumnsProps = {
  isAdmin: boolean
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: PermisoPDFData) => void
  onCancelPDF: () => void
}

export const getColumns = ({
  isAdmin,
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
}: GetColumnsProps): ReadonlyArray<Column<AsistenciaPermiso>> => {
  const columns: Column<AsistenciaPermiso>[] = []

  if (isAdmin) {
    columns.push({
      Header: (props) => <SelectionHeader tableProps={props} />,
      id: 'selection',
      Cell: ({...props}) => (
        <SelectionCell id={props.data[props.row.index].id_asistencia_permiso} />
      ),
    })
  }

  columns.push(
    {
      Header: (props) => <CustomHeader tableProps={props} title='N°' className='min-w-10px w-10px' />,
      id: 'numero',
      Cell: ({row}) => <span>{row.index + 1}</span>,
    },
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='Acciones' className='w-actions' />
      ),
      id: 'actions',
      Cell: ({...props}) => (
        <ActionsCell
          id={props.data[props.row.index].id_asistencia_permiso}
          estado={props.data[props.row.index].estado_permiso}
          hash={props.data[props.row.index].hash}
          carnet={props.data[props.row.index].ci}
          onPreparePDF={onPreparePDF}
          onShowPDF={onShowPDF}
          onCancelPDF={onCancelPDF}
        />
      ),
    },
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='Tipo Permiso' className='min-w-100px text-center' />
      ),
      id: 'tipo_permiso_nombre',
      Cell: ({row}) => <InfoCell asistenciaPermiso={row.original} />,
    },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Código' className='min-w-100px' />,
      accessor: 'id_temporal',
    },
    {
      Header: (props) => (
        <CustomHeader tableProps={props} title='Solicitante' className='min-w-100px' />
      ),
      accessor: 'nombre_generador',
    },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Fechas' className='min-w-120px' />,
      id: 'fechas_comision',
      Cell: ({row}) => <DateCell row={row} />,
    },
    // {
    //   Header: (props) => (
    //     <CustomHeader tableProps={props} title='Detalles' className='min-w-250px' />
    //   ),
    //   id: 'detalles',
    //   Cell: ({row}) => <DetallesCell asistenciaComision={row.original} />,
    // },
    {
      Header: (props) => <CustomHeader tableProps={props} title='Estado' className='min-w-100px' />,
      accessor: 'estado_permiso',
      Cell: ({value}) => <EstadoBadge estado={value} />,
    }
  )

  return columns
}
