import {PlanillaCarreraSedeControl} from './components/PlanillaCarreraSedeControl'
import {PlanillaModulo} from './core/_models'

type Props = {
  modulo: PlanillaModulo
}

const PlanillaControlList = ({modulo}: Props) => {
  return <PlanillaCarreraSedeControl modulo={modulo} />
}

export {PlanillaControlList}
