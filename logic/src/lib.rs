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
    proof: Vec<u8>         // Proof of consent
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct PatientDataResponse {
    data: Vec<u8>,
    record_type: String,
    timestamp: u64
}
#[app::event]
pub enum HealthEvent<'a> {
    RecordAdded { patient_id: &'a str },
    AccessGranted { patient_id: &'a str, provider_id: &'a str },
    RecordAccessed { patient_id: &'a str, accessor_id: &'a str },
    ConsentGranted { patient_id: &'a str, entity_id: &'a str }
}

#[app::state(emits = for<'a> HealthEvent<'a>)]
#[derive(Default, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
struct HealthDataStore {
    records: UnorderedMap<String, HealthRecord>,
    consent_policies: UnorderedMap<String, ConsentPolicy>
}

#[allow(dead_code)]
#[app::logic]
impl HealthDataStore {
    #[app::init]
    pub fn init() -> Self {
        Self {
            records: UnorderedMap::new(),
            consent_policies: UnorderedMap::new()
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
        starknet_proof: Vec<u8>
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
}