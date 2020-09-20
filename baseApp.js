const httpContext = require('express-http-context');
const path = require('path');
const packageInfo = require(path.join(process.cwd(), 'package.json'));
const spvInfo = require(path.join(process.cwd(), 'spv.json'));

module.exports = class BaseApp {
    constructor(options) {
        const defaults = {
            useHttpContext: true,
            config: require('config'),
            logger: '', // require('@common/node-logger/src/logger'),
            express: require('express'),
            useSecurity: true,
            useCors: false,
            useHealthCheck: true,
            useCoverage: false,
            useBodyParser: true,
            useVersion: true,
            healthCheckConfig: null,
            useCache: false,
        };

        this.options = Object.assign({}, defaults, options);

        if (this.options.config.has('cors.enabled')) {
            this.options.useCors = this.options.config.get('cors.enabled');
        }
        this.app = this.options.express();
        this.beforeMountRoutes();
        this.app.use(this.getRoutes().router);
        this.afterMountRoutes();
    }

    getRoutes() {
        // let accessPoints = new (require(path.join(process.cwd(), '/src/plugins/accessPoints')))(this.options.express, spvInfo.accessPoints);
        // let accessPoints    = new (require("./plugins/accessPoints"))(this.options.express, spvInfo.accessPoints);
        // let accessPoints = new (require(path.join(process.cwd(), '/src/plugins/accessPoints')))(this.options.express, spvInfo.accessPoints);
        let accessPoints = new (require(path.join(process.cwd(), '/src/plugins/accessPoints')))(this.options.express, spvInfo.accessPoints);
        accessPoints.setRoutes();
        return accessPoints;
    }

    async start() {
        // this.startTunnels();
        this.server = await this.startServer();        
    }

    mountBodyParser() {
        // this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({extended: true}));
        if (this.options.useBodyParser) {
            const bodyParser = require('body-parser');
            this.app.use(bodyParser.json({type: 'application/json'}));
        }
    }
    mountCors() {
        if (this.options.useCors) {
            const cors = require('cors');
            this.app.use(cors({
                origin: this.options.config.get('cors.origin'),
            }));
        }
    }
    mount404ErrorNotFound() {
        // catch 404 and forward to error handler
        this.app.use(function(req, res, next) {
            const e = new Error();
            e.code = 'not_found';
            e.message = 'No representation found for the target resource';
            e.severity = 'HIGH';
            e.status = 404;

            throw e;
        });
    }

    beforeMountRoutes() {
        // this.app.disable("x-powered-by");
        // this.app.use(cors())
        // this.app.use(compression());

        // this.mountVersion();
        // this.mountCoverage();
        this.mountBodyParser();
        // this.mountHttpContext();
        // this.mountMessageTracking();
        // this.mountLogger();
        // this.mountSwaggerStatsLogger();
        // this.mountHealthCheck();
        // this.mountSecurity();
        this.mountCors();
        // this.mountTokenDecoder();
        // this.mount400InvalidJSONParameters();
        // this.mountCache();
    }
    afterMountRoutes() {
        // this.mount404ErrorNotFound();
        // this.mountErrorMiddleware();
    }

    startServer() {
        const port = this.options.config.get('port') || 3000;
        const app = this.app;
        // const logger = this.options.logger;
        return new Promise(function(resolve, reject) {
            const server = app.listen(port, function() {
                console.log(`Application ${packageInfo.name} started at port ${port}`)
                // logger.info(
                //     `Application ${packageInfo.name} started at port ${port}`, {
                //         type: 'application_start',
                //         applicationName: packageInfo.name,
                //         port,
                //     });
                resolve(server);
            });
        });
    }

};
