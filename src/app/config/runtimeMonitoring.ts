import {Routes} from 'react-router-dom'

type RuntimeErrorReporter = (error: unknown, componentStack?: string) => void

let instrumentedRoutesRenderer: typeof Routes = Routes
let runtimeErrorReporter: RuntimeErrorReporter | null = null

const setInstrumentedRoutesRenderer = (routesRenderer: typeof Routes) => {
  instrumentedRoutesRenderer = routesRenderer
}

const getInstrumentedRoutesRenderer = () => instrumentedRoutesRenderer

const setRuntimeErrorReporter = (reporter: RuntimeErrorReporter) => {
  runtimeErrorReporter = reporter
}

const captureRuntimeError = (error: unknown, componentStack?: string) => {
  runtimeErrorReporter?.(error, componentStack)
}

export {
  captureRuntimeError,
  getInstrumentedRoutesRenderer,
  setInstrumentedRoutesRenderer,
  setRuntimeErrorReporter,
}
