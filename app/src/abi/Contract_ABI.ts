export const ABI = [
  {
    "type": "impl",
    "name": "Ownable",
    "interface_name": "contract::IOwnable"
  },
  {
    "type": "struct",
    "name": "contract::Person",
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
    "type": "interface",
    "name": "contract::IOwnable",
    "items": [
      {
        "type": "function",
        "name": "transfer_ownership",
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
        "type": "function",
        "name": "get_owner",
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
    "type": "impl",
    "name": "ConsentManagement",
    "interface_name": "contract::IConsentManagement"
  },
  {
    "type": "enum",
    "name": "contract::Expiration",
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
    "type": "enum",
    "name": "core::bool",
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
    "type": "interface",
    "name": "contract::IConsentManagement",
    "items": [
      {
        "type": "function",
        "name": "add_consent_proof",
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
        "type": "function",
        "name": "verify_consent_proof",
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
            "name": "timestamp",
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
        "type": "function",
        "name": "revoke_consent",
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
    "type": "impl",
    "name": "RewardPool",
    "interface_name": "contract::IRewardPool"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
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
    "type": "interface",
    "name": "contract::IRewardPool",
    "items": [
      {
        "type": "function",
        "name": "deposit_reward",
        "inputs": [
          {
            "name": "entity_id",
            "type": "core::felt252"
          },
          {
            "name": "eth_amount",
            "type": "core::integer::u256"
          },
          {
            "name": "expiry",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "withdraw_reward",
        "inputs": [
          {
            "name": "entity_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "add_participant",
        "inputs": [
          {
            "name": "entity_id",
            "type": "core::felt252"
          },
          {
            "name": "participant",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "DataAccessLogging",
    "interface_name": "contract::IDataAccessLogging"
  },
  {
    "type": "struct",
    "name": "contract::DataRequestLog",
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
    "type": "enum",
    "name": "core::option::Option::<contract::DataRequestLog>",
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
    "type": "interface",
    "name": "contract::IDataAccessLogging",
    "items": [
      {
        "type": "function",
        "name": "log_data_request",
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
        "type": "function",
        "name": "fetch_data_request_log",
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
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "initial_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::ConsentAdded",
    "kind": "struct",
    "members": [
      {
        "name": "patient_id",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "entity_id",
        "type": "core::felt252",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::ConsentRevoked",
    "kind": "struct",
    "members": [
      {
        "name": "patient_id",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "entity_id",
        "type": "core::felt252",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::DataAccessed",
    "kind": "struct",
    "members": [
      {
        "name": "patient_id",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "entity_id",
        "type": "core::felt252",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::RewardDeposited",
    "kind": "struct",
    "members": [
      {
        "name": "entity_id",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "expiry",
        "type": "core::integer::u64",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::RewardWithdrawn",
    "kind": "struct",
    "members": [
      {
        "name": "entity_id",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "amount",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::ParticipantAdded",
    "kind": "struct",
    "members": [
      {
        "name": "entity_id",
        "type": "core::felt252",
        "kind": "data"
      },
      {
        "name": "participant",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "data"
      },
      {
        "name": "total_participants",
        "type": "core::integer::u32",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "contract::health_data::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "ConsentAdded",
        "type": "contract::health_data::ConsentAdded",
        "kind": "nested"
      },
      {
        "name": "ConsentRevoked",
        "type": "contract::health_data::ConsentRevoked",
        "kind": "nested"
      },
      {
        "name": "DataAccessed",
        "type": "contract::health_data::DataAccessed",
        "kind": "nested"
      },
      {
        "name": "RewardDeposited",
        "type": "contract::health_data::RewardDeposited",
        "kind": "nested"
      },
      {
        "name": "RewardWithdrawn",
        "type": "contract::health_data::RewardWithdrawn",
        "kind": "nested"
      },
      {
        "name": "ParticipantAdded",
        "type": "contract::health_data::ParticipantAdded",
        "kind": "nested"
      }
    ]
  }
]