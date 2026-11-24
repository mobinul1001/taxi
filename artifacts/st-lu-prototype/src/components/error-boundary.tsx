import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

/**
 * The old version of this screen said the rest of the app was still running and offered "Try again",
 * which could not help when the cause was the stored sample data: every retry and every reload hit the
 * same error, with no way out but the browser's own site settings. Clearing the data is that way out.
 */
function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  const startOver = () => {
    try {
      localStorage.removeItem("stlu-store-v3");
      sessionStorage.removeItem("stlu-session");
    } catch { /* storage can be blocked; the reload below still gives a clean try */ }
    location.reload();
  };
  return (
    <div className="app-minvh flex w-full items-center justify-center bg-ground p-6 text-ink">
      <div className="w-full max-w-lg text-center">
        <h1 className="font-display text-[22px] font-bold">Something went wrong</h1>
        <p className="mt-2 text-[14.5px] text-mute">
          This screen hit an error. Resetting the sample data clears it and starts the prototype fresh.
        </p>
        {/* Dev only: messages can carry API responses and other internals. */}
        {import.meta.env.DEV ? (
          <pre className="mt-4 overflow-x-auto rounded-md bg-aground p-3 text-left text-xs">
            {error.message || String(error)}
          </pre>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            data-testid="button-error-reset"
            onClick={startOver}
            className="tap inline-flex min-h-12 items-center rounded-lg bg-green px-5 text-[15px] font-semibold text-white"
          >
            Reset sample data and reload
          </button>
          <button
            type="button"
            data-testid="button-error-retry"
            onClick={resetError}
            className="tap inline-flex min-h-12 items-center rounded-lg border border-line bg-paper px-5 text-[15px] font-semibold"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
