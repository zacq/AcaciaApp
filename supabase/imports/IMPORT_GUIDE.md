# AcaciaVeld — Data Import Guide

## Import Order

**Always import in this order** — later tables reference earlier ones:

1. `animal_groups.csv` — no dependencies
2. `contacts.csv` — no dependencies
3. `medicines.csv` — no dependencies
4. `animals_import_template.csv` — no dependencies
5. `animal_registration_details.csv` — references animals
6. `animal_weights.csv` — references animals
7. `treatments.csv` — references animals + medicines
8. `health_events.csv` — references animals
9. `movements.csv` — references animals
10. `weaning_records.csv` — references animals
11. `breeding_records.csv` — references animals
12. `pregnancy_scans.csv` — references animals
13. `lambing_records.csv` — references animals

---

## Tables 1–3: Standalone (Supabase Table Editor)

`animal_groups`, `contacts`, and `medicines` have no foreign key constraints.

1. Open Supabase → Table Editor → select the table
2. Click **Import data** → upload the CSV
3. Map columns → Import

---

## Table 4: Animals (Supabase Table Editor)

Same drag-and-drop import. See field reference below.

**Critical formatting rules:**
- Dates must be `YYYY-MM-DD` (e.g. `2023-03-15`)
- EIDs must be full 15-digit integers — never open in Excel without formatting the `eid` column as **Text** first
- `cull` and `withdrawal_status` must be `true` or `false` (lowercase)

---

## Tables 5–13: Relational Tables (SQL Editor)

These tables use `animal_tag`, `dam_tag`, `sire_tag` as human-readable references in the CSV. Because Supabase stores UUIDs internally, these **cannot be imported via the Table Editor** — use the **SQL Editor** with the pattern below.

### Generic import pattern

```sql
-- Example: animal_weights
-- 1. Create a temp table matching your CSV columns
create temp table tmp_weights (
  animal_tag text,
  weight_kg numeric,
  recorded_at timestamptz,
  age_days integer,
  condition_score numeric,
  notes text
);

-- 2. Copy data from your CSV into the temp table
--    (paste values as INSERT statements, or use psql \copy)

-- 3. Insert into the real table, resolving animal_tag → UUID
insert into public.animal_weights (animal_id, weight_kg, recorded_at, age_days, condition_score, notes)
select a.id, t.weight_kg, t.recorded_at, t.age_days, t.condition_score, t.notes
from tmp_weights t
join public.animals a on a.tag_number = t.animal_tag;
```

The same join pattern applies to all relational tables — just swap `animal_tag` for `dam_tag`/`sire_tag` where needed.

---

## Field Reference

### animals_import_template.csv

#### Required Fields

| Column | Format | Allowed Values | Example |
|--------|--------|----------------|---------|
| `tag_number` | text | Unique per animal | `AV-0001` |
| `breed` | text | Any breed name | `Dorper` |
| `sex` | text | `male` / `female` | `female` |
| `birth_date` | YYYY-MM-DD | — | `2023-03-15` |

#### Identity Fields

| Column | Format | Notes |
|--------|--------|-------|
| `visual_id` | text | Visual ear tag number |
| `eid` | text | RFID/Electronic ID (15-digit integer) |
| `name` | text | Animal name (optional) |
| `pedigree_id` | text | Stud book / registry ID |
| `registration_number` | text | Official registration |
| `scrapie_tag` | text | Scrapie/disease control tag |

#### Classification Fields

| Column | Allowed Values |
|--------|----------------|
| `species` | `sheep` / `goat` / `cattle` |
| `breeding_class` | `Fullblood` / `Purebred` / `Commercial` |
| `born_as` | `single` / `twin` / `triplet` / `quad` |
| `color_markings` | Free text |
| `color_type` | Short label e.g. `Black Head` |
| `breed_percentage` | Number e.g. `87.5` |

#### Date Fields

| Column | Format |
|--------|--------|
| `birth_date` | YYYY-MM-DD (required) |
| `acquisition_date` | YYYY-MM-DD |

#### Parentage Fields

| Column | Notes |
|--------|-------|
| `dam_sire` | Tag/name of dam's sire |
| `sire_sire` | Tag/name of sire's sire |
| `adopted_dam` | Tag/name of adopted dam |
| `breeder_name` | Original breeder name |
| `source_country` | e.g. `South Africa` |
| `import_batch` | e.g. `BATCH-2023-A` |

#### Status Fields

| Column | Allowed Values | Default |
|--------|----------------|---------|
| `status` | `active` / `sold` / `dead` / `culled` / `archived` | `active` |
| `breeding_status` | `open` / `exposed` / `pregnant` / `bred` / `retired` | *(blank)* |
| `health_status` | `healthy` / `under_treatment` / `monitor` / `critical` | `healthy` |
| `cull` | `true` / `false` | `false` |
| `withdrawal_status` | `true` / `false` | `false` |

#### Physical Fields

| Column | Format |
|--------|--------|
| `weight_kg` | Number e.g. `68.5` |
| `body_condition_score` | 1.0 – 5.0 in 0.5 steps |

#### Do NOT include

Auto-generated — skip these columns entirely:
`id`, `created_at`, `updated_at`, `archived_at`, `sire_id`, `dam_id`, `current_group_id`

---

### animal_weights.csv

| Column | Format | Notes |
|--------|--------|-------|
| `animal_tag` | text | Must match `tag_number` in animals |
| `weight_kg` | number | e.g. `68.5` |
| `recorded_at` | YYYY-MM-DD or YYYY-MM-DD HH:MM:SS | Date of weighing |
| `age_days` | integer | Age in days at time of weighing |
| `condition_score` | number | 1.0 – 5.0 |
| `notes` | text | Optional |

---

### treatments.csv

| Column | Format | Notes |
|--------|--------|-------|
| `animal_tag` | text | Must match `tag_number` in animals |
| `medicine_name` | text | Must match `name` in medicines |
| `dosage` | text | e.g. `9.5ml IM` |
| `treatment_date` | YYYY-MM-DD | — |
| `withdrawal_days` | integer | 0 if no withdrawal |
| `withdrawal_end_date` | YYYY-MM-DD | Leave blank if no withdrawal |
| `notes` | text | Optional |

---

### health_events.csv

| Column | Allowed Values | Notes |
|--------|----------------|-------|
| `animal_tag` | text | Must match animals |
| `event_type` | `illness` / `injury` / `vaccination` / `checkup` | — |
| `diagnosis` | text | Free text |
| `severity` | `low` / `medium` / `high` / `critical` | — |
| `event_date` | YYYY-MM-DD | — |
| `resolved_date` | YYYY-MM-DD | Leave blank if unresolved |
| `vet_name` | text | Optional |
| `notes` | text | Optional |

---

### breeding_records.csv

| Column | Allowed Values | Notes |
|--------|----------------|-------|
| `dam_tag` | text | Female animal tag |
| `sire_tag` | text | Male animal tag |
| `mating_date` | YYYY-MM-DD | — |
| `method` | `natural` / `AI` / `ET` | — |
| `expected_birth` | YYYY-MM-DD | Mating date + gestation (sheep ~147 days) |
| `outcome` | `pending` / `confirmed_pregnant` / `not_pregnant` / `aborted` / `lambed` | — |
| `notes` | text | Optional |

---

### pregnancy_scans.csv

| Column | Allowed Values | Notes |
|--------|----------------|-------|
| `animal_tag` | text | Female animal tag |
| `scan_date` | YYYY-MM-DD | — |
| `result` | `empty` / `single` / `twin` / `triplet` / `quad` / `unknown` | — |
| `scanner_name` | text | Vet or technician name |
| `notes` | text | Optional |

---

### lambing_records.csv

| Column | Allowed Values | Notes |
|--------|----------------|-------|
| `dam_tag` | text | Female animal tag |
| `sire_tag` | text | Male animal tag |
| `lambing_date` | YYYY-MM-DD | — |
| `num_born` | integer | Total lambs born |
| `num_alive` | integer | Lambs alive at birth |
| `difficulty` | `easy` / `assisted` / `difficult` / `caesarean` | — |
| `notes` | text | Optional |

---

### movements.csv

| Column | Allowed Values | Notes |
|--------|----------------|-------|
| `animal_tag` | text | Must match animals |
| `movement_type` | `in` / `out` / `transfer` / `sale` / `purchase` / `death` / `cull` | — |
| `from_location` | text | Farm, paddock, or stud name |
| `to_location` | text | Destination |
| `movement_date` | YYYY-MM-DD | — |
| `transport_by` | text | Transport company or farm vehicle |
| `permit_number` | text | Government movement permit number |
| `notes` | text | Optional |

---

### weaning_records.csv

| Column | Format | Notes |
|--------|--------|-------|
| `animal_tag` | text | Lamb being weaned |
| `weaning_date` | YYYY-MM-DD | — |
| `weaning_weight` | number | kg at weaning |
| `dam_tag` | text | Biological or adopted dam |
| `notes` | text | Optional |

---

### animal_registration_details.csv

| Column | Format | Notes |
|--------|--------|-------|
| `animal_tag` | text | Must match animals |
| `registry_name` | text | e.g. `SA Stud Book` |
| `registration_date` | YYYY-MM-DD | — |
| `certificate_number` | text | Certificate number |
| `inspector_name` | text | Inspector who approved |
| `breed_society` | text | e.g. `Dorper Breeders Society of SA` |
| `notes` | text | Optional |

---

### contacts.csv

| Column | Format | Notes |
|--------|--------|-------|
| `name` | text | Full name or organisation |
| `role` | text | `vet` / `buyer` / `supplier` / `transport` / `registry` / `authority` |
| `phone` | text | Include country code |
| `email` | text | — |
| `notes` | text | Optional |

---

### medicines.csv

| Column | Format | Notes |
|--------|--------|-------|
| `name` | text | Product name |
| `active_ingredient` | text | Active compound |
| `category` | text | `Antiparasitic` / `Antibiotic` / `Vaccine` / `Reproductive` / `Supplement` / `Anti-inflammatory` / `Anthelmintic` |
| `unit` | text | `ml` / `L` / `unit` / `g` |
| `withdrawal_days` | integer | 0 if none |
| `stock_quantity` | number | Current stock on hand |
| `reorder_level` | number | Reorder trigger quantity |
| `expiry_date` | YYYY-MM-DD | — |
| `notes` | text | Optional |

---

### animal_groups.csv

| Column | Format | Notes |
|--------|--------|-------|
| `name` | text | Group/camp name |
| `purpose` | text | e.g. `Ewe grazing and lambing` |
| `location` | text | Physical location on farm |
| `notes` | text | Optional |
