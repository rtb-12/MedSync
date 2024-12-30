export const ABI =[
  {
    "name": "Ownable",
    "type": "impl",
    "interface_name": "contract::IOwnable"
  },
  {
    "name": "contract::Person",
    "type": "struct",
    "members": [
      {
        "name": "address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "name",
        "type": "core::felt252"
      }
    ]
  },
  {
    "name": "contract::IOwnable",
    "type": "interface",
    "items": [
      {
        "name": "transfer_ownership",
        "type": "function",
        "inputs": [
          {
            "name": "new_owner",
            "type": "contract::Person"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "get_owner",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "contract::Person"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "ConsentManagement",
    "type": "impl",
    "interface_name": "contract::IConsentManagement"
  },
  {
    "name": "contract::Expiration",
    "type": "enum",
    "variants": [
      {
        "name": "Finite",
        "type": "core::integer::u64"
      },
      {
        "name": "Infinite",
        "type": "()"
      }
    ]
  },
  {
    "name": "core::bool",
    "type": "enum",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "name": "contract::IConsentManagement",
    "type": "interface",
    "items": [
      {
        "name": "add_consent_proof",
        "type": "function",
        "inputs": [
          {
            "name": "patient_id",
            "type": "core::felt252"
          },
          {
            "name": "entity_id",
            "type": "core::felt252"
          },
          {
            "name": "purpose",
            "type": "core::felt252"
          },
          {
            "name": "proof",
            "type": "core::felt252"
          },
          {
            "name": "expiration",
            "type": "contract::Expiration"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "verify_consent_proof",
        "type": "function",
        "inputs": [
          {
            "name": "patient_id",
            "type": "core::felt252"
          },
          {
            "name": "entity_id",
            "type": "core::felt252"
          },
          {
            "name": "purpose",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "name": "revoke_consent",
        "type": "function",
        "inputs": [
          {
            "name": "patient_id",
            "type": "core::felt252"
          },
          {
            "name": "entity_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "name": "RewardPool",
    "type": "impl",
    "interface_name": "contract::IRewardPool"
  },
  {
    "name": "core::integer::u256",
    "type": "struct",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "name": "contract::IRewardPool",
    "type": "interface",
    "items": [
      {
        "name": "deposit_reward",
        "type": "function",
        "inputs": [
          {
            "name": "entity_id",
            "type": "core::felt252"
          },
          {
            "name": "eth_amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "withdraw_reward",
        "type": "function",
        "inputs": [
          {
            "name": "entity_id",
            "type": "core::felt252"
          },
          {
            "name": "eth_amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "name": "DataAccessLogging",
    "type": "impl",
    "interface_name": "contract::IDataAccessLogging"
  },
  {
    "name": "contract::DataRequestLog",
    "type": "struct",
    "members": [
      {
        "name": "patient_id",
        "type": "core::felt252"
      },
      {
        "name": "entity_id",
        "type": "core::felt252"
      }
    ]
  },
  {
    "name": "core::option::Option::<contract::DataRequestLog>",
    "type": "enum",
    "variants": [
      {
        "name": "Some",
        "type": "contract::DataRequestLog"
      },
      {
        "name": "None",
        "type": "()"
      }
    ]
  },
  {
    "name": "contract::IDataAccessLogging",
    "type": "interface",
    "items": [
      {
        "name": "log_data_request",
        "type": "function",
        "inputs": [
          {
            "name": "patient_id",
            "type": "core::felt252"
          },
          {
            "name": "entity_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "name": "fetch_data_request_log",
        "type": "function",
        "inputs": [
          {
            "name": "patient_id",
            "type": "core::felt252"
          },
          {
            "name": "entity_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::option::Option::<contract::DataRequestLog>"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "name": "constructor",
    "type": "constructor",
    "inputs": [
      {
        "name": "initial_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "contract::health_data::ConsentAdded",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "patient_id",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "entity_id",
        "type": "core::felt252"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "contract::health_data::ConsentRevoked",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "patient_id",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "entity_id",
        "type": "core::felt252"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "contract::health_data::DataAccessed",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "patient_id",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "entity_id",
        "type": "core::felt252"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "contract::health_data::RewardDeposited",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "entity_id",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "amount",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "struct",
    "name": "contract::health_data::RewardWithdrawn",
    "type": "event",
    "members": [
      {
        "kind": "data",
        "name": "entity_id",
        "type": "core::felt252"
      },
      {
        "kind": "data",
        "name": "amount",
        "type": "core::integer::u256"
      }
    ]
  },
  {
    "kind": "enum",
    "name": "contract::health_data::Event",
    "type": "event",
    "variants": [
      {
        "kind": "nested",
        "name": "ConsentAdded",
        "type": "contract::health_data::ConsentAdded"
      },
      {
        "kind": "nested",
        "name": "ConsentRevoked",
        "type": "contract::health_data::ConsentRevoked"
      },
      {
        "kind": "nested",
        "name": "DataAccessed",
        "type": "contract::health_data::DataAccessed"
      },
      {
        "kind": "nested",
        "name": "RewardDeposited",
        "type": "contract::health_data::RewardDeposited"
      },
      {
        "kind": "nested",
        "name": "RewardWithdrawn",
        "type": "contract::health_data::RewardWithdrawn"
      }
    ]
  }
]