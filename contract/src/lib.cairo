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
        purpose: felt252
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
    fn deposit_reward(ref self: TContractState, entity_id: felt252, usd_amount: u256);
    fn withdraw_reward(ref self: TContractState, entity_id: felt252, amount: u256);
    fn get_token_price(self: @TContractState) -> u128;
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

// Contract implementation
#[starknet::contract]
mod health_data {
    // use core::option::OptionTrait;
    use super::{IDataAccessLogging, IConsentManagement, IRewardPool,Person, Consent, DataRequestLog, Expiration};
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

    use pragma_lib::abi::{IPragmaABIDispatcher, IPragmaABIDispatcherTrait};
    use pragma_lib::types::DataType;
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
        rewards: Map<felt252, u256>, // Entity ID to Reward Balance mapping
        pragma_contract: ContractAddress,
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
    struct RewardDeposited {
        entity_id: felt252,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardWithdrawn {
        entity_id: felt252,
        amount: u256,
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

            // Store consent with timestamp validation
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
            purpose: felt252
        ) -> bool {
            // Get consent directly
            let consent = self.consents.read((patient_id, entity_id));
            
            // Early return if no consent exists
            if consent.patient_id == 0 {
                return false;
            }
        
            // Validate purpose and expiration
            let current_timestamp = get_block_timestamp();
            let purpose_valid = consent.purpose == purpose;
            
            let expiration_valid = match consent.expiration {
                Expiration::Finite(exp_time) => current_timestamp <= exp_time,
                Expiration::Infinite => true
            };
            
            purpose_valid && expiration_valid
        }
        fn revoke_consent(
            ref self: ContractState,
            patient_id: felt252,
            entity_id: felt252
        ) {
            self.ensure_owner();
            // self.consents.remove((patient_id, entity_id));
        }
        }
    
     #[abi(embed_v0)]
    impl RewardPool of IRewardPool<ContractState> {
        fn deposit_reward(ref self: ContractState, entity_id: felt252, usd_amount: u256) {
            self.ensure_owner();
            
            // Get token price in USD
            let token_price = self.get_token_price().into();
            
            // Calculate token amount
            let token_amount = (usd_amount * DECIMAL_FACTOR) / token_price;
            
            // Transfer tokens
            let token = ERC20ABIDispatcher {
                contract_address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7.try_into().unwrap()
        
            };
            
            let caller = get_caller_address();
            token.transfer_from(caller, get_contract_address(), token_amount);
           
            
            // Update balances
            let current = self.rewards.read(entity_id);
            self.rewards.write(entity_id, current + token_amount);
            
            self.emit(Event::RewardDeposited(RewardDeposited {
                entity_id,
                amount: token_amount
            }));
        }

        fn withdraw_reward(ref self: ContractState, entity_id: felt252, amount: u256) {
            let current = self.rewards.read(entity_id);
            assert(current >= amount, 'Insufficient balance');
            
            // Transfer tokens
            let token = ERC20ABIDispatcher {
                contract_address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7.try_into().unwrap()
            };
            
            let recipient = get_caller_address();
            token.transfer(recipient, amount);
            
            // Update balance
            self.rewards.write(entity_id, current - amount);
            
            self.emit(Event::RewardWithdrawn(RewardWithdrawn {
                entity_id,
                amount
            }));
        }

        fn get_token_price(self: @ContractState) -> u128 {
            let oracle = IPragmaABIDispatcher {
                contract_address: self.pragma_contract.read()
            };
            
            let response = oracle.get_data_median(DataType::SpotEntry(TOKEN_USD));
            response.price
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
