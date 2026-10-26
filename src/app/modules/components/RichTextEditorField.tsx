import {FC, useEffect, useState} from 'react'
import clsx from 'clsx'

type LoadedEditor = {
  CKEditor: any
  ClassicEditor: any
}

type Props = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  isInvalid?: boolean
  isValid?: boolean
  disabled?: boolean
  placeholder?: string
  toolbar?: string[]
  rows?: number
}

const defaultToolbar = ['undo', 'redo', 'bold', 'numberedList', 'bulletedList']

const RichTextEditorField: FC<Props> = ({
  value,
  onChange,
  onBlur,
  isInvalid = false,
  isValid = false,
  disabled = false,
  placeholder = 'Escriba aquí...',
  toolbar = defaultToolbar,
  rows = 6,
}) => {
  const [editor, setEditor] = useState<LoadedEditor | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let isMounted = true

    import('@ckeditor/ckeditor5-react')
      .then(async (ckeditorModule) => {
        const classicEditorModule = await import('@ckeditor/ckeditor5-build-classic')

        if (!isMounted) {
          return
        }

        setEditor({
          CKEditor: ckeditorModule.CKEditor,
          ClassicEditor: classicEditorModule.default,
        })
      })
      .catch((error) => {
        console.error('No se pudo cargar CKEditor, se usara textarea como respaldo.', error)
        if (isMounted) {
          setLoadFailed(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loadFailed) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={clsx('form-control form-control-solid', {
          'is-invalid': isInvalid,
          'is-valid': isValid,
        })}
      />
    )
  }

  if (!editor) {
    return (
      <div
        className={clsx('form-control form-control-solid d-flex align-items-center text-muted', {
          'is-invalid': isInvalid,
          'is-valid': isValid,
        })}
        style={{minHeight: '180px'}}
      >
        Cargando editor...
      </div>
    )
  }

  const {CKEditor, ClassicEditor} = editor

  return (
    <div
      className={clsx('form-control form-control-solid p-0', {
        'is-invalid': isInvalid,
        'is-valid': isValid,
      })}
    >
      <CKEditor
        editor={ClassicEditor}
        disabled={disabled}
        data={value || ''}
        onChange={(_: unknown, instance: any) => onChange(instance.getData())}
        onBlur={onBlur}
        config={{
          placeholder,
          toolbar,
        }}
      />
    </div>
  )
}

export {RichTextEditorField}
