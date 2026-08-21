const officialHosts = new Set(["promplify.com", "www.promplify.com"]);
const officialSentryDsn = "https://792b1d5e0b71fc2444800289dd48bd9b@o4504698557693952.ingest.us.sentry.io/4509172418084864";

export const resolveSentryDsn = (hostname: string, configuredDsn?: string) => {
  return configuredDsn || (officialHosts.has(hostname) ? officialSentryDsn : undefined);
};
