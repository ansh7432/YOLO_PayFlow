"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const auth_service_1 = require("./auth/auth.service");
const payments_service_1 = require("./payments/payments.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const authService = app.get(auth_service_1.AuthService);
    const paymentsService = app.get(payments_service_1.PaymentsService);
    const adminUser = await authService.createDefaultUser();
    await paymentsService.seedSampleData(adminUser._id.toString());
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`🚀 PayFlow API is running on: http://localhost:${port}`);
    console.log(`📋 Default admin credentials: admin / admin123`);
}
bootstrap();
//# sourceMappingURL=main.js.map