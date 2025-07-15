import chalk from 'chalk';

export default class Logging {
    public static log = (message: any, ...additionalArgs: any[]) => this.info(message, ...additionalArgs);
    
    public static info = (message: any, ...additionalArgs: any[]) => {
        console.log(
            chalk.blue(`[${new Date().toLocaleString()}] [INFO]`), 
            typeof message === 'string' ? chalk.blueBright(message) : message,
            ...additionalArgs
        );
    };
    
    public static debug = (message: any, ...additionalArgs: any[]) => {
        console.log(
            chalk.green(`[${new Date().toLocaleString()}] [DEBUG]`), 
            typeof message === 'string' ? chalk.greenBright(message) : message,
            ...additionalArgs
        );
    };
    
    public static warning = (message: any, ...additionalArgs: any[]) => {
        console.log(
            chalk.yellow(`[${new Date().toLocaleString()}] [WARN]`), 
            typeof message === 'string' ? chalk.yellowBright(message) : message,
            ...additionalArgs
        );
    };
    
    public static error = (message: any, ...additionalArgs: any[]) => {
        console.log(
            chalk.red(`[${new Date().toLocaleString()}] [ERROR]`), 
            typeof message === 'string' ? chalk.redBright(message) : message,
            ...additionalArgs
        );
    };
}