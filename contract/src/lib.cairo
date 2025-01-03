use starknet::ContractAddress;


#[starknet::interface]
pub trait IOwnable<TContractState> {
    fn transfer_ownership(ref self: TContractState, new_owner: Person);
    fn get_owner(self: @TContractState) -> Person;
}

#[starknet::interface]
pub trait IConsentManagement<TContractState> {
    fn add_consent_proof(
        ref self: TContractState, 
        patient_id: felt252,
        entity_id: felt252,
        purpose: felt252,
        proof: felt252,
        expiration: Expiration
    );
    fn verify_consent_proof(
        self: @TContractState,
        patient_id: felt252,
        entity_id: felt252,
        purpose: felt252,
        timestamp: felt252
    ) -> bool;
    fn revoke_consent(
        ref self: TContractState,
        patient_id: felt252,
        entity_id: felt252
    );
}

#[starknet::interface]
pub trait IDataAccessLogging<TContractState> {
    fn log_data_request(
        ref self: TContractState,
        patient_id: felt252,
        entity_id: felt252
    );
    fn fetch_data_request_log(
        self: @TContractState,
        patient_id: felt252,
        entity_id: felt252
    ) -> Option<DataRequestLog>;
}

#[starknet::interface]
pub trait IRewardPool<TContractState> {
    fn deposit_reward(ref self: TContractState, entity_id: felt252, eth_amount: u256, expiry: u64);
    fn withdraw_reward(ref self: TContractState, entity_id: felt252);
    fn add_participant(ref self: TContractState,entity_id: felt252, participant: ContractAddress );
}


#[derive(Drop, Serde, starknet::Store)]
pub struct Person {
    address: ContractAddress,
    name: felt252,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
pub enum Expiration {
    Finite: u64,
    #[default]
    Infinite,
}

#[derive(Drop, Serde, starknet::Store)]
pub struct Consent {
    patient_id: felt252,
    entity_id: felt252,
    purpose: felt252,
    proof: felt252,
    expiration: Expiration,
}

#[derive(Drop, Serde, starknet::Store)]
pub struct DataRequestLog {
    patient_id: felt252,
    entity_id: felt252,
}
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct RewardPoolData {
        entity_id: felt252,
        amount: u256,
        expiry: u64,
        is_active: bool,
        participant_count: u32  
    }

// Contract implementation
#[starknet::contract]
mod health_data {

    use super::{IDataAccessLogging, IConsentManagement, IRewardPool, Person, Consent, DataRequestLog, Expiration,RewardPoolData};

    
    use core::starknet::storage::{
        Map,
        StorageMapReadAccess,
        StorageMapWriteAccess,
        StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };  
    use starknet::{
        ContractAddress,
        get_caller_address,
        get_block_timestamp,
        get_block_number,
        get_contract_address
    };
    use core::pedersen;
    use openzeppelin::token::erc20::interface::{ERC20ABIDispatcher, ERC20ABIDispatcherTrait};
    const TOKEN_USD: felt252 = 19514442401534788;
    const DECIMAL_FACTOR: u256 = 100000000;
    const TOKEN_ADDRESS: felt252 = 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7;
    // Storage declaration
    #[storage]
    struct Storage {
            owner: Person,
            consents: Map<(felt252, felt252), Consent>, 
            logs: Map<(felt252, felt252), DataRequestLog>,
            rewards: Map<felt252, u256>, 
            pragma_contract: ContractAddress,
            reward_pools: Map<felt252, RewardPoolData>,
        }

    #[generate_trait]
    impl InternalMethods of InternalMethodsTrait {
        fn ensure_owner(self: @ContractState) {
            let caller = get_caller_address();
            let owner = self.owner.read();
            assert(caller == owner.address, 'Caller is not the owner');
        }
    }
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ConsentAdded: ConsentAdded,
        ConsentRevoked: ConsentRevoked,
        DataAccessed: DataAccessed,
        RewardDeposited: RewardDeposited,
        RewardWithdrawn: RewardWithdrawn,
        ParticipantAdded: ParticipantAdded,
    }

    #[derive(Drop, starknet::Event)]
    struct ConsentAdded {
        patient_id: felt252,
        entity_id: felt252,
      
    }

    #[derive(Drop, starknet::Event)]
    struct ConsentRevoked {
        patient_id: felt252,
        entity_id: felt252,
      
    }

    #[derive(Drop, starknet::Event)]
    struct DataAccessed {
        patient_id: felt252,
        entity_id: felt252,

    }


    #[derive(Drop, starknet::Event)]
    struct RewardWithdrawn {
        entity_id: felt252,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardDeposited {
    entity_id: felt252,
    amount: u256,
    expiry: u64
    }

    #[derive(Drop, starknet::Event)]
struct ParticipantAdded {
    entity_id: felt252,
    participant: ContractAddress,
    total_participants: u32
}


    #[constructor]
fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
    let owner = Person { 
        address: initial_owner,
        name: 'default_owner' 
    };
    self.owner.write(owner);
}

    #[abi(embed_v0)]
    impl Ownable of super::IOwnable<ContractState> {
        fn transfer_ownership(ref self: ContractState, new_owner: Person) {
            self.ensure_owner();
            let _prev_owner = self.owner.read();
            self.owner.write(new_owner);
        }

        fn get_owner(self: @ContractState) -> Person {
            self.owner.read()
        }
    }


    #[abi(embed_v0)]
    impl ConsentManagement of IConsentManagement<ContractState> {
        fn add_consent_proof(
            ref self: ContractState,
            patient_id: felt252,
            entity_id: felt252,
            purpose: felt252,
            proof: felt252,
            expiration: super::Expiration,
        ) {
            let current_timestamp = get_block_timestamp();
            let _current_block = get_block_number();
            
            // Create consent with current block info
            let consent = Consent { 
                patient_id,
                entity_id, 
                purpose,
                proof,
                expiration 
            };

    
            match expiration {
                Expiration::Finite(exp_time) => {
                    assert(exp_time > current_timestamp, 'Expiration must be in future');
                },
                Expiration::Infinite => ()
            }
            
            self.consents.write((patient_id, entity_id), consent);
            
            self.emit(Event::ConsentAdded(ConsentAdded {
                patient_id,
                entity_id,
            }));
        }

        fn verify_consent_proof(
            self: @ContractState,
            patient_id: felt252,
            entity_id: felt252,
            purpose: felt252,
            timestamp: felt252
        ) -> bool {
          
            let consent = self.consents.read((patient_id, entity_id));
        
            if consent.patient_id == 0 {
                return false;
            }
 
            let current_timestamp = get_block_timestamp();
            let expiration_valid = match consent.expiration {
                Expiration::Finite(exp_time) => current_timestamp <= exp_time,
                Expiration::Infinite => true
            };
        
   
            let proof = pedersen::pedersen(
                pedersen::pedersen(
                    pedersen::pedersen(patient_id, entity_id),
                    purpose
                ),
                timestamp
            );
            

            let proof_matches = proof == consent.proof;
            let purpose_valid = consent.purpose == purpose;
        
            purpose_valid && expiration_valid && proof_matches 
        }
        fn revoke_consent(
            ref self: ContractState,
            patient_id: felt252,
            entity_id: felt252
        ) {
            
            let empty_consent = Consent {
                patient_id: 0,
                entity_id: 0,
                purpose: 0,
                proof: 0,
                expiration: Expiration::Infinite,
            };
            self.consents.write((patient_id, entity_id), empty_consent);
        }
        }
    
     #[abi(embed_v0)]
    impl RewardPool of IRewardPool<ContractState> {
    fn deposit_reward(
    ref self: ContractState, 
    entity_id: felt252, 
    eth_amount: u256,
    expiry: u64
    ) {
 
    let current_time = get_block_timestamp();
    assert(expiry > current_time, 'Invalid expiry time');
    
   
    let token = ERC20ABIDispatcher {
        contract_address: TOKEN_ADDRESS.try_into().unwrap()
    };
    
    let caller = get_caller_address();
    token.transfer_from(caller, get_contract_address(), eth_amount);
    
    let pool = RewardPoolData {
        entity_id,
        amount: eth_amount,
        expiry,
        is_active: true,
        participant_count: 0
    };
    

    self.reward_pools.write(entity_id, pool);
    

    self.emit(Event::RewardDeposited(RewardDeposited {
        entity_id,
        amount: eth_amount,
        expiry
    }));
}
   fn add_participant(
    ref self: ContractState,
    entity_id: felt252,
    participant: ContractAddress
    ) {
  
    let mut pool = self.reward_pools.read(entity_id);
    
 
    assert(pool.is_active, 'Pool not active');
    assert(get_block_timestamp() < pool.expiry, 'Pool expired');
    
    pool.participant_count += 1;
 
    self.reward_pools.write(entity_id, pool);
    
    self.emit(Event::ParticipantAdded(ParticipantAdded {
        entity_id,
        participant,
        total_participants: pool.participant_count
    }));
}

    fn withdraw_reward(ref self: ContractState, entity_id: felt252) {
 
    let pool = self.reward_pools.read(entity_id);
    assert(pool.is_active, 'Pool not active');
    assert(get_block_timestamp() >= pool.expiry, 'Pool not expired');
    assert(pool.participant_count > 0, 'No participants');
    
    let share_amount = pool.amount / pool.participant_count.into();
    
  
    let token = ERC20ABIDispatcher {
        contract_address: TOKEN_ADDRESS.try_into().unwrap()
    };
    
    
    let recipient = get_caller_address();
    token.transfer(recipient, share_amount);
    
   
    self.emit(Event::RewardWithdrawn(RewardWithdrawn {
        entity_id,
        amount: share_amount
    }));
}
    }

    #[abi(embed_v0)]
    impl DataAccessLogging of IDataAccessLogging<ContractState> {
        fn log_data_request(
            ref self: ContractState,
            patient_id: felt252,
            entity_id: felt252
        ) {
            let log = DataRequestLog { patient_id, entity_id };
            self.logs.write((patient_id, entity_id), log);
        }

        fn fetch_data_request_log(
            self: @ContractState,
            patient_id: felt252,
            entity_id: felt252
        ) -> Option<DataRequestLog> {
            Option::Some(self.logs.read((patient_id, entity_id)))
        }
    }
}

