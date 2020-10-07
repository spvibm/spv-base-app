const httpContext = require('express-http-context');
const path = require('path');
const packageInfo = require(path.join(process.cwd(), 'package.json'));
const spvInfo = require(path.join(process.cwd(), 'spv.json'));

module.exports = class BaseApp {
    constructor(options) {
        const defaults = {
            useHttpContext: true,
            config: require('config'),
            logger: "",
            express: require('express'),
            useSecurity: true,
            useCors: false,
            useHealthCheck: true,
            useCoverage: false,
            useBodyParser: true,
            useVersion: true,
            healthCheckConfig: null,
            useCache: false,
            basePath: spvInfo.basePath || ""
        };

        this.options = Object.assign({}, defaults, options);

        if (this.options.config.has('cors.enabled')) {
            this.options.useCors = this.options.config.get('cors.enabled');
        }

        this.app = this.options.express();
        this.beforeMountRoutes();
        this.app.use(this.options.basePath, this.getRoutes().router);
        this.afterMountRoutes();
    }

    getRoutes() {
        let accessPoints = new (require(path.join(process.cwd(), '/src/plugins/accessPoints')))(this.options.express, spvInfo.accessPoints);
        accessPoints.setRoutes();
        return accessPoints;
    }

    async start() {
        this.server = await this.startServer();        
    }

    mountBodyParser() {
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

    beforeMountRoutes() {
        this.mountBodyParser();
        this.mountCors();
    }
    afterMountRoutes() {
    }

    startServer() {
        const port = this.options.config.get('port') || 3000;
        const app = this.app;
        return new Promise(function(resolve, reject) {
            const server = app.listen(port, function() {
                console.log(`Application ${packageInfo.name} started at port ${port}`)
                resolve(server);
            });
        });
    }

};
