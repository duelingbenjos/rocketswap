import { Module, Global } from '@nestjs/common';
import { SocketService } from './socket.service';

@Global()
@Module({
 controllers: [],
 providers: [SocketService],
 exports: [SocketService],
})
export class SocketModule {}