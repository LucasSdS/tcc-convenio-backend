import { Logger } from "./Logger";

export class ContextLogger {
  private logger: Logger;
  private context: string;

  constructor(logger: Logger, context: string) {
    this.logger = logger;
    this.context = context;
  }

  public debug(message: string, data?: any): void {
    this.logger.debug(message, this.context, data);
  }

  public info(message: string, data?: any): void {
    this.logger.info(message, this.context, data);
  }

  public warn(message: string, data?: any): void {
    this.logger.warn(message, this.context, data);
  }

  public error(message: string, data?: any): void {
    this.logger.error(message, this.context, data);
  }
}

export const logger = Logger.getInstance();