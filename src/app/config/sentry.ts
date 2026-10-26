import * as React from 'react'
import * as Sentry from '@sentry/react'
import {Routes} from 'react-router-dom'
import {createRoutesFromChildren, matchRoutes, useLocation, useNavigationType} from 'react-router-dom'
import {setInstrumentedRoutesRenderer, setRuntimeErrorReporter} from './runtimeMonitoring'

type NavigatorWithDiagnostics = Navigator & {
  deviceMemory?: number
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }
}

const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN?.trim()
const SENTRY_ENVIRONMENT = process.env.REACT_APP_SENTRY_ENVIRONMENT?.trim() || process.env.NODE_ENV
const SENTRY_RELEASE = process.env.REACT_APP_SENTRY_RELEASE?.trim() || process.env.REACT_APP_VERSION
const tracesSampleRate = Number(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE ?? '0')
const replaysSessionSampleRate = Number(
  process.env.REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? '0'
)
const replaysOnErrorSampleRate = Number(
  process.env.REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? '1'
)

export const isSentryEnabled = Boolean(SENTRY_DSN)

const isFiniteRate = (value: number) => Number.isFinite(value) && value >= 0 && value <= 1

const getDeviceDiagnostics = () => {
  if (typeof navigator === 'undefined') {
    return null
  }

  const safeNavigator = navigator as NavigatorWithDiagnostics

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemoryGb: safeNavigator.deviceMemory,
    connection: safeNavigator.connection
      ? {
          effectiveType: safeNavigator.connection.effectiveType,
          downlinkMbps: safeNavigator.connection.downlink,
          rttMs: safeNavigator.connection.rtt,
          saveData: safeNavigator.connection.saveData,
        }
      : null,
    viewport:
      typeof window === 'undefined'
        ? null
        : {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: window.devicePixelRatio,
          },
  }
}

const getBrowserIntegrations = () => {
  const integrations: any[] = []

  if (isFiniteRate(tracesSampleRate) && tracesSampleRate > 0) {
    integrations.push(
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      })
    )
  }

  if (
    isFiniteRate(replaysSessionSampleRate) &&
    isFiniteRate(replaysOnErrorSampleRate) &&
    (replaysSessionSampleRate > 0 || replaysOnErrorSampleRate > 0)
  ) {
    integrations.push(Sentry.replayIntegration())
  }

  return integrations
}

export const initializeSentry = async () => {
  if (!isSentryEnabled) {
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    integrations: getBrowserIntegrations(),
    tracesSampleRate: isFiniteRate(tracesSampleRate) ? tracesSampleRate : 0,
    replaysSessionSampleRate: isFiniteRate(replaysSessionSampleRate)
      ? replaysSessionSampleRate
      : 0,
    replaysOnErrorSampleRate: isFiniteRate(replaysOnErrorSampleRate)
      ? replaysOnErrorSampleRate
      : 1,
    beforeSend(event, hint) {
      const originalError = hint.originalException

      if (
        originalError instanceof Error &&
        /loading chunk|failed to fetch dynamically imported module/i.test(originalError.message)
      ) {
        event.tags = {
          ...event.tags,
          lazy_chunk_error: 'true',
        }
      }

      return event
    },
    initialScope(scope) {
      const diagnostics = getDeviceDiagnostics()

      if (diagnostics) {
        scope.setContext('device_diagnostics', diagnostics)
      }

      scope.setTag('app_runtime', 'react-spa')
      scope.setTag('build_tool', 'create-react-app')
      scope.setTag('resource_profile', (() => {
        const memory = diagnostics?.deviceMemoryGb ?? 0
        const cores = diagnostics?.hardwareConcurrency ?? 0

        if (memory > 0 && memory <= 4) {
          return 'low-memory'
        }

        if (cores > 0 && cores <= 2) {
          return 'low-cpu'
        }

        return 'standard'
      })())

      return scope
    },
  })

  setRuntimeErrorReporter((error, componentStack) => {
    Sentry.withScope((scope) => {
      if (componentStack) {
        scope.setContext('react_error_boundary', {
          componentStack,
        })
      }

      Sentry.captureException(error)
    })
  })

  setInstrumentedRoutesRenderer(Sentry.withSentryReactRouterV6Routing(Routes))
}
