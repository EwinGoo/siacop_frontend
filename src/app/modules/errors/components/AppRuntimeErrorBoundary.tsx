import {Component, ErrorInfo, ReactNode} from 'react'
import {captureRuntimeError} from '../../../config/runtimeMonitoring'
import {AppRuntimeErrorFallback} from './AppRuntimeErrorFallback'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

class AppRuntimeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError() {
    return {hasError: true}
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureRuntimeError(error, errorInfo.componentStack)
  }

  private handleReset = () => {
    this.setState({hasError: false})
  }

  public render() {
    if (this.state.hasError) {
      return <AppRuntimeErrorFallback resetError={this.handleReset} />
    }

    return this.props.children
  }
}

export {AppRuntimeErrorBoundary}
