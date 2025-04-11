import fs from 'fs';
import path from 'path';
import { ContextLogger } from './ContextLogger';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3
}

export class Logger {
  private static instance: Logger;
  private logDir: string;
  private logLevel: LogLevel;
  private logFile: string;
  private consolePrint: boolean;

  private constructor() {
    this.logDir = process.env.LOG_DIR || '/app/logs';
    this.logLevel = LogLevel.INFO;
    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.consolePrint = true;

    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error: any) {
        console.error(`Failed to create log directory: ${error.message}`);
        this.logDir = '/tmp';
        this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
      }
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): Logger {
    this.logLevel = level;
    return this;
  }

  public setConsoleOutput(enable: boolean): Logger {
    this.consolePrint = enable;
    return this;
  }

  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? `[${context}] ` : '';
    return `[${timestamp}] [${level}] ${contextInfo}${message}`;
  }

  private writeLog(level: LogLevel, levelName: string, message: string, context?: string, data?: any): void {
    if (level < this.logLevel) return;

    const formattedMsg = this.formatMessage(levelName, message, context);
    let logEntry = formattedMsg;

    if (data !== undefined) {
      const dataString = typeof data === 'object' ?
        JSON.stringify(data, null, 2) :
        String(data);

      logEntry += `\nData: ${dataString}\n`;
    }

    fs.appendFileSync(this.logFile, logEntry + '\n');

    if (this.consolePrint) {
      const consoleMethod = level >= LogLevel.ERROR ? console.error :
        level === LogLevel.WARNING ? console.warn :
          level === LogLevel.DEBUG ? console.debug :
            console.log;

      consoleMethod(formattedMsg);
      if (data !== undefined) {
        consoleMethod('Data:', data);
      }
    }
  }

  public debug(message: string, context?: string, data?: any): void {
    this.writeLog(LogLevel.DEBUG, 'DEBUG', message, context, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.writeLog(LogLevel.INFO, 'INFO', message, context, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.writeLog(LogLevel.WARNING, 'WARNING', message, context, data);
  }

  public error(message: string, context?: string, data?: any): void {
    this.writeLog(LogLevel.ERROR, 'ERROR', message, context, data);
  }

  public createContextLogger(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }
}