export class Logger {
  static debug(tag: string, message: string, data?: any) {
    if (data) {
      console.log(`[DEBUG] [${tag}] ${message}`, data);
    } else {
      console.log(`[DEBUG] [${tag}] ${message}`);
    }
  }

  static error(tag: string, message: string, error?: any) {
    if (error) {
      console.error(`[ERROR] [${tag}] ${message}`, error);
    } else {
      console.error(`[ERROR] [${tag}] ${message}`);
    }
  }
}