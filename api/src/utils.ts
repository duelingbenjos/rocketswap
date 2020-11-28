const validators = require('types-validate-assert')
const { validateTypes } = validators

export const isLamdenKey = key => {
	if (validateTypes.isStringHex(key) && key.length === 64) return true
	return false
}

export const getNewJoiner = (state, prev_state): string => {
	const { players } = state
	const prev_players = prev_state.players

	const new_joiner = players.reduce((accum, val) => {
		if (val.indexOf(prev_players) < 0) accum = val
	}, '')
	return new_joiner
}
