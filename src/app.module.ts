import * as AdminJSPrisma from '@adminjs/prisma';
import AdminJS from 'adminjs';
import { PrismaService } from './prisma/prisma.service';
import { DMMFClass } from '@prisma/client/runtime';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auh.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '@adminjs/nestjs';

AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

const authenticate = async (email: string, password: string) => {
  if (email === 'test@test.com' && password === 'password') {
    return Promise.resolve({ email: 'test@test.com', password: 'password' });
  }
  return null;
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
    AdminModule.createAdminAsync({
      useFactory: () => {
        const prisma = new PrismaService();
        // `_baseDmmf` contains necessary Model metadata but it is a private method
        // so it isn't included in PrismaClient type
        const dmmf = (prisma as any)._baseDmmf as DMMFClass;

        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              {
                resource: { model: dmmf.modelMap.Bookmark, client: prisma },
                options: {},
              },
              {
                resource: { model: dmmf.modelMap.User, client: prisma },
                options: {},
              },
            ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        };
      },
    }),
  ],
})
export class AppModule {}
