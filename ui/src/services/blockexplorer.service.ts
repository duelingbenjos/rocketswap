import axios from 'axios'
import { config } from '../config'
import { valuesToBigNumber } from '../utils'


export class LamdenBlockexplorer_API{
    private static _instance: LamdenBlockexplorer_API
    private url;


    public static getInstance() {
		if (!LamdenBlockexplorer_API._instance) {
			LamdenBlockexplorer_API._instance = new LamdenBlockexplorer_API(config.blockExplorer)
		}
		return LamdenBlockexplorer_API._instance
    }
    
    constructor(url){
        if (!url) throw new Error(`Need blockexplorer URL`)
        this.url = url;        
    }


    async getKeys(keyList){
        const res = await axios.post(`${this.url}/api/states/history/getKeys`, keyList).catch(err => console.log(err))
        let data = valuesToBigNumber(res.data)
        let keysObj = {} 
        data.map(kvPair => {
            if (kvPair.value?.__fixed__) kvPair.value = kvPair.value?.__fixed__
            keysObj[kvPair.key] = kvPair.value
        })
        return keysObj
    }
}