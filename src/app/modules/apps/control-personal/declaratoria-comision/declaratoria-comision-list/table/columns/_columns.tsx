import {Column} from 'react-table'
import {ActionsCell} from './ActionsCell'
import {CustomHeader} from './CustomHeader'
import {DeclaratoriaComision} from '../../core/_models'
import {DateCell} from './DateCell'
import ElaboracionCell from './ElaboracionCell'
import {EstadoBadge} from '../../components/EstadoBadge'

// Interfaces para tipado
interface PDFData {
  base64: string
  filename: string
  declaratoria: any
}

interface ModalHandlers {
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: PDFData) => void
  onCancelPDF: () => void
  onShowData: (declaratoria: any) => void
  onSetLoading: (declaratoriaId: string, isLoading: boolean) => void
  getLoadingState: (declaratoriaId: string) => boolean
}

// Función que retorna las columnas con los handlers necesarios
const getColumns = ({
  onPreparePDF,
  onShowPDF,
  onCancelPDF,
  onShowData,
  onSetLoading,
  getLoadingState,
}: ModalHandlers): ReadonlyArray<Column<DeclaratoriaComision>> => [
  {
    Header: (props) => <CustomHeader tableProps={props} title='N°' className='min-w-10px w-10px' />,
    id: 'rowNumber',
    Cell: ({row}) => <span>{row.index + 1}</span>,
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Acciones' className='w-actions' />,
    id: 'actions',
    Cell: ({row}) => (
      <ActionsCell
        declaratoria={row.original}
        onPreparePDF={onPreparePDF}
        onShowPDF={onShowPDF}
        onCancelPDF={onCancelPDF}
        onShowData={onShowData}
        onSetLoading={onSetLoading}
        isLoading={getLoadingState(row.original.id_declaratoria_comision?.toString() || '')}
      />
    ),
  },
  {
    Header: (props) => (
      <CustomHeader tableProps={props} title='Solicitante' className='min-w-150px' />
    ),
    accessor: 'nombre_generador',
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='N° Corr.' className='w-actions' />,
    accessor: 'nro_correlativo',
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='CI' className='min-w-100px' />,
    accessor: 'ci',
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Periodo' className='min-w-200px' />,
    id: 'periodo',
    Cell: ({row}) => <DateCell declaratoria={row.original} />,
  },
  // {
  //   Header: (props) => <CustomHeader tableProps={props} title='Destino' className='min-w-150px' />,
  //   accessor: 'destino',
  // },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Viático' className='min-w-100px' />,
    accessor: 'tipo_viatico',
    Cell: ({value}) => (
      <span className={`badge badge-light-${value === 'con_viatico' ? 'success' : 'primary'}`}>
        {value === 'con_viatico' ? 'Con viático' : 'Sin viático'}
      </span>
    ),
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='HR N°' className='min-w-80px' />,
    accessor: 'rrhh_hoja_ruta_numero',
  },
  {
    Header: (props) => <CustomHeader tableProps={props} title='Estado' className='min-w-100px' />,
    accessor: 'estado',
    Cell: ({value}) => <EstadoBadge estado={value} />,
  },
  {
    Header: (props) => (
      <CustomHeader tableProps={props} title='Elaboración' className='min-w-180px' />
    ),
    id: 'fecha_elaboracion',
    Cell: ({row}) => <ElaboracionCell declaratoria={row.original} />,
  },
]

// Exportar la función en lugar de las columnas directamente
export {getColumns}
export type {ModalHandlers, PDFData}
