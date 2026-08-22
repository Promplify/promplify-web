import { Component, type ErrorInfo, type ReactNode } from "react";
import { clearChunkRecovery, isChunkLoadError, recoverChunkLoad } from "../lib/chunkLoadRecovery";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ChunkLoadErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    if (!isChunkLoadError(error)) {
      throw error;
    }

    recoverChunkLoad(error, window.location.href, window.sessionStorage, () => window.location.reload());
  }

  private retry = (): void => {
    clearChunkRecovery(window.sessionStorage);
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <section className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">We couldn&apos;t load this page</h1>
          <p className="mt-3 text-sm text-zinc-400">Check your connection, then try again.</p>
          <button type="button" className="mt-6 rounded-md bg-white px-5 py-2 text-sm font-medium text-black" onClick={this.retry}>
            Try again
          </button>
        </section>
      </main>
    );
  }
}
