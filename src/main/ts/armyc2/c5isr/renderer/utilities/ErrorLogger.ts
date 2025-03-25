import { LogLevel } from "./LogLevel";


/**
 * Error Logging class for Renderer
 *
 */
export class ErrorLogger {
    // private static ErrorLogger _el;
    public static readonly LoggerName: string = "ErrorLogger";
    //private static Logger _Logger = null;//
    //private static final Logger _Logger = Logger.getLogger(LoggerName);
    private static _level: LogLevel = LogLevel.INFO;
    //private static java.util.logging.FileHandler fh;
    private static _LoggingEnabled: boolean = false;
    //private static String _LoggingPath = System.getProperty("user.dir");
    //date format: Nov 19, 2012 11:41:40 AM
    private static dateFormatOptions: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" }
    /*
    private ErrorLogger()
    {
        Init();
    }


    private static synchronized ErrorLogger getInstance()
    {

        //if(_Logger == null)
        if(_el == null)
        {
            try
            {
                _el = new ErrorLogger();

            }
            catch(Exception exc)
            {
                System.err.println(exc.message);
                //JOptionPane.showMessageDialog(null, ioe.message, "Message", JOptionPane.PLAIN_MESSAGE);
            }
        }

        return _el;
    }

    private void Init()
    {
        try
        {
            if(_Logger != null)
                _Logger.setLevel(Level.INFO);
        }
        catch(Exception exc)
        {
            System.err.println(exc.message);
            //JOptionPane.showMessageDialog(null, ioe.message, "Message", JOptionPane.PLAIN_MESSAGE);
        }
    }//*/

    /**
     * True if logging is enabled
     * @return {@link Boolean}
     */
    public static getLoggingStatus(): boolean {
        return ErrorLogger._LoggingEnabled;
    }

    /**
     * Takes a throwable and puts it's stacktrace into a string.
     * @param error {@link Error}
     * @return {@link String}
     */
    public static getStackTrace(error: Error): string {
        try {
            return error.stack;
        } catch (exc) {
            if (exc instanceof Error) {
                ErrorLogger.LogException("ErrorLogger", "getStackTrace", exc);
                return "Error - couldn't retrieve stack trace";
            } else {
                throw exc;
            }
        }
    }

    /**
     * TRUE: Creates a file handler that will log message to a file.
     * FALSE: logging just goes to console.
     * @param enable {@link Boolean}
     */
    public static EnableLogging(enable: boolean): void {/*
        //_LoggingEnabled = enable;
        if(enable && _LoggingEnabled == false)
        {
            if(fh == null)
            {
                try
                {
                    fh = new java.util.logging.FileHandler(getFileName(),true);
                    fh.setFormatter(new SimpleFormatter());//comment out and will default to XML
                }
                catch(IOException ioe)
                {
                    //JOptionPane.showMessageDialog(null, ioe.message, "Message", JOptionPane.PLAIN_MESSAGE);
                }

            }
            getInstance();
            fh.setLevel(_Logger.getLevel());
            _Logger.addHandler(fh);
        }
        else
        {
            if(_LoggingEnabled && fh != null)
            {
                _Logger.removeHandler(fh);
                fh=null;
            }
        }//*/
        ErrorLogger._LoggingEnabled = enable;
    }

    /**
     * Folder location to store the log file.
     * Defaults to "System.getProperty("user.dir")"
     * @param path {@link String}
     * @deprecated
     */
    public static setLoggingPath(path: string): void {/*
        _LoggingPath = path;
        File foo = new File(path);
        if(foo.exists() && foo.isDirectory())
        {
            if(_LoggingEnabled)
            {   //toggle logging to reset the file path.
                EnableLogging(false);
                EnableLogging(true);
            }
        }
        else
        {
            ErrorLogger.LogMessage("ErrorLogger","setLoggingPath",
                    "\"" + path + "\" doesn't exist, logging path not changed.",
                    Level.WARNING);
        }//*/
    }

    /**
     * clears log files that are beyond a passed number of days old
     * @param DaysOld {@link Integer}
     * @deprecated
     */
    public static CleanupOldFiles(DaysOld: number): void {/*

        Calendar Cal = new GregorianCalendar();
        Calendar CalLastModified = new GregorianCalendar();
        Cal.add(Calendar.DAY_OF_MONTH, -DaysOld);//remove anything this many days old

        String path = _LoggingPath;//System.getProperty("user.dir");
        File lookup = new File(path);
        File[] results = lookup.listFiles();
        for(File foo : results)
        {
            if(foo.getName().startsWith("TBCRendererLog"))
            {
                long age = foo.lastModified();

                CalLastModified.setTimeInMillis(age);
                if(Cal.after(CalLastModified))
                    foo.delete();
            }
        }//*/
    }

    /**
     * Set minimum level at which an item can be logged.
     * In descending order:
     * Severe
     * Warning
     * Info
     * Config
     * Fine
     * Finer
     * Finest
     * @param newLevel {@link Level}
     */
    public static setLevel(newLevel: LogLevel): void;

    /**
     * Set minimum level at which an item can be logged.
     * In descending order:
     * Severe
     * Warning
     * Info
     * Config
     * Fine
     * Finer
     * Finest
     * @param newLevel {@link Level}
     * @param setConsoleHandler logger could be set to FINE but the console
     * handler could be set to INFO.  In that case, anything logged at FINE
     * wouldn't show because it'd get blocked by the console handler.  Set to
     * "true" to make sure the console handler will let you log at the level
     * you want.  If you're only concerned with the log file, you can leave
     * "false"
     */
    public static setLevel(newLevel: LogLevel, setConsoleHandler: boolean): void;
    public static setLevel(...args: unknown[]): void {
        switch (args.length) {
            case 1: {
                const [newLevel] = args as [LogLevel];


                ErrorLogger.setLevel(newLevel, false);


                break;
            }

            case 2: {
                const [newLevel, setConsoleHandler] = args as [LogLevel, boolean];


                ErrorLogger._level = newLevel;

                /*
                _Logger.setLevel(newLevel);//set logger.
        
                if(fh != null)//handler that logs to file
                    fh.setLevel(newLevel);
        
                //have to set top logger/consle handler or messages will still
                //get blocked.
        
                //get the top logger
                if(setConsoleHandler)
                {
                    Logger topLogger = java.util.logging.Logger.getLogger("");
                    //Handler for console (resuse if it already exists)
                    Handler consoleHandler = null;
                    //see if there already is a console handler
                    for (Handler handler : topLogger.getHandlers())
                    {
                        if(handler instanceof ConsoleHandler)
                        {
                            //found the console handler
                            consoleHandler = handler;
                            break;
                        }
                    }
        
                    if(consoleHandler == null)
                    {
                        //there was no console handler found, create a new one
                        consoleHandler = new ConsoleHandler();
                        topLogger.addHandler(consoleHandler);
                    }
                    //set console handler to new level
                    consoleHandler.setLevel(newLevel);
                }//*/


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    /**
     * Specify whether or not this logger should send its output
     * to it's parent Logger.  This means that any LogRecords will
     * also be written to the parent's Handlers, and potentially
     * to its parent, recursively up the namespace.
     * Defaults to true;
     *
     * @param useParentHandlers   true if output is to be sent to the
     *		logger's parent.
     */
    public static setUseParentHandlers(useParentHandlers: boolean): void {
        //_Logger.setUseParentHandlers(useParentHandlers);
    }

    /**
     * Gets the java.util.logging.Level that the logger is set to.
     * @return {@link Level}
     */
    public static getLevel(): LogLevel {
        return ErrorLogger._level;
        //return _Logger.getLevel();
    }

    /**
     *
     * @return {@link String}
     * @deprecated
     */
    private static getFileName(): string {
        //String path = _LoggingPath;//System.getProperty("user.dir");
        let fileName: string = "";
        /*
        SimpleDateFormat dateFormat = new SimpleDateFormat("_MMMdd");
        fileName = "TBCRendererLog" + dateFormat.format(new Date()) + ".txt";
        fileName = path + "\\" + fileName;
        //fileName = path.substring(0, 2) + "\\" + fileName;//*/
        return fileName;
    }

    /**
     * Log a method entry.
     * <p>
     * This is a convenience method that can be used to log entry
     * to a method.  A LogRecord with message "ENTRY", log level
     * FINER, and the given sourceMethod and sourceClass is logged.
     * <p>
     * @param   sourceClass    name of class that issued the logging request
     * @param   sourceMethod   name of method that is being entered
     */
    public static Entering(sourceClass: string, sourceMethod: string): void;

    /**
     * Log a method entry, with one parameter.
     * <p>
     * This is a convenience method that can be used to log entry
     * to a method.  A LogRecord with message "ENTRY {0}", log level
     * FINER, and the given sourceMethod, sourceClass, and parameter
     * is logged.
     * <p>
     * @param   sourceClass    name of class that issued the logging request
     * @param   sourceMethod   name of method that is being entered
     * @param   param1	       parameter to the method being entered
     */
    public static Entering(sourceClass: string, sourceMethod: string, param1: any): void;

    /**
     * Log a method entry, with an array of parameters.
     * <p>
     * This is a convenience method that can be used to log entry
     * to a method.  A LogRecord with message "ENTRY" (followed by a
     * format {N} indicator for each entry in the parameter array),
     * log level FINER, and the given sourceMethod, sourceClass, and
     * parameters is logged.
     * <p>
     * @param   sourceClass    name of class that issued the logging request
     * @param   sourceMethod   name of method that is being entered
     * @param   params	       array of parameters to the method being entered
     */
    public static Entering(sourceClass: string, sourceMethod: string, params: any[]): void;
    public static Entering(...args: unknown[]): void 
    {
        if(console)
        {
            switch (args.length) {
                case 2: {
                    const [sourceClass, sourceMethod] = args as [string, string];


                    //_Logger.entering(sourceClass, sourceMethod);
                    if (ErrorLogger._level.intValue() <= LogLevel.FINER.intValue()) {
                        console.log("Entering: " + sourceClass + "." + sourceMethod);
                    }


                    break;
                }

                case 3: {
                    if (args[2] instanceof Array) {
                        const [sourceClass, sourceMethod, params] = args as [string, string, any[]];

                        //_Logger.entering(sourceClass, sourceMethod,params);
                        if (ErrorLogger._level.intValue() <= LogLevel.FINER.intValue()) {
                            console.log("Entering: " + sourceClass + "." + sourceMethod + "with params:");
                            if (params != null) {
                                for (let param of params) {
                                    console.log(param.toString());
                                }
                            }
                        }
                    } else {
                        const [sourceClass, sourceMethod, param1] = args as [string, string, any];

                        //_Logger.entering(sourceClass, sourceMethod,param1);
                        if (ErrorLogger._level.intValue() <= LogLevel.FINER.intValue()) {
                            console.log("Entering: " + sourceClass + "." + sourceMethod +
                                " - " + param1.toString());
                        }
                    }
                    break;
                }

                default: {
                    throw Error(`Invalid number of arguments`);
                }
            }
        }
    }


    /**
     * Log a method return.
     * <p>
     * This is a convenience method that can be used to log returning
     * from a method.  A LogRecord with message "RETURN", log level
     * FINER, and the given sourceMethod and sourceClass is logged.
     * <p>
     * @param   sourceClass    name of class that issued the logging request
     * @param   sourceMethod   name of the method
     */
    public static Exiting(sourceClass: string, sourceMethod: string): void;

    /**
     * Log a method return, with result object.
     * <p>
     * This is a convenience method that can be used to log returning
     * from a method.  A LogRecord with message "RETURN {0}", log level
     * FINER, and the gives sourceMethod, sourceClass, and result
     * object is logged.
     * <p>
     * @param   sourceClass    name of class that issued the logging request
     * @param   sourceMethod   name of the method
     * @param   result  Object that is being returned
     */
    public static Exiting(sourceClass: string, sourceMethod: string, result: any): void;
    public static Exiting(...args: unknown[]): void 
    {
        if(console)
        {
            switch (args.length) {
                case 2: {
                    const [sourceClass, sourceMethod] = args as [string, string];


                    //_Logger.exiting(sourceClass, sourceMethod);
                    if (ErrorLogger._level.intValue() <= LogLevel.FINER.intValue()) {
                        console.log("Exiting: " + sourceClass + "." + sourceMethod);
                    }


                    break;
                }

                case 3: {
                    const [sourceClass, sourceMethod, result] = args as [string, string, any];


                    //_Logger.exiting(sourceClass, sourceMethod, result);
                    if (ErrorLogger._level.intValue() <= LogLevel.FINER.intValue()) {
                        console.log("Entering: " + sourceClass + "." + sourceMethod +
                            " - " + result.toString());
                    }


                    break;
                }

                default: {
                    throw Error(`Invalid number of arguments`);
                }
            }
        }
    }



    /**
     * Defaults to Level.INFO
     * @param message {@link String}
     */
    public static LogMessage(message: string): void;

    /**
     * Defaults to Level.INFO
     * @param message {@link String}
     * @param showMessageBox (@link {@link Boolean}
     */
    public static LogMessage(message: string, showMessageBox: boolean): void;

    /**
     *
     * @param message {@link String}
     * @param lvl {@link Level}
     * @param showMessageBox {@link Boolean}
     */
    public static LogMessage(message: string, lvl: LogLevel, showMessageBox: boolean): void;

    public static LogMessage(sourceClass: string, sourceMethod: string, message: string): void;

    public static LogMessage(sourceClass: string, sourceMethod: string, message: string, showMessageBox: boolean): void;

    public static LogMessage(sourceClass: string, sourceMethod: string, message: string, lvl: LogLevel): void;

    public static LogMessage(sourceClass: string, sourceMethod: string, message: string, lvl: LogLevel, showMessageBox: boolean): void;

    public static LogMessage(sourceClass: string, sourceMethod: string, message: string, lvl: LogLevel, param1: any, showMessageBox: boolean): void;

    public static LogMessage(sourceClass: string, sourceMethod: string, message: string, lvl: LogLevel, params: any[], showMessageBox: boolean): void;
    public static LogMessage(...args: unknown[]): void 
    {
        if(console)
        {
            switch (args.length) {
                case 1: {
                    const [message] = args as [string];

                    ErrorLogger.LogMessage(message, LogLevel.INFO, false);

                    break;
                }

                case 2: {
                    const [message, showMessageBox] = args as [string, boolean];

                    ErrorLogger.LogMessage(message, LogLevel.INFO, showMessageBox);

                    break;
                }

                case 3: {
                    if (args[2] instanceof Boolean) {
                        const [message, lvl, showMessageBox] = args as [string, LogLevel, boolean];


                        if (lvl.intValue() >= ErrorLogger._level.intValue()) {
                            console.log(new Date().toLocaleString('en-US', this.dateFormatOptions) + ErrorLogger.LoggerName);
                            console.log("INFO: " + message);
                        }
                        /*_Logger.log(lvl, message);
                        if(showMessageBox==true &&
                                lvl.intValue() >= _Logger.getLevel().intValue() &&
                                lvl.intValue() < Integer.MAX_VALUE)
                        {
                        JOptionPane.showMessageDialog(null, message, "Message", JOptionPane.PLAIN_MESSAGE);
                        }//*/
                    } else {

                        const [sourceClass, sourceMethod, message] = args as [string, string, string];


                        ErrorLogger.LogMessage(sourceClass, sourceMethod, message, LogLevel.INFO, false);
                    }
                    break;
                }

                case 4: {
                    if (args[3] instanceof Boolean) {

                        const [sourceClass, sourceMethod, message, showMessageBox] = args as [string, string, string, boolean];


                        ErrorLogger.LogMessage(sourceClass, sourceMethod, message, LogLevel.INFO, showMessageBox);

                    } else {

                        const [sourceClass, sourceMethod, message, lvl] = args as [string, string, string, LogLevel];


                        ErrorLogger.LogMessage(sourceClass, sourceMethod, message, lvl, false);

                    }
                    break;
                }

                case 5: {
                    const [sourceClass, sourceMethod, message, lvl, showMessageBox] = args as [string, string, string, LogLevel, boolean];


                    if (lvl.intValue() >= ErrorLogger._level.intValue()) {
                        console.log(new Date().toLocaleString('en-US', this.dateFormatOptions) + sourceClass + "." + sourceMethod);
                        console.log(lvl.toString() + ": " + message);
                    }
                    /*
                    _Logger.logp(lvl, sourceClass, sourceMethod, message);
                    if(showMessageBox==true &&
                            lvl.intValue() >= _Logger.getLevel().intValue() &&
                            lvl.intValue() < Integer.MAX_VALUE)
                    {
                    //JOptionPane.showMessageDialog(null, message, "Message", JOptionPane.PLAIN_MESSAGE);
                    }//*/


                    break;
                }

                case 6: {
                    if (args[4] instanceof Array) {
                        const [sourceClass, sourceMethod, message, lvl, params, showMessageBox] = args as [string, string, string, LogLevel, any[], boolean];


                        if (lvl.intValue() >= ErrorLogger._level.intValue()) {
                            console.log(new Date().toLocaleString('en-US', this.dateFormatOptions) + sourceClass + "." + sourceMethod);
                            console.log(lvl.toString() + ": " + message);
                            for (let param of params) {
                                console.log(param.toString());
                            }
                        }
                        /*
                        _Logger.logp(lvl, sourceClass, sourceMethod, message, params);
                        if(showMessageBox==true &&
                                lvl.intValue() >= _Logger.getLevel().intValue() &&
                                lvl.intValue() < Integer.MAX_VALUE)
                        {
                        //JOptionPane.showMessageDialog(null, message, "Message", JOptionPane.PLAIN_MESSAGE);
                        }//*/
                    } else {
                        const [sourceClass, sourceMethod, message, lvl, param1, showMessageBox] = args as [string, string, string, LogLevel, any, boolean];

                        let params: any[] = new Array<any>(1);
                        params[0] = param1;
                        ErrorLogger.LogMessage(sourceClass, sourceMethod, message, lvl, params, showMessageBox);
                    }

                    break;
                }

                default: {
                    throw Error(`Invalid number of arguments`);
                }
            }
        }
    }


    public static LogException(sourceClass: string, sourceMethod: string, exc: Error): void;

    public static LogException(sourceClass: string, sourceMethod: string, exc: Error, showMessageBox: boolean): void;

    public static LogException(sourceClass: string, sourceMethod: string, exc: Error, lvl: LogLevel): void;

    public static LogException(sourceClass: string, sourceMethod: string, exc: Error, lvl: LogLevel, showMessageBox: boolean): void;
    public static LogException(...args: unknown[]): void {
        switch (args.length) {
            case 3: {
                const [sourceClass, sourceMethod, exc] = args as [string, string, Error];


                ErrorLogger.LogException(sourceClass, sourceMethod, exc, LogLevel.INFO, false);


                break;
            }

            case 4: {
                if (args[3] instanceof Boolean) {

                    const [sourceClass, sourceMethod, exc, showMessageBox] = args as [string, string, Error, boolean];


                    ErrorLogger.LogException(sourceClass, sourceMethod, exc, LogLevel.INFO, showMessageBox);

                } else {

                    const [sourceClass, sourceMethod, exc, lvl] = args as [string, string, Error, LogLevel];


                    ErrorLogger.LogException(sourceClass, sourceMethod, exc, lvl, false);
                }

                break;
            }

            case 5: {
                const [sourceClass, sourceMethod, exc, lvl, showMessageBox] = args as [string, string, Error, LogLevel, boolean];


                if (lvl.intValue() >= ErrorLogger._level.intValue()) 
                {
                    if(console)
                    {
                        console.error(new Date().toLocaleString('en-US', this.dateFormatOptions) + sourceClass + "." + sourceMethod);
                        console.error(lvl.toString() + ": " + exc.message);
                        console.error(ErrorLogger.getStackTrace(exc));
                    }
                    else
                    {
                        throw exc;
                    }
                    
                }
                /*
                _Logger.logp(lvl, sourceClass, sourceMethod, exc.message,exc);
                //_Logger.logp(Level.INFO, sourceClass, sourceMethod, exc.message);
        
                if(exc != null && showMessageBox==true &&
                        lvl.intValue() >= _Logger.getLevel().intValue() &&
                        lvl.intValue() < Integer.MAX_VALUE)//shouldn't be showing if logging off
                {
                   //JOptionPane.showMessageDialog(null, exc.message, "Exception: " + sourceClass + "." + sourceMethod, JOptionPane.PLAIN_MESSAGE);
                }//*/


                break;
            }

            default: {
                throw Error(`Invalid number of arguments`);
            }
        }
    }


    public static PrintList(list: Array<any>): string {
        let message: string = "";
        for (let item of list) {
            message += item.toString() + "\n";
        }
        return message;
    }

    public static PrintObjectMap(map: Map<string, any>): string {
        let message: string = "";
        if (map != null) {
            for (let [key, val] of map) {
                message += key + " : " + val + "\n";
            }
        }
        //ErrorLogger.LogMessage(message);
        return message;
    }

    public static PrintStringMap(map: Map<string, string>): string {
        let message: string = "";
        if (map != null) {
            for (let [key, val] of map) {
                message += key + " : " + val + "\n";
            }
        }
        //ErrorLogger.LogMessage(message);
        return message;
    }

}
