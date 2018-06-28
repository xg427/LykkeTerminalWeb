import {AppInsights} from 'applicationinsights-js';
import raven from 'raven-js';

class Logger {
  constructor() {
    AppInsights.downloadAndSetup!({
      instrumentationKey: process.env.REACT_APP_INSIGHTS_ID
    });
    raven
      .config(process.env.REACT_APP_SENTRY_DNS || '', this.getRavenConfig())
      .install();

    window.addEventListener('error', this.logException);
  }

  logException(error: any) {
    AppInsights.trackException(error);
    raven.captureException(error);

    return true;
  }

  private getRavenConfig() {
    return {
      environment: process.env.NODE_ENV,
      stacktrace: true,
      autoBreadcrumbs: true
    };
  }
}

export default new Logger();
