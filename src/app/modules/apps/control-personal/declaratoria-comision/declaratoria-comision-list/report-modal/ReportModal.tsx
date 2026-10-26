import {Modal} from 'react-bootstrap'
import {DeclaratoriaComisionPDFData} from '../core/_models'
import {ReportModalFormWrapper} from './ReportModalFormWrapper'

type Props = {
  isOpen: boolean
  onClose: () => void
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: DeclaratoriaComisionPDFData) => void
  onCancelPDF: () => void
}

export const ReportModal = ({isOpen, onClose, onPreparePDF, onShowPDF, onCancelPDF}: Props) => {
  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop='static' keyboard={false} contentClassName='bg-white text-gray-900'>
      <Modal.Header closeButton className='py-4 bg-light-primary border-0'>
        <Modal.Title className='fw-bolder text-gray-900'>
          <i className='bi bi-file-earmark-pdf text-danger me-2'></i>
          Reporte de declaratorias en comisión
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='px-7 py-6'>
        <ReportModalFormWrapper
          onClose={onClose}
          onPreparePDF={onPreparePDF}
          onShowPDF={onShowPDF}
          onCancelPDF={onCancelPDF}
        />
      </Modal.Body>
    </Modal>
  )
}
