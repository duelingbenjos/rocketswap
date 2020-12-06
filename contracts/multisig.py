import currency
sig = Hash(default_value=False)
proposal_details = Hash()
number_of_sig = Variable()
proposal_id = Variable()
minimum_proposal_duration = Variable()
required_approval_percentage = Variable()
finished_proposals = Variable()
@construct
def seed():
    number = 0
    msa = ["wallet1","wallet2","wallet3"]
    for x in msa:
        sig[x] = True
        number += 1
    number_of_sig.set(number)
    proposal_id.set(0)
    minimum_proposal_duration.set(0)
    required_approval_percentage.set(0.5)
    finished_proposals.set([-1])
    return msa
@export
def create_transfer_proposal(amount: float, to: str, description: str, voting_time_in_days: int):
    assert voting_time_in_days >= minimum_proposal_duration.get()
    assert sig[ctx.caller] is True
    p_id = proposal_id.get()
    proposal_id.set(p_id + 1)
    proposal_details[p_id, "amount"] = amount
    proposal_details[p_id, "reciever"] = to
    proposal_details[p_id, "proposal_creator"] = ctx.caller
    proposal_details[p_id, "description"] = description
    proposal_details[p_id, "time"] = now
    proposal_details[p_id, "type"] = "transfer"
    proposal_details[p_id, "duration"] = voting_time_in_days
    return p_id
@export
def vote(p_id: int, result: bool):
    assert sig[ctx.caller] is True
    sig[p_id, ctx.caller] = result
    try:
        proposal_details[p_id, "voters"].append(ctx.caller)
    except AttributeError:
        proposal_details[p_id, "voters"] = [ctx.caller]
@export
def determine_results(p_id: int):
    assert (proposal_details[p_id, "time"] + datetime.timedelta(days=1) * (proposal_details[p_id, "duration"])) <= now, "Proposal not over!"
    proposals_finished = finished_proposals.get()
    for x in proposals_finished:
        assert p_id != x
    proposals_finished.append(p_id)
    finished_proposals.set(proposals_finished)
    approvals = 0
    for x in proposal_details[p_id, "voters"]:
        if sig[p_id, x] is True:
            approvals += 1
    if (approvals / number_of_sig.get()) >= required_approval_percentage.get():
        if proposal_details[p_id, "type"] == "transfer":
            currency.transfer(proposal_details[p_id, "amount"], proposal_details[p_id, "reciever"])
        elif proposal_details[p_id, "type"] == "add_signature":
            sig[proposal_details[p_id, "reciever"]] = True
            number_of_sig.set(number_of_sig.get() + 1)
        elif proposal_details[p_id, "type"] == "remove_signature":
            sig[proposal_details[p_id, "reciever"]] = False
            number_of_sig.set(number_of_sig.get() - 1)
        elif proposal_details[p_id, "type"] == "change_approval_percentage":
            required_approval_percentage.set(proposal_details[p_id, "amount"])
        elif proposal_details[p_id, "type"] == "change_minimum_duration":
            minimum_proposal_duration.set(proposal_details[p_id, "amount"])
        return True
    else:
        return False
@export
def create_signature_proposal(address: str, description: str, voting_time_in_days: int):
    assert voting_time_in_days >= minimum_proposal_duration.get()
    assert sig[ctx.caller] is True
    assert sig[address] is False
    p_id = proposal_id.get()
    proposal_id.set(p_id + 1)
    proposal_details[p_id, "reciever"] = address
    proposal_details[p_id, "proposal_creator"] = ctx.caller
    proposal_details[p_id, "description"] = description
    proposal_details[p_id, "time"] = now
    proposal_details[p_id, "type"] = "add_signature"
    proposal_details[p_id, "duration"] = voting_time_in_days
    return p_id
@export
def remove_signature_proposal(address: str, description: str, voting_time_in_days: int):
    assert voting_time_in_days >= minimum_proposal_duration.get()
    assert sig[ctx.caller] is True
    assert sig[address] is True
    p_id = proposal_id.get()
    proposal_id.set(p_id + 1)
    proposal_details[p_id, "reciever"] = address
    proposal_details[p_id, "proposal_creator"] = ctx.caller
    proposal_details[p_id, "description"] = description
    proposal_details[p_id, "time"] = now
    proposal_details[p_id, "type"] = "remove_signature"

    proposal_details[p_id, "duration"] = voting_time_in_days
    return p_id
@export
def change_approval_percentage(new_percentage: float, description: str, voting_time_in_days: int):
    assert voting_time_in_days >= minimum_proposal_duration.get()
    assert new_percentage <= 1
    assert sig[ctx.caller] is True
    p_id = proposal_id.get()
    proposal_id.set(p_id + 1)
    proposal_details[p_id, "amount"] = new_percentage
    proposal_details[p_id, "proposal_creator"] = ctx.caller
    proposal_details[p_id, "description"] = description
    proposal_details[p_id, "time"] = now
    proposal_details[p_id, "type"] = "change_approval_percentage"
    proposal_details[p_id, "duration"] = voting_time_in_days
    return p_id
@export
def change_minimum_duration(new_minimum_amount: int, description: str, voting_time_in_days: int):
    assert voting_time_in_days >= minimum_proposal_duration.get()
    assert new_minimum_amount <= 365
    assert sig[ctx.caller] is True
    p_id = proposal_id.get()
    proposal_id.set(p_id + 1)
    proposal_details[p_id, "amount"] = new_minimum_amount
    proposal_details[p_id, "proposal_creator"] = ctx.caller
    proposal_details[p_id, "description"] = description
    proposal_details[p_id, "time"] = now
    proposal_details[p_id, "type"] = "change_minimum_duration"
    proposal_details[p_id, "duration"] = voting_time_in_days
    return p_id
@export 
def proposal_information(p_id: int):
    return str(proposal_details[p_id, "amount"] or '') + ", " + str(proposal_details[p_id, "reciever"] or '') + ", " + str(proposal_details[p_id, "proposal_creator"] or '') + ", " + str(proposal_details[p_id, "description"] or '') + ", " + str(proposal_details[p_id, "time"] or '') + ", " + str(proposal_details[p_id, "type"] or '') + ", " + str(proposal_details[p_id, "duration"] or '') 

#TODO: Add non-currency compatibility with importlib
#TODO: Add edge-case tests