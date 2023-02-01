import fs from "fs";
import axios from "axios";

const deposits: any = {
    "00b82d83ac279bbd42b538afec4bc662d8b99f799474b6359888c6476752fd2a": false,
    "016db974119fa09466db4d02162fecd7b4d3e182a0538a8decdc720e8a0294d4": false,
    "048161ae4c1a66a5e51a6f9017b0dc644c11fbb74d7712636bf102caeffb01cc": false,
    "08e23d7b472ca7e4543bfacfe2e98441d46bdb52000bb2fbb7c0b071024a6ea8": false,
    "0cbe1128cef87101733b00a2dc6bdfe978a219a1eeaa6740cb479f99e1392789": false,
    "0cd3f6b6bf1b8cc6d630cd9bd5f36605945906dd033f4d663faea45c53a2aeb8": false,
    "0e265d958966f0aea59b3bf2d310670d3afdc4ad04ee7cb40ba96ae6666aaf4b": false,
    "130ae2259475d66186af9dae0171743563690e9c53d2cd26c12925ff7c142a96": false,
    "15ff54d0e09610b748416cb7fc09ae4020a218b0dbcad00988d06dbda3444075": false,
    "17aaf6f3292be287d04c68a7d62eaaf32632448b126cd73e47ad00f463984ba2": false,
    "18cc8a112763c37ebf41174b31f74ae5189ff28210474fba43e890724c8579ef": false,
    "194f28792a4c41d50fe466a4472738c75784b5db18fb5e33d4561f79ab395fd2": false,
    "234b0e9ee76f5032dbfe75efc653fc28d7e7fc23ca5972a9d310236de313a650": false,
    "2abe216964762e74b96fd73f55462c9440aefff409f29110d995422ca5b635ee": false,
    "342b932bf80639a940d3ccb9ee2f1394a3f49fe9dbf4aabca4162a13b43b36c3": false,
    "350d2d3aac618995a265152a7779e649078ce6ee6921bf01d5679a8a11ee5d20": false,
    "35595cdf921a7622d70fbf50c0cd2dfcceafd675eec8b0433c35944dbd7562a0": false,
    "3574bcb5c8b12b335189e801e84c5805aa5077668e69651217ede48fdd71086f": false,
    "3a796e9366b829cdb848281a8592d324b0f0d13288b0a2012673e845ddc11645": false,
    "3b50e35cd7eff9ff0c03358cc4894a2a74bb9e8d3f5bb43fd5728a7f3aece25f": false,
    "3b81f7290ec43c716175519e58a313b2afe27449608a37281ccc05cfac41d66f": false,
    "3e12734f2d93dc3d1c2343361170697afe285b553fce85146e6fef6f2c51e0a5": false,
    "3fac30ec8b9401e20c7f8a5845fa2d8a7d5b72e0155945245d5f8b85269c1e2d": false,
    "4229bcd57299dc89e8c4b1893d7fe5caa58a2fa5c65aa0c4d1177c356cdc1fc9": false,
    "4489524c8d7a36a488d1be063af1d89ccc57d6aabb58e75badf0f020621dd0cc": false,
    "4868a66e9fe479da6e992b85158ed70a40779be239aa057f010abbdfe33fd9ac": false,
    "4b05a3ee6fa1601e6f6b9180afbf23d2def2aa57d5d8b8cb845850887eaedb1c": false,
    "4d0ff3a9681bcf0f6e8f2715afb605a31aa3fff8b2a6793410fff627e40a5f46": false,
    "50ea6fcf10c40a6a539a4ec07c6441bc5bd71f48c41380f24ee8d03076ae8ee6": false,
    "519a4433ebca91e77a30d10ba3f54803dbe2a0856d31ab2b5ee1680a6efcfbc3": false,
    "53c0d9594dd0f5f4a78ad21e68477aaed97c315abd74e615e89f8f2327fbc5c9": false,
    "5d6344afd1db39da3e1107e59193d9d66c1a26c39d1c0deb64390eca0a53ecd7": false,
    "647e05c869ccaf95d2070e64066474ec980aa9f7d9c87a73f0d670a4111bfff5": false,
    "6656a5c9dcf37f7eadc2b7d8de1998bb5bc4d69244ce75642dd57274feae93db": false,
    "6b2776749f64ace2fabdb7af26fd3500716502ed6402cbd304375ed3c78580db": false,
    "6c13b564b0cc3cfbb8ad797c14fd263f0a09c3d227afacce60d1d50c95f9dbe9": {
        "amount": {
            "__fixed__": "16.59"
        },
        "starting_epoch": 105,
        "time": {
            "__time__": [
                2021,
                12,
                12,
                14,
                51,
                36,
                0
            ]
        },
        "user_yield": 0
    },
    "6df81460beefadf830d804872de3c941a0a093c785872193e1e141992fe7e1da": false,
    "6e3d6554c0f015efddbc1902d512884e52c23c16c94e3bc35382a7eb342c70d5": false,
    "7057e3c4ac151168dddfc5e290e9f59e7b0be75e73538498b67e025d8925c962": false,
    "7cc994343843d5d00f7cf7e26420744ef50e60cd732d24bd0c6f5aa9cf438c13": false,
    "818265dea1c3a8a5cf72b22f3454d23a62f1f90d29b8f463410678ac33300d83": false,
    "83f161db5ca59b820a1c27654b7780cf36554156c97df7eedc0e330d2d9b3094": false,
    "866d2627ea986c40f4dd9969b00f36f7870a8018c62e9975ad6f458a58f826fe": false,
    "86ef2511949397f8ff1072ebd74698a6903e67d17fabf4a42ebe99ee5b13decd": false,
    "889f923fb54a79deb11ee2850010488992222c92351d3024ea3a737b78fab0eb": false,
    "8aa3efea0cd819c2fe898fc77df6b44237294a9fb02950c760a86d0e7563d2de": false,
    "8bd83b16328cdbd557f32bf4107b3a2a62afac0818b94dd079caa1a6f7dddfd8": {
        "amount": {
            "__fixed__": "0.24733859"
        },
        "starting_epoch": 94,
        "time": {
            "__time__": [
                2021,
                11,
                21,
                17,
                16,
                40,
                0
            ]
        },
        "user_yield": 0
    },
    "8da77ecffe0564781e21ecc07b91c1e28893e7d656a04c5621234e0367889989": false,
    "933a0a747b7aa99bdc42eb53cb3dae001ebb035124c81988e649004a0266d1e2": false,
    "941e3fa48f248a2ebfd7c904504149bcb8cc110a6ff30c724e1745aa9fbf248d": false,
    "95b97a7be7b2b9502b86db932ae5b0cdf2c971ac51150fb1f319094eac221f98": false,
    "96c36b7466a21c9a9f4e7ad2265e7a9c452e562a999ddaf5a4000ced3b07bb62": false,
    "9984186b51ebbb096784a7dcc134882dcda55eb30fbf13a651034df619ceb678": false,
    "9efd0891225cbc0044645009524bb0320ca606068651619541a6c5d8d0dd8171": false,
    "9ff2513c1d535f24c1d513dd9144cb7ba0e6e77076738b81a11b8130170aa7b4": false,
    "a326abeb476997e5254945035e6878faf86882360e7ad4d44dbaa89e95af86c9": false,
    "a6acd55ed1ce13f6704fd1d98ad5c3df4671ac0e5066d7ec9c0680fc87067a98": false,
    "a85b07902b938a37b0501ddd29d1725f99c8daeec6f5f4b4b45b3d801ede599f": false,
    "a8cd9f5fec7ef2a384f37b3fd1c3b30f4ddf9a850b9fc518a260d7bf06b627a7": false,
    "a9de1753b0be6559d45932b2fbff9d9e4c6e3387f4a139a844492a06c57301b4": false,
    "b945f761871125743c993d410948fe92a3cae3176aa8158e7982a4945fcf40e6": false,
    "bae2ac10e1a75c603ffb440ba95da955098a8af4db7a75f03a63f00c97fe6667": false,
    "bc9de245ce318814e1b430ea5dbc4aa803d5734929d5c817853ffabf0a87340c": false,
    "bcf638443491499ebc2b23b2d6b872fe89cc7db81bac0e4f1f330196834120a5": false,
    "bec17d74064eddb7eeeeee81d8354cb637984f3bf0fee59632d2a34dd0202696": false,
    "c1bdeb09e03e58621e4408ee0a71636a81b64e4afa4c76c795ba8d3583e1ccde": false,
    "c3d95f37e50518543797da2ad121fa4f08a4590e7e805e0336f6cd99cb20a883": false,
    "c4cb7bb144a7db9f470c06c1e915b975eb746e3ea8919d4b43f689ebb30fb8d1": false,
    "cbdc5c611e997936b293c4a03e7e28492db188a10d8a6f28ada97f8c4a74f600": false,
    "ccd71ac1abbdeaa8c16207ed5e39747cec1dd37b82288ba10bd7017a73d09f6a": false,
    "ccfef6807ec8d4d7a890b08eaa3b8aeef4722191c2b489501623fa2741cc0f47": false,
    "ce20e58137b6dfeb1c25c690961fef9f33d32fda34b2f23f869f7db23a86a680": false,
    "cfca90d18a25efcbb97f50fa24e9ca1bdfc79c359717b63bbea0ebe72e4287ee": false,
    "dc47eac2fd2121a9b4a1f5f67c5b399def6370114e7cf048148385af6a451c07": false,
    "dcb6bf9abca7fa4176cc490a8daf7ff2a7897b7e2445ad4444e6b041b9ef232a": false,
    "df043ffd8ee0d9937cded0e96e35f0ba8fb0ed1f8867b5aac3dc7b51fe431f91": false,
    "e04f90729084c2597af61a9a6c6897318b921c49b0560403e8d93d5ae3351123": false,
    "e1e8b78368b4b90ee17312b7f7e9aff73f542ce742a19c4512f085137b86bc2e": false,
    "e42f935f5f247a55b2c676c60e76bcc19ab5fff527fef08ae9f747d1ed60c6ed": false,
    "e7937ec2971e369641c4777c74a37a248b8b947c081f0cef164de2146d3f3118": false,
    "eaee58e60ed417c78d4085107893d85aa4b1adef1fe462b034d44dc5a02ac35e": false,
    "ec3634c3e2b9dadaa58568cfbbadcfab84d5b75192cfa06a85f40b41a9b19f1d": false,
    "ee014a09b14f1fd0ff55d341814ad73ee00d594d33879810f4c23c582b7b6950": false,
    "ef59aedb2335e2636deef241c0e7e92ff6f9a7cf5bc8ff0ef9ce17247203374b": {
        "amount": {
            "__fixed__": "5.12518293"
        },
        "starting_epoch": 15,
        "time": {
            "__time__": [
                2021,
                9,
                1,
                9,
                10,
                25,
                0
            ]
        },
        "user_yield": 0
    },
    "f66786094017ca25e9ef2475f6f0eb9b590211d4d3377f473fce4d133ccbac28": false,
    "f699dc56bcf2562df955aee946e11b0858c4e58a04cfd742719eb1aff921b5fc": false,
    "f8adfa4b66a8ed22d43e7da93f25903d960b7a04fa67b8f5da3be00eba454d98": false,
    "f92d5f5bf073c688e281d63f2fdde03e0d4466e685866b4ff2854dcd1ce09595": false,
    "feaecce9a1f05b182c4ab7f7a80f0e98fe4ea25ff85235d076fe9a63faab056e": false
};

const active_deposits: any[] = [];

function write_data() {
	const data = JSON.stringify(active_deposits);
	fs.writeFileSync("deposits.json", data);
}

const dep_keys = Object.keys(deposits);
for (let i = 0; i < dep_keys.length; i++) {
	const dep = deposits[dep_keys[i]];
	if (dep) {
		dep.address = dep_keys[i];
		active_deposits.push(dep);
	}
}

async function getTokenYield(address: string) {
	console.log("called get weth yield");
	const user_yield_list = (await axios.get("https://rocketswap.exchange:2053/api/user_yield_list/" + address)).data;
	const neb_yield = user_yield_list["con_liq_mining_neb"];
	return neb_yield?.current_yield || 0;
}

const getYield = async () => {
	let total_yield = 0;
	for (let d of active_deposits) {
		total_yield += await getTokenYield(d.address);
	}
	console.log({ total_yield });
};

async function main() {
	await getYield();
}

main();

// const sanity_checks = [148353.27331796353, 23.413328349006107, 11.824335662676836, 20.228032968878203, 2356.937462718106];

const addTogetherArray = (arr: number[]) => {
	let total = 0;
	for (let i = 0; i < arr.length; i++) {
		total += arr[i];
	}
	return total;
};

// const sanity_check = addTogetherArray(sanity_checks);
// console.log(sanity_check);
// console.log(sanity_check === 150765.6764776622);

// const remainder = 505442.841006374322926570441345854303 - 150765.6764776622;

// console.log(remainder); // 354677.16452871216
