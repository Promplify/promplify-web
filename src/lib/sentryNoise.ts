type SentryStackFrame = {
  filename?: string;
  module?: string;
  function?: string;
  in_app?: boolean;
};

type SentryExceptionValue = {
  type?: string;
  value?: string;
  stacktrace?: {
    frames?: SentryStackFrame[];
  };
};

type SentryEventLike = {
  exception?: {
    values?: SentryExceptionValue[];
  };
};

type SentryHintLike = {
  originalException?: unknown;
};

function isNotFoundDomException(value: unknown): boolean {
  return typeof DOMException !== "undefined" && value instanceof DOMException && value.name === "NotFoundError";
}

function isReactDomFrame(frame: SentryStackFrame): boolean {
  const source = `${frame.filename || ""} ${frame.module || ""} ${frame.function || ""}`.toLowerCase();
  return source.includes("react-dom");
}

function isExplicitSourceFrame(frame: SentryStackFrame): boolean {
  const filename = (frame.filename || "").toLowerCase();
  const mod = (frame.module || "").toLowerCase();
  return filename.includes("src/") || mod.startsWith("src.") || /\.(?:tsx?|jsx)$/.test(filename);
}

function isMinifiedAssetFrame(frame: SentryStackFrame): boolean {
  const filename = (frame.filename || "").toLowerCase();
  return /(?:^|\/)assets\/[^/]+\.m?js(?:\?.*)?$/.test(filename);
}

export function shouldDropReactRemoveChildNoise(event: SentryEventLike, hint?: SentryHintLike): boolean {
  const exception = event.exception?.values?.[0];
  const message = exception?.value || "";
  const frames = exception?.stacktrace?.frames || [];
  const isRemoveChildNotFound = exception?.type === "NotFoundError" && message.includes("removeChild") && message.includes("not a child of this node");

  if (!isRemoveChildNotFound && !isNotFoundDomException(hint?.originalException)) {
    return false;
  }

  if (frames.some(isExplicitSourceFrame)) {
    return false;
  }

  if (frames.some(isReactDomFrame)) {
    return !frames.some((frame) => frame.in_app === true);
  }

  return frames.length > 0 && frames.every(isMinifiedAssetFrame);
}
