# Security Specification for SIMPROKAS KALTIM

## 1. Data Invariants
- **Identity & Roles**:
  - `admin_provinsi`: Prov. Satpol PP / Damkar Prov. Kaltim. Can read all reports, verify/revise reports, and manage incidents.
  - `pimpinan`: Executive view (Governor, Sekda, Kadis). Read-only access to all aggregate data and verified reports.
  - `operator_daerah`: Restricted to their registered `regionId` (one of the 10 Kab/Kota). Can only create, update, or submit reports for their own assigned `regionId`.
- **Report Integrity**:
  - A report's `regionId`, `period`, and `year` cannot be mutated once initialized.
  - An operator cannot edit a report after it has been marked `VERIFIED` by Admin Provinsi (terminal state gate) unless returned to `REVISED`.
  - Only `admin_provinsi` can change `status` to `VERIFIED`.
- **Incident Integrity**:
  - Incidents must include valid coordinates, valid type enum, and valid status enum.

## 2. The Dirty Dozen Payloads & Mitigation Tests
1. **Payload 1: Privilege Escalation on Profile Creation**
   - An untrusted client tries to set `role: "admin_provinsi"`.
   - *Mitigation*: Rule enforces that user documents must be created by an existing admin, or non-admin self-registration defaults strictly to `operator_daerah`.
2. **Payload 2: Cross-Region Report Spoofing**
   - Operator of Kutai Kartanegara attempts to overwrite reports belonging to Samarinda.
   - *Mitigation*: Helper checks `request.auth.uid` user's `regionId == incoming().regionId` or `isAdmin()`.
3. **Payload 3: Tampering with Verified Reports**
   - Operator attempts to edit data after province verification.
   - *Mitigation*: Terminal state lock protects `status == 'VERIFIED'`.
4. **Payload 4: Field Injection / Junk Characters**
   - Injecting 500KB string payloads into `verificationNotes` or `title`.
   - *Mitigation*: String length bounds (`size() <= max`).
5. **Payload 5: Deleting Historical Reports**
   - Non-admin attempting to delete official reports.
   - *Mitigation*: Delete operation strictly reserved for `isAdmin()`.
