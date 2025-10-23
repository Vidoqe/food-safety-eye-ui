import React from "react";

type State = { hasError: boolean; message?: string; stack?: string };

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: String(err?.message || err), stack: err?.stack };
  }
  componentDidCatch(err: any, info: any) {
    console.error("[ErrorBoundary]", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <h2>⚠️ UI crashed</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.message}</pre>
          {this.state.stack && (
            <details>
              <summary>Stack</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.stack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
