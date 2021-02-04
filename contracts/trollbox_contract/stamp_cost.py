# import election_house

S = Hash()

@construct
def seed(initial_rate: int=100,
         master_contract='masternodes',
         delegate_contract='delegates',
         election_max_length=datetime.DAYS * 1):

    S['value'] = initial_rate
    S['master_contract'] = master_contract
    S['delegate_contract'] = delegate_contract
    S['election_max_length'] = election_max_length

    S['vote_count'] = 1

    reset_current_votes()


def reset_current_votes():
    S['current_total'] = S['value']

@export
def current_value():
    return S['value']