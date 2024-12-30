use calimero_sdk::{app, env, types::Error};
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_storage::collections::UnorderedMap;
use serde::{Deserialize, Serialize};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct HealthRecord {
    data: Vec<u8>,         // Encrypted patient data
    timestamp: u64,        // Record creation time
    record_type: String,   // Type of medical record
    owner_id: String,      // Patient ID
    authorized_ids: Vec<String>,  // Authorized healthcare providers
    is_anonymized: bool,          // Flag indicating if the data is anonymized
    consent_proof: Option<Vec<u8>> // Proof of consent for anonymization
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct AccessGrant {
    provider_id: String,   // Healthcare provider ID
    granted_at: u64,      // Timestamp of access grant
    expires_at: u64       // Access expiration time
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct ConsentPolicy {
    patient_id: String,    // Patient ID
    entity_id: String,     // Entity ID
    purpose: String,       // Purpose of consent
    expiration: u64,       // Expiration time
    proof: String     // Proof of consent
}
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Default, Clone)]
pub struct ResearchPool {
    title: String,
    description: String,
    reward_amount: u64,
    entity_id: String,
    created_at: u64,
    status: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct PatientDataResponse {
    data: Vec<u8>,
    record_type: String,
    timestamp: u64
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone, Default)]
pub struct PoolSubmission {
    patient_id: String,
    entity_id: String,
    submitted_at: u64,
    status: String, // "pending", "accepted", "rejected"
}

#[app::event]
pub enum HealthEvent<'a> {
    RecordAdded { patient_id: &'a str },
    AccessGranted { patient_id: &'a str, provider_id: &'a str },
    RecordAccessed { patient_id: &'a str, accessor_id: &'a str },
    ConsentGranted { patient_id: &'a str, entity_id: &'a str },
    PoolCreated { entity_id: &'a str, title: &'a str, reward_amount: u64 },
    RecordDeleted { patient_id: &'a str },
    PoolDeleted { entity_id: &'a str, title: &'a str },
    RecordUpdated { patient_id: &'a str },
    PoolUpdated { entity_id: &'a str, title: &'a str },
    PoolSubmission { patient_id: &'a str, entity_id: &'a str, status: &'a str },
    SubmissionUpdated { patient_id: &'a str, entity_id: &'a str, status: &'a str },
}

#[app::state(emits = for<'a> HealthEvent<'a>)]
#[derive(Default, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
struct HealthDataStore {
    records: UnorderedMap<String, HealthRecord>,
    consent_policies: UnorderedMap<String, ConsentPolicy>,
    research_pools: UnorderedMap<String, ResearchPool>,
    pool_submissions: UnorderedMap<String, UnorderedMap<String, PoolSubmission>>, // entity_id -> (patient_id -> submission)
}

#[allow(dead_code)]
#[app::logic]
impl HealthDataStore {
    #[app::init]
    pub fn init() -> Self {
        Self {
            records: UnorderedMap::new(),
            consent_policies: UnorderedMap::new(),
            research_pools: UnorderedMap::new(),
            pool_submissions: UnorderedMap::new(),
        }
    }

    // Patient Data Management
    pub fn store_patient_data(
        &mut self,
        patient_id: String, 
        encrypted_data: Vec<u8>,
        // data_hash: String,
        record_type: String
    ) -> Result<(), Error> {
        env::log(&format!("Storing data for patient: {}", patient_id));

        let record = HealthRecord {
            data: encrypted_data,                    // Store encrypted patient data
            timestamp: env::time_now(),    // Current timestamp
            record_type: record_type.to_string(),    // Type of medical record
            owner_id: patient_id.clone(),            // Patient identifier
            authorized_ids: Vec::new(),              // Initially empty access list
            is_anonymized: false,                    // Initially not anonymized
            consent_proof: None                      // Initially no consent proof
        };

        self.records.insert(patient_id.clone(), record)?;
        app::emit!(HealthEvent::RecordAdded { patient_id: &patient_id });
        Ok(())
    }

    // Consent Management 
    pub fn add_consent(
        &mut self,
        patient_id: String,
        entity_id: String,
        purpose: String,
        starknet_proof: String
    ) -> Result<(), Error> {
        env::log(&format!("Adding consent for patient {} to entity {}", patient_id, entity_id));

        let consent = ConsentPolicy {
            patient_id: patient_id.clone(),
            entity_id: entity_id.clone(),
            purpose,
            expiration: env::time_now() + 7_776_000, // 90 days
            proof: starknet_proof
        };

        // Update record authorization
        if let Some(mut record) = self.records.get(&patient_id)? {
            record.authorized_ids.push(entity_id.clone());
            self.records.insert(patient_id.clone(), record)?;
        }

        self.consent_policies.insert(format!("{}:{}", patient_id, entity_id), consent)?;
        Ok(())
    }

    // Data Access for Hospitals
    pub fn access_patient_data(
        &self,
        patient_id: &str,
        entity_id: &str
    ) -> Result<Option<Vec<u8>>, Error> {
        env::log(&format!("Accessing data for patient: {} by entity: {}", patient_id, entity_id));

        // Check consent
        let consent_key = format!("{}:{}", patient_id, entity_id);
        if let Some(consent) = self.consent_policies.get(&consent_key)? {
            if consent.expiration < env::time_now() {
                return Ok(None);
            }

            // Return encrypted data if authorized
            if let Some(record) = self.records.get(patient_id)? {
                if record.authorized_ids.contains(&entity_id.to_string()) {
                    app::emit!(HealthEvent::RecordAccessed { 
                        patient_id,
                        accessor_id: entity_id 
                    });
                    return Ok(Some(record.data));
                }
            }
        }
        
        Ok(None)
    }

    // Anonymized Data Access
    pub fn get_anonymized_data(
        &mut self,
        patient_id: &str,
        entity_id: &str,
        anonymization_proof: Vec<u8>
    ) -> Result<Option<Vec<u8>>, Error> {
        env::log(&format!("Accessing anonymized data for research"));

        if let Some(mut record) = self.records.get(patient_id)? {
            // Verify research consent and anonymization proof
            if record.authorized_ids.contains(&entity_id.to_string()) {
                record.is_anonymized = true;
                // Store proof that data was properly anonymized
                record.consent_proof = Some(anonymization_proof);
                self.records.insert(patient_id.to_string(), record.clone())?;
                
                return Ok(Some(record.data));
            }
        }
        
        Ok(None)
    }

    // Revoke Access
    pub fn revoke_access(
        &mut self,
        patient_id: &str,
        entity_id: &str
    ) -> Result<(), Error> {
        if let Some(mut record) = self.records.get(patient_id)? {
            // Get the executor ID (caller) as bytes and compare
            let caller = env::executor_id();
            if record.owner_id != String::from_utf8_lossy(&caller).to_string() {
                return Err(Error::msg("Not authorized"));
            }
    
            record.authorized_ids.retain(|id| id != entity_id);
            self.records.insert(patient_id.to_string(), record)?;
            self.consent_policies.remove(&format!("{}:{}", patient_id, entity_id))?;
        }
        
        Ok(())
    }

    pub fn get_patient_data(
        &self,
        patient_id: &str,
        entity_id: &str
    ) -> Result<Option<PatientDataResponse>, Error> {
        env::log(&format!("Attempting to access data for patient: {}", patient_id));
        
        if let Some(record) = self.records.get(patient_id)? {
            if record.owner_id == entity_id || record.authorized_ids.contains(&entity_id.to_string()) {
                env::log(&format!("Access granted for entity: {} to patient data: {}", entity_id, patient_id));
                env::log(&format!("Record type: {}", record.record_type));
                env::log(&format!("Timestamp: {}", record.timestamp));
                
                app::emit!(HealthEvent::RecordAccessed{ 
                    patient_id,
                    accessor_id: entity_id 
                });
    
                return Ok(Some(PatientDataResponse {
                    data: record.data,
                    record_type: record.record_type,
                    timestamp: record.timestamp
                }));
            }
            env::log(&format!("Access denied for entity: {} to patient data: {}", entity_id, patient_id));
        } else {
            env::log(&format!("No record found for patient: {}", patient_id));
        }
        Ok(None)
    }

    pub fn grant_access(
        &mut self,
        patient_id: String,
        entity_id: String
    ) -> Result<(), Error> {
        if let Some(mut record) = self.records.get(&patient_id)? {
            let caller = env::executor_id();
            if record.owner_id != String::from_utf8_lossy(&caller).to_string() {
                return Err(Error::msg("Not authorized"));
            }
            
            record.authorized_ids.push(entity_id.clone());
            self.records.insert(patient_id.clone(), record)?;
            
            app::emit!(HealthEvent::ConsentGranted { 
                patient_id: &patient_id,
                entity_id: &entity_id 
            });
        }
        Ok(())
    }

    pub fn create_research_pool(
        &mut self,
        entity_id: String,
        title: String,
        description: String,
        reward_amount: u64,
    ) -> Result<(), Error> {
        env::log(&format!("Creating research pool: {} by entity: {}", title, entity_id));

        let pool = ResearchPool {
            title: title.clone(),
            description,
            reward_amount,
            entity_id: entity_id.clone(),
            created_at: env::time_now(),
            status: "active".to_string(),
        };

        self.research_pools.insert(entity_id.clone(), pool)?;

        app::emit!(HealthEvent::PoolCreated { 
            entity_id: &entity_id,
            title: &title,
            reward_amount
        });

        Ok(())
    }

    pub fn get_research_pool(
        &self,
        entity_id: &str
    ) -> Result<Option<ResearchPool>, Error> {
        self.research_pools.get(entity_id).map_err(Error::from)
    }
    pub fn list_research_pools(&self) -> Result<Vec<ResearchPool>, Error> {
        env::log("Listing all research pools");
        
        let mut pools = Vec::new();
        
        // Iterate through all pools and collect active ones
        for (_, pool) in self.research_pools.entries()? {
            if pool.status == "active" {
                pools.push(pool);
            }
        }
        
        // Sort by created_at descending (newest first)
        pools.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        env::log(&format!("Found {} active research pools", pools.len()));
        Ok(pools)
    }

    pub fn list_authorized_reports(
        &self,
        entity_id: &str
    ) -> Result<Vec<PatientDataResponse>, Error> {
        env::log(&format!("Listing authorized reports for entity: {}", entity_id));
        
        let mut authorized_reports = Vec::new();
        
        // Iterate through all records and check authorization
        for (_, record) in self.records.entries()? {                
            // Check if entity is authorized for this record
            if record.authorized_ids.contains(&entity_id.to_string()) {
                authorized_reports.push(PatientDataResponse {
                    data: record.data.clone(),
                    record_type: record.record_type.clone(),
                    timestamp: record.timestamp
                });
            }
        }
        
        env::log(&format!("Found {} authorized reports", authorized_reports.len()));
        Ok(authorized_reports)
    }

    // Delete patient data
    pub fn delete_patient_data(&mut self, patient_id: &str) -> Result<(), Error> {
        env::log(&format!("Deleting data for patient: {}", patient_id));
        
        // Get the executor ID (caller)
        let caller = env::executor_id();
        
        if let Some(record) = self.records.get(patient_id)? {
            // Verify ownership
            if record.owner_id != String::from_utf8_lossy(&caller).to_string() {
                return Err(Error::msg("Not authorized to delete this record"));
            }
            
            // Remove record
            self.records.remove(patient_id)?;
            
            // Remove associated consent policies
            let keys_to_remove: Vec<String> = self.consent_policies.entries()?
                .filter_map(|(key, _)| {
                    if key.starts_with(&format!("{}:", patient_id)) {
                        Some(key)
                    } else {
                        None
                    }
                })
                .collect();
            
            for key in keys_to_remove {
                self.consent_policies.remove(&key)?;
            }
            
            app::emit!(HealthEvent::RecordDeleted { patient_id });
            Ok(())
        } else {
            Err(Error::msg("Record not found"))
        }
    }

    // Delete research pool
    pub fn delete_research_pool(&mut self, entity_id: &str) -> Result<(), Error> {
        env::log(&format!("Deleting research pool for entity: {}", entity_id));
        
        let caller = env::executor_id();
        
        if let Some(pool) = self.research_pools.get(entity_id)? {
            // Verify ownership
            if pool.entity_id != String::from_utf8_lossy(&caller).to_string() {
                return Err(Error::msg("Not authorized to delete this pool"));
            }
            
            self.research_pools.remove(entity_id)?;
            
            app::emit!(HealthEvent::PoolDeleted { 
                entity_id,
                title: &pool.title 
            });
            Ok(())
        } else {
            Err(Error::msg("Pool not found"))
        }
    }

    // Update patient data
    pub fn update_patient_data(
        &mut self,
        patient_id: &str,
        new_data: Vec<u8>,
        record_type: String
    ) -> Result<(), Error> {
        env::log(&format!("Updating data for patient: {}", patient_id));
        
        let caller = env::executor_id();
        
        if let Some(mut record) = self.records.get(patient_id)? {
            // Verify ownership
            if record.owner_id != String::from_utf8_lossy(&caller).to_string() {
                return Err(Error::msg("Not authorized to update this record"));
            }
            
            // Update record
            record.data = new_data;
            record.record_type = record_type;
            record.timestamp = env::time_now();
            
            self.records.insert(patient_id.to_string(), record)?;
            
            app::emit!(HealthEvent::RecordUpdated { patient_id });
            Ok(())
        } else {
            Err(Error::msg("Record not found"))
        }
    }

    // Update research pool
    pub fn update_research_pool(
        &mut self,
        entity_id: &str,
        title: Option<String>,
        description: Option<String>,
        reward_amount: Option<u64>,
        status: Option<String>
    ) -> Result<(), Error> {
        env::log(&format!("Updating research pool for entity: {}", entity_id));
        
        let caller = env::executor_id();
        
        if let Some(mut pool) = self.research_pools.get(entity_id)? {
            // Verify ownership
            if pool.entity_id != String::from_utf8_lossy(&caller).to_string() {
                return Err(Error::msg("Not authorized to update this pool"));
            }
            
            // Update fields if provided
            if let Some(t) = title { pool.title = t; }
            if let Some(d) = description { pool.description = d; }
            if let Some(r) = reward_amount { pool.reward_amount = r; }
            if let Some(s) = status { pool.status = s; }
            
            self.research_pools.insert(entity_id.to_string(), pool.clone())?;
            
            app::emit!(HealthEvent::PoolUpdated { 
                entity_id,
                title: &pool.title 
            });
            Ok(())
        } else {
            Err(Error::msg("Pool not found"))
        }
    }

    pub fn submit_to_pool(
        &mut self,
        entity_id: &str,
    ) -> Result<(), Error> {
        let patient_id = hex::encode(env::executor_id());
        
        let submission = PoolSubmission {
            patient_id: patient_id.clone(),
            entity_id: entity_id.to_string(),
            submitted_at: env::time_now(),
            status: "pending".to_string(),

        };

        // Get or create submissions map for this entity
        let mut entity_submissions = self.pool_submissions
            .get(entity_id)?
            .unwrap_or_else(|| UnorderedMap::new());
        
        // Add submission
        entity_submissions.insert(patient_id.clone(), submission)?;
        self.pool_submissions.insert(entity_id.to_string(), entity_submissions)?;

        app::emit!(HealthEvent::PoolSubmission {
            patient_id: &patient_id,
            entity_id,
            status: "pending"
        });

        Ok(())
    }

    pub fn update_submission_status(
        &mut self,
        entity_id: &str,
        patient_id: &str,
        status: String,
    ) -> Result<(), Error> {
        // Verify caller is pool owner
        let pool = self.research_pools.get(entity_id)?
            .ok_or_else(|| Error::msg("Pool not found"))?;
        
        if pool.entity_id != String::from_utf8_lossy(&env::executor_id()).to_string() {
            return Err(Error::msg("Not authorized"));
        }

        // Get entity submissions
        let mut entity_submissions = self.pool_submissions
            .get(entity_id)?
            .ok_or_else(|| Error::msg("No submissions found"))?;

        // Update submission status
        if let Some(mut submission) = entity_submissions.get(patient_id)? {
            submission.status = status.clone();
            entity_submissions.insert(patient_id.to_string(), submission)?;
            self.pool_submissions.insert(entity_id.to_string(), entity_submissions)?;

            app::emit!(HealthEvent::SubmissionUpdated {
                patient_id,
                entity_id,
                status: &status
            });
            
            Ok(())
        } else {
            Err(Error::msg("Submission not found"))
        }
    }
}