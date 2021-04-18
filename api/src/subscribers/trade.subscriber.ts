import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { TradeHistoryEntity } from '../entities/trade-history.entity';
import { Logger } from '@nestjs/common';

@EventSubscriber()
export class TradeSubscriber implements EntitySubscriberInterface<TradeHistoryEntity> {

  listenTo(): any {
    return TradeHistoryEntity;
  }

  afterInsert(event: InsertEvent<TradeHistoryEntity>): Promise<any> | void {
    // const priceGotUpdated = event.entity
    // if (priceGotUpdated) {
    //   if (Number(event.databaseEntity.price) !== event.entity.price) {
        // console.log(event.entity)
    //     Logger.log(`Price changed from 
    // //     ${ event.databaseEntity.price } to 
    // //     ${ event.entity.price }`, 'Product Price Updated');
        // }
    //  }
  }
}