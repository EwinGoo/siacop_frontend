import {Modal} from 'react-bootstrap'
import {ProcesoPlanilla, ReporteBonoRefrigerioParams} from '../../core/_models'
import {ReportModalFormWrapper} from './ReportModalFormWrapper'

type Props = {
  isOpen: boolean
  onClose: () => void
  proceso: ProcesoPlanilla | null
  searchInicial?: string
  onShowPDF: (params: ReporteBonoRefrigerioParams) => Promise<void> | void
}

const ReportModal = ({isOpen, onClose, proceso, searchInicial, onShowPDF}: Props) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop='static' keyboard={false} contentClassName='bg-white text-gray-900'>
      <Modal.Header closeButton className='py-4 bg-light-primary border-0'>
        <Modal.Title className='fw-bolder text-gray-900'>
          <i className='bi bi-file-earmark-pdf text-danger me-2'></i>
          Reporte de bono refrigerio
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='px-7 py-6'>
        <ReportModalFormWrapper
          proceso={proceso}
          searchInicial={searchInicial}
          onClose={onClose}
          onShowPDF={onShowPDF}
        />
      </Modal.Body>
    </Modal>
  )
}

export {ReportModal}
