# Coffee Supply Chain - Requirements Document

## Functional Requirements

### 1. Role Management
- **FR1.1**: System shall support four roles: Farmer, Processor, Inspector, and Consumer
- **FR1.2**: Admin shall be able to assign and modify roles for users
- **FR1.3**: System shall enforce role-based access control for all operations
- **FR1.4**: Each role shall have specific permissions and operations they can perform

### 2. Batch Management
- **FR2.1**: Farmers shall be able to create new coffee batches with origin, weight (kg), and price
- **FR2.2**: System shall assign unique batch IDs sequentially starting from 1
- **FR2.3**: System shall track batch metadata including creation and last update timestamps
- **FR2.4**: Users shall be able to retrieve complete details of any batch
- **FR2.5**: Users shall be able to retrieve all batches owned by a specific address

### 3. Batch Lifecycle & Status Transitions
- **FR3.1**: Batches shall progress through the following status states: Harvested → Processing → Inspected → ForSale → Sold
- **FR3.2**: Status transitions shall only occur in the defined order (no backward transitions)
- **FR3.3**: Processors shall move batches from Harvested to Processing status
- **FR3.4**: Inspectors shall move batches from Processing to Inspected status after quality verification
- **FR3.5**: Processors shall list inspected batches for sale (Inspected → ForSale)
- **FR3.6**: Consumers shall purchase batches and transition them to Sold status

### 4. Ownership & Custody
- **FR4.1**: Batches shall have a creator (farmer) who initiates the supply chain
- **FR4.2**: System shall track current owner of each batch
- **FR4.3**: Ownership shall transfer when processors take custody of batches
- **FR4.4**: Ownership shall transfer to consumers upon purchase
- **FR4.5**: System shall emit events when ownership changes

### 5. Quality Inspection
- **FR5.1**: Inspectors shall be able to approve batches after processing
- **FR5.2**: Batches can only be listed for sale after passing inspection
- **FR5.3**: Batches shall track which inspector validated them

### 6. Purchase & Payment
- **FR6.1**: Consumers shall be able to purchase batches in ForSale status by sending exact payment amount
- **FR6.2**: System shall verify payment amount matches batch price exactly
- **FR6.3**: System shall prevent double purchases of the same batch
- **FR6.4**: System shall transfer payment to the processor (current owner) upon successful purchase
- **FR6.5**: System shall update batch status to Sold after successful payment

### 7. Traceability
- **FR7.1**: System shall track the complete supply chain path for each batch (farmer → processor → inspector → consumer)
- **FR7.2**: System shall record timestamps for all batch state changes
- **FR7.3**: System shall emit events for all critical operations (batch creation, status updates, ownership transfers, payments)
- **FR7.4**: All historical data shall be immutable and retrievable on-chain

### 8. Data Validation
- **FR8.1**: System shall validate batch origin is not empty
- **FR8.2**: System shall validate batch weight is a positive value
- **FR8.3**: System shall validate batch price is a positive value
- **FR8.4**: System shall validate that batch IDs exist before processing
- **FR8.5**: System shall reject operations from invalid addresses (zero address)

---

## Non-Functional Requirements

### 1. Security & Access Control
- **NFR1.1**: All functions shall enforce role-based authorization before execution
- **NFR1.2**: Only admin shall be able to assign roles
- **NFR1.3**: Contract shall be protected against reentrancy attacks in payment transfers
- **NFR1.4**: Batch ownership shall only transfer under specific authorized conditions
- **NFR1.5**: Contract code shall follow OpenZeppelin standards and best practices

### 2. Performance & Scalability
- **NFR2.1**: Batch creation and status updates shall complete in a single transaction
- **NFR2.2**: Getting batch details shall be a read-only operation with no state modifications
- **NFR2.3**: getBatchesByOwner function shall scale efficiently without significant gas increases for reasonable batch counts
- **NFR2.4**: Contract shall store data efficiently using appropriate data types

### 3. Reliability & Data Integrity
- **NFR3.1**: All state changes shall be atomic and consistent
- **NFR3.2**: Contract shall prevent invalid state transitions
- **NFR3.3**: Batch payment transfers shall be verified and confirmed before status update
- **NFR3.4**: Contract shall maintain data consistency across all operations

### 4. Immutability & Auditability
- **NFR4.1**: Historical batch data shall be immutable once recorded on-chain
- **NFR4.2**: All critical events shall be logged and available for audit
- **NFR4.3**: Blockchain timestamps shall provide chronological proof of actions
- **NFR4.4**: Contract events shall provide sufficient detail for full traceability reconstruction

### 5. Compliance & Standards
- **NFR5.1**: Contract shall use Solidity ^0.8.20 or compatible versions
- **NFR5.2**: Contract shall be licensed under MIT license
- **NFR5.3**: Contract shall follow Ethereum naming conventions and standards
- **NFR5.4**: Contract shall use safe practices for external calls and payment handling

### 6. Maintainability & Code Quality
- **NFR6.1**: Code shall include clear comments and section separators
- **NFR6.2**: Functions shall have single responsibility
- **NFR6.3**: Code shall use meaningful variable and function names
- **NFR6.4**: Contract shall include comprehensive event emissions for off-chain monitoring

### 7. Availability
- **NFR7.1**: Smart contract shall remain deployed and callable on the Ethereum blockchain indefinitely
- **NFR7.2**: All view functions shall have no external dependencies and always be callable
- **NFR7.3**: Contract shall not have pause/unpause mechanisms that could restrict access

### 8. Gas Efficiency
- **NFR8.1**: Transactions shall minimize gas consumption through efficient data structures
- **NFR8.2**: Batch storage shall use appropriate types to minimize storage costs
- **NFR8.3**: Loop operations shall not exceed practical gas limits for common use cases
- **NFR8.4**: Read-only operations shall use view/pure functions without state modifications

### 9. Transparency & Openness
- **NFR9.1**: All state variables shall be accessible publicly where appropriate
- **NFR9.2**: Batch details shall be queryable by any participant
- **NFR9.3**: Contract shall maintain public mapping of user roles
- **NFR9.4**: Event logs shall provide transparent audit trail

---

## Supplementary Requirements

### Assumptions
- Addresses are correctly managed by Ethereum infrastructure
- Payment amounts are sent in Wei
- Role assignments are correct and trusted
- Users understand their assigned roles and responsibilities

### Constraints
- Contract operates on Ethereum Virtual Machine (EVM)
- Solidity 0.8.20+ limitations and features apply
- Gas limits may restrict batch query operations for very large datasets
- No built-in mechanisms for role revocation (admin must reassign)

### Future Enhancements (Out of Scope)
- Advanced quality metrics and testing data storage
- Batch splitting or merging
- Role revocation or role hierarchy
- Batch price updates after creation
- Dispute resolution mechanisms
- Integration with oracle services for external data
