import {ReportModalHeader} from './ReportModalHeader'
import {ReportModalFormWrapper} from './ReportModalFormWrapper'
import Modal from 'react-bootstrap/Modal'
import {useListView} from '../core/ListViewProvider'
import {ComisionPDFData} from '../core/_models'

type Props = {
  onPreparePDF: (title?: string) => void
  onShowPDF: (pdfData: ComisionPDFData) => void
  onCancelPDF: () => void
}

const ReportModal = ({onPreparePDF, onShowPDF, onCancelPDF}: Props) => {
  const {accion, setItemIdForUpdate, setIsShow, isShow} = useListView()

  // Resetear estado cuando se cierra el modal
  const handleClose = () => {
    setIsShow(false)
    setItemIdForUpdate(undefined)
  }

  if (isShow && accion === 'report') {
    return (
      <Modal
        show={isShow}
        onHide={handleClose}
        centered
        size='lg'
        backdrop='static'
        keyboard={false}
      >
        <Modal.Header>
          <ReportModalHeader onClose={handleClose} />
        </Modal.Header>

        <Modal.Body>
          <ReportModalFormWrapper
            onClose={handleClose}
            onPreparePDF={onPreparePDF}
            onShowPDF={onShowPDF}
            onCancelPDF={onCancelPDF}
          />
        </Modal.Body>
      </Modal>
    )
  }
  return null // o simplemente return
}

export {ReportModal}
