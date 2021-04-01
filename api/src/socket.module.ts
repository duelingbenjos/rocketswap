import { Module, Global } from '@nestjs/common';
import { SocketService } from './services/socket.service';

@Global()
@Module({
 controllers: [],
 providers: [SocketService],
 exports: [SocketService],
})
export class SocketModule {}