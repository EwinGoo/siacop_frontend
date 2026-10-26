import {Modal} from 'react-bootstrap'
import {ProcesoPlanilla, ReporteResultadosDiariosParams} from '../../core/_models'
import {ReportModalFormWrapper} from './ReportModalFormWrapper'

type Props = {
  isOpen: boolean
  onClose: () => void
  proceso: ProcesoPlanilla | null
  searchInicial?: string
  estadoDiaInicial?: string
  onShowPDF: (params: ReporteResultadosDiariosParams) => Promise<void> | void
}

const ReportModal = ({
  isOpen,
  onClose,
  proceso,
  searchInicial,
  estadoDiaInicial,
  onShowPDF,
}: Props) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      backdrop='static'
      keyboard={false}
      contentClassName='bg-white text-gray-900'
    >
      <Modal.Header closeButton className='py-4 bg-light-primary border-0'>
        <Modal.Title className='fw-bolder text-gray-900'>
          <i className='bi bi-file-earmark-pdf text-danger me-2'></i>
          Reporte de resultados diarios
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='px-7 py-6'>
        <ReportModalFormWrapper
          proceso={proceso}
          searchInicial={searchInicial}
          estadoDiaInicial={estadoDiaInicial}
          onClose={onClose}
          onShowPDF={onShowPDF}
        />
      </Modal.Body>
    </Modal>
  )
}

export {ReportModal}
