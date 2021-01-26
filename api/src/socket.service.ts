import { Injectable } from "@nestjs/common"
import { Server } from "socket.io"
import { handleClientUpdate } from "./types/websocket.types"

@Injectable()
export class SocketService {
//  public socket: Server = null
 public handleClientUpdate: handleClientUpdate = null
}
