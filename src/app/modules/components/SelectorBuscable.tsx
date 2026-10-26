import Select, {createFilter} from 'react-select'
import styles from './SelectorBuscable.module.scss'

export interface OpcionBuscable {
  value: number | undefined
  label: string
}

const filtrar = createFilter<OpcionBuscable>({
  ignoreCase: true,
  ignoreAccents: true,
  matchFrom: 'any',
})

export const SelectorBuscable = ({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  invalid = false,
  describedBy,
  menuPortalTarget,
}: {
  id: string
  options: readonly OpcionBuscable[]
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  menuPortalTarget?: HTMLElement | null
}) => (
  <Select<OpcionBuscable, false>
    isDisabled={disabled}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    inputId={id}
    instanceId={id}
    className={styles.selector}
    classNamePrefix='siacop-combo'
    classNames={{menuPortal: () => styles.selector}}
    unstyled
    options={options}
    value={options.find((option) => option.value === value) ?? null}
    onChange={(option) => onChange(option?.value)}
    getOptionValue={(option) => (option.value === undefined ? 'todas' : String(option.value))}
    filterOption={filtrar}
    placeholder={placeholder}
    isSearchable
    isClearable={value !== undefined}
    closeMenuOnSelect
    menuPortalTarget={
      menuPortalTarget ?? (typeof document === 'undefined' ? undefined : document.body)
    }
    menuPosition='fixed'
    styles={{menuPortal: (base) => ({...base, zIndex: 1055})}}
    maxMenuHeight={260}
    noOptionsMessage={() => 'No hay coincidencias'}
    ariaLiveMessages={{
      guidance: () =>
        'Escribe para buscar. Usa las flechas para navegar, Enter para seleccionar, Escape para cerrar y Retroceso para limpiar.',
      onFilter: ({resultsMessage}) => resultsMessage,
      onFocus: ({focused}) => focused.label,
      onChange: ({action, label}) =>
        action === 'clear' ? placeholder : `${label ?? placeholder} seleccionado`,
    }}
    screenReaderStatus={({count}) => `${count} opciones disponibles`}
  />
)
