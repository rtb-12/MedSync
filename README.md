# MedSync 🩺  
MedSync is a **decentralized healthcare data management platform** designed to address the critical challenges of consent management, data access transparency, and incentivized data sharing. Built on **Starknet** and **Calimero**, MedSync seamlessly combines scalability, privacy, and security for healthcare data management in a hybrid blockchain architecture.

---

## 🚀 **Hackathon Approach**

### **Problem Statement**  
Healthcare data management faces challenges such as lack of transparency, unauthorized access, inefficient consent systems, and lack of patient incentives. Existing systems fail to offer:  
- **Granular Consent Management:** Patients need control over who accesses their data and why.  
- **Access Audits:** Logging data requests for auditing is rarely transparent.  
- **Privacy & Compliance:** Sensitive data is often exposed or vulnerable.  
- **Incentives for Participation:** Patients and entities lack motivation to engage ethically in data-sharing ecosystems.

### **Proposed Solution: MedSync**  
MedSync leverages **blockchain technology** to create a privacy-first, scalable, and incentive-driven solution. By integrating **Starknet** (public blockchain) and **Calimero** (private permissioned nodes), MedSync enables:  
- Transparent and secure consent management.  
- Immutable and auditable access logs.  
- A token-based reward system incentivizing data sharing.  
- Privacy-preserving operations for sensitive data.

---

## ✨ **Features**

### **1. Consent Management**  
- **Add Consent:** Patients define entities, purposes, and expiration for data-sharing permissions.  
- **Verify Consent:** Entities dynamically validate patient consent proofs before accessing data.  
- **Revoke Consent:** Patients can revoke permissions at any time, ensuring total control over their data.  

### **2. Data Access Logging**  
- **Log Requests:** Tracks all data access activities, ensuring transparency.  
- **Retrieve Logs:** Provides audit trails for patients to review access history.  

### **3. Reward Pool**  
- **Deposit Rewards:** Entities contribute to the reward pool, incentivizing data-sharing compliance.  
- **Track Rewards:** Monitor accumulated rewards for entities within the ecosystem.  
- **Withdraw Tokens:** Entities redeem rewards using ERC-20 tokens tied to real-world value.  

### **4. Privacy and Compliance**  
- Operations on **Calimero nodes** ensure sensitive data is processed privately, maintaining GDPR/HIPAA compliance.  

### **5. Event-Driven Transparency**  
- Real-time events for actions like consent updates, data requests, and reward transactions ensure transparency across stakeholders.  

---

## 🏗️ **App Architecture**

### **Hybrid Blockchain Design**  
MedSync integrates the strengths of **Starknet** and **Calimero** for a hybrid blockchain approach:  
- **Public Blockchain:** Starknet ensures scalability, transparency, and low-cost transactions.  
- **Private Blockchain:** Calimero nodes process sensitive healthcare data in a secure and controlled environment.  

---

### **Portals for Stakeholders**  
MedSync offers tailored portals for different stakeholders, ensuring seamless interaction with the platform:  
1. **Patient Portal:**  
   - Manage consent for data sharing.  
   - View access logs and revoke permissions.  
   - Monitor contributions to the reward pool.  

2. **Researcher Portal:**  
   - Request access to patient data based on consent.  
   - Track and withdraw rewards from the pool.  
   - View compliance metrics for data usage.  

3. **Hospital Portal:**  
   - Upload patient data securely to the Calimero network.  
   - Ensure regulatory compliance with logged activities.  
   - Contribute to and manage rewards for ethical participation.  

---

### **How Starknet is Used**  
1. **Scalable Data Handling:** Efficiently processes consent additions, reward updates, and log entries with minimal gas costs.  
2. **Immutable Audit Trails:** Events like `ConsentAdded` and `RewardDeposited` are immutably stored on-chain.  
3. **Zero-Knowledge Proofs:** zk-STARKs enable cryptographic validation of transactions, ensuring security and trust.  
4. **Cost Efficiency:** Reduces transaction fees while maintaining Ethereum-grade security.  

---

### **How Calimero is Used**  
1. **Sensitive Data Operations:** Processes and stores sensitive patient information in a private, permissioned environment.  
2. **Regulatory Compliance:** Ensures compliance with data protection regulations like GDPR and HIPAA by controlling data exposure.  
3. **Interoperability:** Bridges private blockchain operations with Starknet, allowing verifiable proofs to be shared on the public blockchain.  
4. **Data Privacy:** Protects patient data while enabling verifiable actions through proofs.  

---

## 🌟 **Why MedSync?**

MedSync offers the perfect blend of blockchain capabilities to address healthcare data management challenges:  
- **Privacy-Preserving:** Patient data remains secure in Calimero while using Starknet for verification.  
- **Transparent Operations:** Immutable event logs ensure trust and accountability.  
- **Scalability:** Starknet's Layer 2 solution handles high transaction volumes with ease.  
- **Incentivization:** Reward pool mechanisms foster ethical participation.  
- **Regulatory Compliance:** Meets global data privacy standards through private node processing.  

---

## 🔄 **App Flow**  
![Untitled-2024-12-15-1727](docs/Untitled-2024-12-15-1727.png)
---
### **Step 1:** Consent Management  
1. Patients use the frontend to add, modify, or revoke consent for specific entities and purposes.  
2. Consent data is stored securely in Calimero, with verifiable proofs shared on Starknet.  

### **Step 2:** Data Access Request  
1. Entities query the consent status on Starknet before accessing patient data.  
2. Access logs are recorded in Starknet for transparency.  

### **Step 3:** Reward Distribution  
1. Entities deposit tokens into the reward pool as incentives for compliant data use.  
2. Tokens can be withdrawn by entities based on system-defined policies.  

### **Step 4:** Audit Trail  
1. Patients view data access logs and rewards via the frontend.  
2. Immutable logs provide transparency and trust.  

---

## 🖥️ **Frontend Requirements**

### **Key Pages**  
1. **User Dashboard:**  
   - Patient consent management and log history.  
   - Researcher and hospital reward pool contributions and withdrawals.  

2. **Consent Manager:**  
   - Interface for adding, updating, or revoking consents.  

3. **Data Logs Viewer:**  
   - Patients can view detailed access logs for auditing.  

4. **Reward Pool Manager:**  
   - Interface for researchers and hospitals to deposit and withdraw rewards.  

---

## 🔧 **Tech Stack**

- **Backend:** Starknet smart contracts (Cairo), Calimero nodes.  
- **Frontend:** React.js, Ethers.js for wallet interactions, and API integrations for Calimero.  
- **Token Support:** ERC-20 tokens for reward mechanisms.  

---
## 📥 **Installation**
See [INSTALL.md](docs/INSTALL.md) for detailed setup instructions.


## 📈 **Future Scope**

- Integration of machine learning for predictive analytics on anonymized data.  
- Expansion to other industries requiring secure data management.  
- Implementation of advanced ZK-proofs for broader privacy applications.

---

## 🌐 **Conclusion**  
MedSync empowers patients with control over their data while fostering trust and compliance in healthcare data sharing. With tailored portals for **patients, researchers, and hospitals**, and a robust hybrid blockchain architecture, MedSync paves the way for a secure, scalable, and incentive-driven future in decentralized healthcare. 🚀