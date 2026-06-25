/**
 * PawSense — Seed Script
 *
 * Run with:
 *   cd apps/api
 *   npx prisma db seed
 *
 * Or directly:
 *   npx tsx prisma/seed.ts
 */

import 'dotenv/config'
import { createRequire } from 'module'
import { PrismaPg } from '@prisma/adapter-pg'

const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────────────────────────────────────
// SYMPTOMS
// ─────────────────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  // Systemic
  {
    name: 'Fever',
    description: 'Elevated rectal temperature above normal range (>39.2 °C / 102.5 °F in cats and dogs). Indicates infection, inflammation, or immune activation.',
    affectedBodyAreas: ['Systemic'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Sustained fever >40 °C requires urgent evaluation. Measure rectally for accuracy.',
  },
  {
    name: 'Lethargy',
    description: 'Marked decrease in energy, activity, and responsiveness. The animal appears unusually tired or disinterested in its surroundings.',
    affectedBodyAreas: ['Systemic', 'Neurological'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Distinguish from normal rest. Persistent lethargy >24 h warrants clinical investigation.',
  },
  {
    name: 'Weight Loss',
    description: 'Progressive unintentional reduction in body weight. Loss >10% of body weight over weeks is clinically significant.',
    affectedBodyAreas: ['Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Track Body Condition Score (BCS) at each visit. Assess muscle mass via Muscle Condition Score separately.',
  },
  {
    name: 'Loss of Appetite (Anorexia)',
    description: 'Reduced or complete cessation of food intake. May be partial (hyporexia) or total (anorexia). A common non-specific sign of many illnesses.',
    affectedBodyAreas: ['Systemic', 'Digestive'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Total anorexia in cats >24–48 h risks hepatic lipidosis. Monitor hydration alongside food intake.',
  },
  {
    name: 'Dehydration',
    description: 'Insufficient body fluid levels. Assessed by skin turgor test, dry mucous membranes, and sunken eyes. Classified mild (<5%), moderate (5–8%), or severe (>8%).',
    affectedBodyAreas: ['Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'PCV/TP help quantify severity. Severe dehydration (>10%) requires IV fluid resuscitation.',
  },
  {
    name: 'Pale Mucous Membranes',
    description: 'Gums, conjunctiva, or inner pinna appear white, grey, or washed-out pink instead of healthy salmon-pink. Indicates reduced peripheral perfusion or anaemia.',
    affectedBodyAreas: ['Cardiovascular', 'Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Check capillary refill time (CRT) alongside mucous membrane colour. Pale MMs with prolonged CRT suggest shock.',
  },
  {
    name: 'Jaundice (Icterus)',
    description: 'Yellow discolouration of the sclera, mucous membranes, and skin due to elevated bilirubin. Arises from pre-hepatic (haemolysis), hepatic, or post-hepatic (biliary obstruction) causes.',
    affectedBodyAreas: ['Systemic', 'Digestive', 'Ocular'],
    commonality: 'RARE' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Most visible in sclera and non-pigmented gums. Differentiate cause with bile acids, urinalysis, and imaging.',
  },
  {
    name: 'Lymphadenopathy',
    description: 'Enlargement of one or more lymph nodes beyond normal size. Can be localised (regional infection/inflammation) or generalised (systemic disease, neoplasia).',
    affectedBodyAreas: ['Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'FNA cytology is first-line diagnostic. Firm, fixed, or ulcerated nodes raise concern for neoplasia.',
  },

  // Digestive
  {
    name: 'Vomiting',
    description: 'Active expulsion of gastric or intestinal contents through the mouth. Distinguish from regurgitation (passive, no abdominal effort). Frequency, content, and timing relative to meals are diagnostically important.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Haematemesis (blood in vomit) or projectile vomiting warrant urgent assessment. Check for foreign body ingestion.',
  },
  {
    name: 'Diarrhoea',
    description: 'Increased frequency, fluidity, or volume of faecal output. Small-bowel diarrhoea involves large volumes with weight loss; large-bowel diarrhoea is frequent and small with mucus or straining.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Haemorrhagic diarrhoea requires prompt evaluation. Record colour, consistency, frequency, and blood/mucus presence.',
  },
  {
    name: 'Abdominal Pain',
    description: 'Signs of discomfort localised to the abdomen: hunched posture, guarding on palpation, reluctance to jump, or prayer position. Ranges from mild to severe (peritonitis).',
    affectedBodyAreas: ['Digestive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Severe pain with a tense or rigid abdomen is a surgical emergency. Pancreatitis classically presents with cranial abdominal pain.',
  },
  {
    name: 'Abdominal Distension',
    description: 'Visually or palpably enlarged abdomen. Causes include fluid (ascites, haemoabdomen), organ enlargement, gas (GDV), or fat accumulation.',
    affectedBodyAreas: ['Digestive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'GDV (gastric dilatation-volvulus) in dogs is a life-threatening emergency. Ascites warrants abdominocentesis and fluid analysis.',
  },
  {
    name: 'Increased Thirst (Polydipsia)',
    description: 'Abnormally elevated water consumption, typically >100 mL/kg/day in cats or >90 mL/kg/day in dogs. Often paired with polyuria (PU/PD).',
    affectedBodyAreas: ['Systemic', 'Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Broad differential: diabetes mellitus, CKD, hyperthyroidism, pyometra, hypercalcaemia, hepatic disease.',
  },

  // Respiratory
  {
    name: 'Coughing',
    description: 'Forceful expulsion of air from the lungs. Can be productive (moist) or non-productive (dry/hacking). Cardiac versus respiratory origin must be differentiated.',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Night-time coughing is more common with cardiac disease. Goose-honk cough suggests tracheal collapse in small breeds.',
  },
  {
    name: 'Sneezing',
    description: 'Sudden forceful expulsion of air through the nasal passages. Frequent sneezing may indicate upper respiratory infection, foreign body, polyps, or nasal neoplasia.',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Reverse sneezing (paroxysmal nasopharyngeal inspiration) is common and usually benign in dogs. Unilateral epistaxis alongside sneezing raises concern for nasal mass.',
  },
  {
    name: 'Nasal Discharge',
    description: 'Discharge from one or both nostrils. Character ranges from clear/serous to mucopurulent or bloody. Unilateral discharge is more likely a local lesion.',
    affectedBodyAreas: ['Respiratory'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Bilateral discharge suggests systemic or infectious cause. Bloody discharge warrants coagulopathy and imaging workup.',
  },
  {
    name: 'Dyspnoea (Difficulty Breathing)',
    description: 'Laboured or distressed breathing evidenced by open-mouth breathing, extended neck, abducted elbows, paradoxical chest movement, or cyanosis. A medical emergency.',
    affectedBodyAreas: ['Respiratory', 'Cardiovascular'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Minimise stress during initial assessment — cats in respiratory distress are at risk of sudden death. Provide oxygen supplementation as the first priority.',
  },
  {
    name: 'Ocular Discharge',
    description: 'Secretions from one or both eyes. Clear/watery (epiphora) may indicate early infection or obstruction. Mucopurulent discharge suggests bacterial involvement.',
    affectedBodyAreas: ['Ocular'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'FHV-1 causes recurrent conjunctivitis in cats. Unilateral discharge warrants careful ophthalmoscopy.',
  },

  // Urinary
  {
    name: 'Increased Urination (Polyuria)',
    description: 'Production of abnormally large volumes of dilute urine. Commonly paired with polydipsia. Assessed by urine specific gravity (USG).',
    affectedBodyAreas: ['Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'USG <1.030 in cats or <1.025 in dogs with clinical signs warrants investigation for CKD, diabetes, or endocrine disease.',
  },
  {
    name: 'Straining to Urinate (Dysuria)',
    description: 'Visible effort when attempting to urinate with small or absent urine production. Indicates lower urinary tract inflammation, urolithiasis, or urethral obstruction.',
    affectedBodyAreas: ['Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'A male cat straining with no urine output is a urethral obstruction emergency. Death can occur within 24–48 h without relief.',
  },
  {
    name: 'Haematuria (Blood in Urine)',
    description: 'Presence of red blood cells in urine, producing pink, red, or brown discolouration. Can be gross (visible) or microscopic.',
    affectedBodyAreas: ['Urinary'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Distinguish from pigmenturia (haemoglobin or myoglobin) via urine sediment. Recurrent haematuria in older cats warrants cytology for transitional cell carcinoma.',
  },

  // Dermatological
  {
    name: 'Pruritus (Itching)',
    description: 'Persistent scratching, biting, licking, or rubbing of the skin. Can be generalised or localised. Primary causes include ectoparasites, allergy, or infection.',
    affectedBodyAreas: ['Skin & Coat'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Distribution guides diagnosis: ear/face/feet in atopy; dorsal lumbosacral in flea allergy; ventral in food allergy.',
  },
  {
    name: 'Alopecia (Hair Loss)',
    description: 'Partial or complete loss of hair in patches or diffusely. May be pruritic (self-induced) or non-pruritic (endocrine, follicular disorders).',
    affectedBodyAreas: ['Skin & Coat'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Symmetrical non-pruritic alopecia suggests endocrine disease. Pruritic alopecia suggests allergy or parasites.',
  },
  {
    name: 'Skin Lesions',
    description: 'Primary or secondary skin changes including papules, pustules, crusts, erosions, or ulcers. Morphology and distribution guide diagnosis.',
    affectedBodyAreas: ['Skin & Coat'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Collect pustule cytology before antibiotics. Miliary dermatitis in cats (small crusted papules over the dorsal trunk) is a hypersensitivity reaction pattern.',
  },

  // Musculoskeletal
  {
    name: 'Lameness',
    description: 'Abnormal gait or reluctance to bear weight on one or more limbs. Ranges from subtle shortened stride to complete non-weight-bearing.',
    affectedBodyAreas: ['Musculoskeletal'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Grade lameness 1–5. Joint effusion, pain on manipulation, and crepitus are key findings. Radiography is first-line imaging.',
  },
  {
    name: 'Muscle Wasting',
    description: 'Progressive loss of skeletal muscle mass, often disproportionate to overall body weight change. Common in chronic disease, cancer, cardiac cachexia, and renal disease.',
    affectedBodyAreas: ['Musculoskeletal', 'Systemic'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Muscle Condition Score (MCS 0–3) should be assessed at every visit. Temporal and epaxial muscle loss is most visible on physical exam.',
  },

  // Neurological
  {
    name: 'Seizures',
    description: 'Episodes of uncontrolled electrical discharge in the brain manifesting as convulsions, tonic-clonic activity, paddling, salivation, or loss of consciousness.',
    affectedBodyAreas: ['Neurological'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Status epilepticus (>5 min or ≥2 seizures without recovery) is an emergency. Thorough history including toxin exposure is vital.',
  },
  {
    name: 'Ataxia (Incoordination)',
    description: 'Loss of coordination and instability during movement. Cerebellar ataxia (swaying, intention tremor), vestibular ataxia (head tilt, nystagmus), or proprioceptive (spinal) ataxia.',
    affectedBodyAreas: ['Neurological'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Acute-onset idiopathic vestibular disease in older cats and dogs carries a good prognosis. Paradoxical vestibular disease causes falling toward the normal side.',
  },

  // Cardiovascular
  {
    name: 'Exercise Intolerance',
    description: 'Rapid fatigue, dyspnoea, or collapse during mild-to-moderate physical activity. Indicates reduced cardiac output, respiratory compromise, anaemia, or neuromuscular disease.',
    affectedBodyAreas: ['Cardiovascular', 'Respiratory', 'Musculoskeletal'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Owner-reported history of slowing on walks or reluctance to exercise is often subtle. Compare to previous activity levels.',
  },

  // Oral
  {
    name: 'Halitosis (Bad Breath)',
    description: 'Abnormally foul odour from the mouth. Most commonly caused by periodontal disease. May also indicate systemic disease (uraemic breath in CKD, sweet smell in DKA).',
    affectedBodyAreas: ['Oral'],
    commonality: 'VERY_COMMON' as const,
    onsetSpeed: 'CHRONIC' as const,
    notes: 'Dental disease is the most common disease in cats and dogs >3 years. Uraemic breath has a distinctive ammonia-like odour.',
  },
  {
    name: 'Oral Ulcers',
    description: 'Erosions or ulcers of the oral mucosa, tongue, gums, or pharynx. Causes include calicivirus, renal disease, immune-mediated conditions, and contact ulceration.',
    affectedBodyAreas: ['Oral'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Severe lymphocytic-plasmacytic stomatitis in cats is painful and debilitating; full mouth extraction is often curative.',
  },

  // Reproductive
  {
    name: 'Vaginal Discharge',
    description: 'Abnormal secretions from the vulva. Character (serous, mucopurulent, bloody) and timing relative to oestrus cycle aid diagnosis. Must rule out pyometra in intact females.',
    affectedBodyAreas: ['Reproductive'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'SUBACUTE' as const,
    notes: 'Open-cervix pyometra presents with purulent discharge; closed-cervix pyometra has no discharge but is more life-threatening.',
  },

  // Ocular
  {
    name: 'Corneal Ulceration',
    description: 'Defect in the corneal epithelium and/or stroma presenting as ocular pain (blepharospasm), epiphora, photophobia, and fluorescein dye uptake on exam.',
    affectedBodyAreas: ['Ocular'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'Deep or melting ulcers require urgent referral. Never use topical corticosteroids with a corneal ulcer present.',
  },
  {
    name: 'Uveitis',
    description: 'Inflammation of the uveal tract (iris, ciliary body, choroid) presenting with pain, photophobia, miosis, aqueous flare, hyphaema, or hypopyon.',
    affectedBodyAreas: ['Ocular'],
    commonality: 'COMMON' as const,
    onsetSpeed: 'ACUTE' as const,
    notes: 'FIV, FeLV, FIP, and toxoplasmosis are important systemic causes of uveitis in cats. Chronic uveitis leads to secondary glaucoma.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TREATMENTS
// ─────────────────────────────────────────────────────────────────────────────
const TREATMENTS = [
  {
    name: 'IV Fluid Resuscitation',
    description: 'Administration of intravenous crystalloid fluids to restore circulating volume, correct electrolyte imbalances, and support tissue perfusion. The cornerstone of treatment for dehydration and shock.',
    contraindications: [
      'Congestive heart failure (use with caution and reduced rates)',
      'Pulmonary oedema (unless specifically treating concurrent dehydration)',
    ],
    vetNotes: 'Calculate fluid deficit: % dehydration × body weight (kg) × 10 = mL deficit. Add maintenance (50–60 mL/kg/day cats; 40–60 mL/kg/day dogs) plus ongoing losses. Reassess hydration and urine output regularly.',
    estimatedDuration: '12–72 hours (inpatient)',
    estimatedCost: '$150–$400 USD',
    successRate: 90,
    steps: [
      { title: 'Place IV catheter', description: 'Clip, scrub, and place a peripheral IV catheter (22–20 G for cats, 20–18 G for dogs). Confirm patency with flush.', durationMinutes: 10 },
      { title: 'Calculate fluid requirement', description: 'Estimate % dehydration clinically. Calculate: deficit + daily maintenance + ongoing losses. Select appropriate crystalloid (LRS or 0.9% NaCl).', durationMinutes: 5 },
      { title: 'Initiate fluid infusion', description: 'Connect fluid line and set rate on infusion pump. For shock: bolus 10–20 mL/kg over 15–20 min, reassess.', durationMinutes: 20 },
      { title: 'Monitor patient', description: 'Check vital signs (HR, RR, mucous membrane colour, CRT, temperature) every 1–4 h. Monitor urine output and body weight. Adjust fluid rate as needed.', durationMinutes: 60 },
      { title: 'Transition to oral fluids', description: 'Once hydration is restored and patient is eating/drinking, reduce IV rate and transition to oral water and food intake.', durationMinutes: 30 },
    ],
  },
  {
    name: 'Systemic Antibiotic Therapy',
    description: 'Systemic antimicrobial treatment for confirmed or suspected bacterial infections. Antibiotic selection should ideally be guided by culture and sensitivity results; empirical therapy uses spectrum-appropriate broad-coverage agents.',
    contraindications: [
      'Known allergy or previous adverse reaction to the specific antibiotic class',
      'Fluoroquinolones in growing animals (cartilage toxicity risk)',
      'Tetracyclines in pregnant or nursing animals',
    ],
    vetNotes: 'Culture and sensitivity testing is strongly recommended before initiating antibiotics. Avoid unnecessary broad-spectrum antibiotics to minimise resistance. Complete the full course even if clinical signs resolve early.',
    estimatedDuration: '7–28 days depending on infection type',
    estimatedCost: '$30–$150 USD',
    successRate: 85,
    steps: [
      { title: 'Confirm infection and collect culture', description: 'Collect appropriate sample (swab, urine, blood) for culture and sensitivity before starting antibiotics where feasible.', durationMinutes: 15 },
      { title: 'Select antibiotic', description: 'Choose empirical antibiotic based on most likely pathogen, site of infection, and patient signalment. Common first-line: amoxicillin-clavulanate, doxycycline, or trimethoprim-sulfa.', durationMinutes: 5 },
      { title: 'Administer and educate owner', description: 'Dispense oral medication. Demonstrate administration technique. Emphasise completing the full course.', durationMinutes: 10 },
      { title: 'Culture follow-up and recheck', description: 'Schedule recheck at 7–14 days. Review culture results and adjust antibiotic if resistance is identified.', durationMinutes: 20 },
    ],
  },
  {
    name: 'Antiparasitic Treatment',
    description: 'Pharmacological elimination of internal (worms, protozoa) and external (fleas, ticks, mites) parasites. Combination products are commonly used for broad-spectrum coverage.',
    contraindications: [
      'Ivermectin and milbemycin oxime: contraindicated in MDR1/ABCB1 mutation-positive breeds (Collies, Australian Shepherds) at high doses',
      'Permethrin-containing spot-ons: NEVER apply to cats — lethal toxicity',
      'Fenbendazole: avoid in first trimester of pregnancy',
    ],
    vetNotes: 'Treat all in-contact animals simultaneously. For flea infestations, treat premises with an insect growth regulator (IGR) as >95% of the lifecycle is in the environment. Repeat faecal floatation 2–4 weeks post-treatment to confirm efficacy.',
    estimatedDuration: '1–7 days (acute); monthly prevention ongoing',
    estimatedCost: '$25–$100 USD per treatment',
    successRate: 95,
    steps: [
      { title: 'Identify parasite(s)', description: 'Perform physical examination (coat combing, skin scraping, ear cytology), faecal float/direct smear as indicated.', durationMinutes: 20 },
      { title: 'Select appropriate antiparasitic', description: 'Choose product based on parasite type, species, breed genetic risk (MDR1), age, weight, and pregnancy status.', durationMinutes: 5 },
      { title: 'Administer treatment', description: 'Apply topical or administer oral product per manufacturer guidelines. Confirm correct dosing by weight.', durationMinutes: 5 },
      { title: 'Environmental treatment', description: 'For ectoparasites: thorough vacuuming, laundering of bedding, and application of home premise spray with IGR.', durationMinutes: 10 },
      { title: 'Confirm efficacy and establish prevention', description: 'Recheck faecal sample or repeat skin examination in 2–4 weeks. Establish monthly preventive programme.', durationMinutes: 15 },
    ],
  },
  {
    name: 'Feline Urethral Obstruction Relief',
    description: 'Emergency procedure to relieve blocked urethral outflow in male cats. Includes urethral catheterisation, followed by post-operative medical management and dietary modification.',
    contraindications: [
      'Severely compromised cardiovascular status must be stabilised before anaesthesia',
      'Severe hyperkalaemia (>7.5 mEq/L) should be medically managed before anaesthetic induction',
    ],
    vetNotes: 'Critical pre-anaesthetic stabilisation: ECG monitoring for hyperkalaemia-induced arrhythmias, IV fluid therapy, and correction of electrolyte abnormalities. Post-obstruction diuresis is common — monitor fluid balance closely.',
    estimatedDuration: '2–5 days hospitalisation',
    estimatedCost: '$800–$2,500 USD',
    successRate: 88,
    steps: [
      { title: 'Emergency stabilisation', description: 'Place IV catheter, initiate fluid therapy. Obtain blood (electrolytes, BUN, creatinine, PCV). Perform ECG for cardiac arrhythmias secondary to hyperkalaemia.', durationMinutes: 30 },
      { title: 'Correct hyperkalaemia', description: 'If K+ >6.5 mEq/L or ECG changes: administer IV calcium gluconate (cardiac membrane stabilisation), dextrose ± insulin as indicated.', durationMinutes: 30 },
      { title: 'Urethral catheterisation', description: 'Under sedation or anaesthesia, place a lubricated urinary catheter (3.5 Fr tom cat catheter). Gently flush retrograde with sterile saline. Secure catheter in place.', durationMinutes: 30 },
      { title: 'Post-obstruction care', description: 'Maintain closed urinary collection system. Monitor urine output, fluid balance, and electrolytes q4–8h. Continue IV fluids for 24–48 h.', durationMinutes: 120 },
      { title: 'Dietary and medical management', description: 'Transition to urinary prescription diet. Discuss environmental enrichment and stress reduction. Schedule recheck urinalysis.', durationMinutes: 20 },
    ],
  },
  {
    name: 'Dental Prophylaxis Under Anaesthesia',
    description: 'Comprehensive oral health procedure under general anaesthesia, including thorough examination, full-mouth dental radiography, supragingival and subgingival scaling, polishing, and extraction of non-viable teeth.',
    contraindications: [
      'Uncontrolled systemic disease should be stabilised before elective anaesthesia',
      'Active coagulopathy requires correction before extractions',
      'Severe anaemia (PCV <20%) is a relative contraindication for elective procedures',
    ],
    vetNotes: 'Pre-anaesthetic bloodwork mandatory for patients >7 years. Full-mouth dental radiography is essential — approximately 50% of pathology is below the gum line. Discuss home dental care at discharge.',
    estimatedDuration: '60–180 minutes',
    estimatedCost: '$300–$1,200 USD',
    successRate: 95,
    steps: [
      { title: 'Pre-anaesthetic assessment', description: 'Review bloodwork, assess ASA status. Place IV catheter. Administer pre-anaesthetic medications.', durationMinutes: 20 },
      { title: 'Induction and intubation', description: 'Induce anaesthesia with propofol or alfaxalone IV. Place cuffed endotracheal tube. Pack pharynx with moist gauze.', durationMinutes: 10 },
      { title: 'Oral examination and dental radiography', description: 'Systematically examine all teeth, gingiva, mucosa, tongue, and palate. Chart findings. Take full-mouth intraoral radiographs.', durationMinutes: 30 },
      { title: 'Scaling and polishing', description: 'Remove supragingival calculus with ultrasonic scaler. Perform subgingival scaling with hand curettes. Polish all teeth with prophy paste.', durationMinutes: 30 },
      { title: 'Extractions (as required)', description: 'Extract non-viable teeth using closed or surgical technique. Place absorbable sutures to close extraction sites.', durationMinutes: 60 },
      { title: 'Recovery and discharge instructions', description: 'Remove pharyngeal gauze. Recover in warm, quiet area with monitoring until sternal. Discharge with pain relief, antibiotics if indicated, and home care instructions.', durationMinutes: 30 },
    ],
  },
  {
    name: 'Chronic Kidney Disease (CKD) Management',
    description: 'Long-term multimodal management of chronic irreversible renal disease, focused on slowing progression, managing clinical signs, maintaining hydration, and optimising quality of life. IRIS staging guides treatment intensity.',
    contraindications: [
      'NSAIDs: contraindicated — nephrotoxic, reduce renal blood flow',
      'Aminoglycoside antibiotics (gentamicin, amikacin): avoid — nephrotoxic',
      'ACE inhibitors: use with caution in severe volume depletion; monitor electrolytes',
    ],
    vetNotes: 'IRIS CKD staging based on fasted creatinine ± SDMA, substaged by proteinuria (UPC) and blood pressure. Renal therapeutic diet is the single most evidence-based intervention for slowing CKD progression.',
    estimatedDuration: 'Lifelong management',
    estimatedCost: '$100–$400 USD/month',
    successRate: 70,
    steps: [
      { title: 'IRIS staging and baseline diagnostics', description: 'Fasted creatinine and SDMA for IRIS staging. UPC ratio. Blood pressure measurement. CBC, full biochemistry, urinalysis, and abdominal ultrasound.', durationMinutes: 45 },
      { title: 'Dietary transition', description: 'Transition gradually over 2–4 weeks to a veterinary renal diet. Ensure adequate caloric intake. Add water to food to increase hydration.', durationMinutes: 10 },
      { title: 'Phosphate management', description: 'If serum phosphate above IRIS target after dietary change: initiate intestinal phosphate binders (aluminium hydroxide, calcium carbonate) with meals.', durationMinutes: 10 },
      { title: 'Blood pressure control', description: 'If systolic BP >160 mmHg on ≥3 measurements: initiate amlodipine (cats) or benazepril/enalapril (dogs/cats). Target <140 mmHg. Recheck BP in 1–2 weeks.', durationMinutes: 15 },
      { title: 'Anaemia management', description: 'If PCV <20%: consider darbepoetin alfa SQ q1–2 weeks. Ensure adequate iron stores. Anti-nausea medication for uraemic signs.', durationMinutes: 15 },
      { title: 'Subcutaneous fluid therapy', description: 'In later-stage CKD, administer subcutaneous fluids at home (50–150 mL daily or every other day) to greatly improve quality of life. Train owners on technique.', durationMinutes: 20 },
      { title: 'Ongoing monitoring', description: 'Recheck every 3–6 months: bloodwork, urinalysis, UPC, blood pressure. Adjust management based on IRIS substage changes.', durationMinutes: 30 },
    ],
  },
  {
    name: 'Diabetes Mellitus Management',
    description: 'Long-term insulin therapy combined with dietary management and glucose monitoring for cats or dogs diagnosed with diabetes mellitus. With tight regulation, cats may achieve diabetic remission.',
    contraindications: [
      'Insulin must not be administered if blood glucose is <4 mmol/L (72 mg/dL)',
      'Untreated concurrent infections (dental disease, pyometra, UTI) impair regulation — address first',
    ],
    vetNotes: 'Cats: glargine (Lantus) or PZI insulin BID preferred. Dogs: NPH insulin BID. Serial glucose curves (8–10 h; measure q2h) used for dose adjustment — aim for nadir 5–8 mmol/L. Fructosamine reflects average glucose over 2–3 weeks.',
    estimatedDuration: 'Lifelong (unless remission in cats)',
    estimatedCost: '$150–$500 USD/month',
    successRate: 80,
    steps: [
      { title: 'Confirm diagnosis', description: 'Persistent fasting hyperglycaemia AND glucosuria required. Fructosamine to confirm chronicity. Urinalysis and culture to check for UTI.', durationMinutes: 30 },
      { title: 'Initiate insulin therapy', description: 'Cats: glargine 1–2 U per cat BID SQ or 0.5 U/kg BID. Dogs: NPH 0.25–0.5 U/kg BID SQ. Always administer after a meal.', durationMinutes: 15 },
      { title: 'Dietary management', description: 'Cats: high-protein, low-carbohydrate canned food. Dogs: consistent high-fibre diet fed in two equal meals at time of insulin injections.', durationMinutes: 15 },
      { title: 'Perform initial glucose curve', description: 'Hospitalise for 8–12 h serial blood glucose curve 5–7 days after initiating insulin. Measure every 2 h. Assess nadir, duration, and pre-insulin glucose.', durationMinutes: 480 },
      { title: 'Owner training', description: 'Demonstrate insulin drawing and injection technique. Teach signs of hypoglycaemia and emergency response (oral Karo syrup). Provide monitoring diary.', durationMinutes: 30 },
      { title: 'Ongoing monitoring and dose adjustment', description: 'Recheck glucose curve every 1–4 weeks until stable, then every 3 months. Adjust dose by 0.5–1 U increments. Fructosamine every 3 months.', durationMinutes: 60 },
    ],
  },
  {
    name: 'Upper Respiratory Infection Supportive Care',
    description: 'Multimodal management of feline or canine upper respiratory tract infections (URTIs), including antiviral agents where applicable, nutritional support, nebulisation, and management of secondary bacterial infections.',
    contraindications: [
      'Famciclovir: use with caution in cats with severe renal impairment (dose reduction required)',
    ],
    vetNotes: 'Famciclovir (62.5 mg per cat BID–TID) is the antiviral of choice for FHV-1 in cats. Keep patients in warm, low-stress environments. Encourage eating by warming food.',
    estimatedDuration: '10–21 days',
    estimatedCost: '$80–$250 USD',
    successRate: 82,
    steps: [
      { title: 'Assess severity and isolate', description: 'Evaluate respiratory effort, hydration, and appetite. Isolate patient from other animals to prevent spread.', durationMinutes: 15 },
      { title: 'Initiate supportive care', description: 'Nutritional support (appetite stimulants or syringe feeding if anorectic), fluid therapy for dehydration, and maintain warmth.', durationMinutes: 20 },
      { title: 'Antiviral therapy (FHV-1 cats)', description: 'Administer famciclovir orally. Apply cidofovir 0.5% ophthalmic drops BID if ocular herpesvirus signs are present.', durationMinutes: 5 },
      { title: 'Nebulisation therapy', description: 'Saline nebulisation for 15–20 min BID to TID helps loosen nasal secretions. Follow with gentle nasal cleaning.', durationMinutes: 20 },
      { title: 'Antibiotics for secondary infection', description: 'Initiate doxycycline or amoxicillin-clavulanate if mucopurulent discharge or systemic signs suggest secondary bacterial infection.', durationMinutes: 10 },
    ],
  },
  {
    name: 'Wound Management and Debridement',
    description: 'Assessment, cleaning, debridement, and appropriate closure or open management of traumatic, infected, or non-healing wounds. Includes lavage, removal of necrotic tissue, drain placement where indicated, and bandaging.',
    contraindications: [
      'Heavily contaminated or infected wounds should not be primarily closed — open management or delayed primary closure is preferred',
      'Anaesthetic agents must be chosen carefully in haemodynamically unstable patients',
    ],
    vetNotes: 'The solution to pollution is dilution — copious lavage (500–2000 mL sterile saline at 7–10 PSI) is key. Primary closure ideally within 6 h of injury. Open wound management with wet-to-dry dressings for infected wounds.',
    estimatedDuration: '1–14 days depending on wound severity',
    estimatedCost: '$200–$2,000 USD',
    successRate: 88,
    steps: [
      { title: 'Patient stabilisation and assessment', description: 'Assess wound depth, extent, contamination, and tissue viability. Stabilise patient first (haemorrhage control, treat shock). Pain assessment and analgesia.', durationMinutes: 20 },
      { title: 'Clip and clean wound margins', description: 'Clip hair from wound margin. Protect wound with sterile water-soluble gel while clipping. Flush with dilute chlorhexidine then copious sterile saline.', durationMinutes: 15 },
      { title: 'Debridement', description: 'Remove all devitalised, necrotic, or contaminated tissue by sharp debridement or lavage. Preserve viable tissue.', durationMinutes: 30 },
      { title: 'Wound closure decision', description: 'Assess for primary closure (clean, <6h old), delayed primary closure (at 3–5 days), or second-intention healing. Place drain if dead space present.', durationMinutes: 15 },
      { title: 'Bandaging', description: 'Apply appropriate bandage (non-adherent contact layer, absorptive secondary layer, conforming tertiary layer). Change every 24–72 h based on discharge level.', durationMinutes: 20 },
      { title: 'Discharge and follow-up', description: 'Discharge with analgesics and antibiotics if indicated. Provide bandage change schedule and signs of infection to watch for. Suture removal at 10–14 days.', durationMinutes: 15 },
    ],
  },
  {
    name: 'CHOP Chemotherapy Protocol (Lymphoma)',
    description: 'Combination chemotherapy for multicentric lymphoma, the most common haematopoietic malignancy in dogs. CHOP protocol includes Cyclophosphamide, Hydroxydaunorubicin (doxorubicin), Vincristine (Oncovin), and Prednisolone over a 19–25 week cycle.',
    contraindications: [
      'Doxorubicin: limited cardiac toxicity — baseline echocardiogram recommended in predisposed breeds',
      'Cyclophosphamide: monitor for sterile haemorrhagic cystitis — ensure adequate hydration and furosemide co-administration',
      'All chemotherapy: administer only by trained personnel with appropriate PPE and biohazard waste disposal',
    ],
    vetNotes: 'Complete staging (thoracic radiographs, abdominal ultrasound, lymph node aspirates, CBC, chemistry, urinalysis) required before initiation. Monitor CBC weekly — neutropenia (ANC <1500/μL) requires dose delay or reduction. Client counselling on waste handling is mandatory.',
    estimatedDuration: '19–25 weeks (full protocol)',
    estimatedCost: '$5,000–$10,000+ USD',
    successRate: 75,
    steps: [
      { title: 'Complete disease staging', description: 'CBC, serum biochemistry, urinalysis. Thoracic radiographs (3 views). Abdominal ultrasound. FNA of enlarged lymph node for cytology.', durationMinutes: 90 },
      { title: 'Owner counselling and consent', description: 'Discuss diagnosis, prognosis (median survival 12–14 months with CHOP), protocol schedule, monitoring requirements, expected side effects, and cost.', durationMinutes: 30 },
      { title: 'Week 1: Vincristine + Prednisolone', description: 'Vincristine 0.7 mg/m² IV slowly via butterfly catheter (perivascular extravasation causes severe tissue necrosis). Start prednisolone PO.', durationMinutes: 30 },
      { title: 'Week 2: Doxorubicin', description: 'Pre-medicate with diphenhydramine. Administer doxorubicin 30 mg/m² (dog) as slow IV infusion over 20–30 min. Monitor for hypersensitivity reactions.', durationMinutes: 45 },
      { title: 'CBC monitoring and supportive care', description: 'CBC at each visit. If ANC <1500: delay next dose, dispense prophylactic antibiotics. GI support (ondansetron, famotidine) for nausea as needed.', durationMinutes: 20 },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// DISEASES
// ─────────────────────────────────────────────────────────────────────────────
const DISEASES = [
  // ── FELINE INFECTIOUS ─────────────────────────────────────────────────────
  {
    name: 'Feline Panleukopenia (Feline Parvovirus)',
    description: 'Highly contagious viral disease caused by Feline Parvovirus (FPV), characterised by severe bone marrow suppression, haemorrhagic enteritis, and profound leukopenia. A leading cause of death in unvaccinated kittens. The virus is extremely environmentally stable, surviving years in the environment.',
    causes: [
      'Infection with Feline Parvovirus (FPV)',
      'Oronasal exposure to faeces, urine, vomit, or fomites from infected animals',
      'In-utero transmission causing cerebellar hypoplasia in kittens',
      'Most susceptible: unvaccinated kittens 3–5 months of age',
    ],
    symptoms: [
      'Severe vomiting and haemorrhagic diarrhoea',
      'Profound lethargy and depression',
      'High fever initially, then hypothermia in severe cases',
      'Complete anorexia',
      'Severe dehydration',
      'Leukopenia (hallmark finding)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Core FVRCP vaccination starting at 6–8 weeks, boosters every 3–4 weeks until 16 weeks, then at 1 year, then every 3 years',
      'Strict isolation of infected animals',
      'Environmental decontamination with 1:32 diluted bleach (only effective disinfectant)',
      'Avoid unvaccinated kittens in public areas or environments with unknown animals',
    ],
    treatmentMethods: [
      'Aggressive IV fluid therapy to correct dehydration and electrolyte imbalances',
      'Broad-spectrum antibiotics to prevent septicaemia from intestinal bacterial translocation',
      'Anti-nausea medication (maropitant, ondansetron)',
      'Nutritional support (syringe feeding or nasogastric tube)',
      'Blood or plasma transfusions for severe anaemia or hypoproteinaemia',
      'Strict barrier nursing and isolation',
    ],
    recoveryPeriod: '1–2 weeks (survivors); mortality up to 90% in untreated kittens',
    symptomNames: ['Vomiting', 'Diarrhoea', 'Lethargy', 'Loss of Appetite (Anorexia)', 'Dehydration', 'Fever', 'Pale Mucous Membranes'],
    treatmentNames: ['IV Fluid Resuscitation', 'Systemic Antibiotic Therapy'],
  },
  {
    name: 'Feline Herpesvirus-1 (Viral Rhinotracheitis)',
    description: 'Endemic upper respiratory tract infection caused by Feline Herpesvirus-1 (FHV-1). A leading cause of sneezing, nasal discharge, and conjunctivitis in cats. Establishes lifelong latency in the trigeminal ganglion; stress-induced reactivation is extremely common in multi-cat households and shelters.',
    causes: [
      'Infection with Feline Herpesvirus-1 (FHV-1)',
      'Direct contact with ocular or nasal secretions from infected or shedding cats',
      'Stress-induced reactivation of latent virus (rehoming, hospitalisation, boarding)',
      'Multi-cat environments and shelters have high prevalence',
    ],
    symptoms: [
      'Sneezing paroxysms',
      'Bilateral mucopurulent nasal discharge',
      'Conjunctivitis with ocular discharge',
      'Corneal ulceration (dendritic ulcers are pathognomonic for FHV-1)',
      'Lethargy',
      'Loss of appetite',
      'Fever in acute phase',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Core FVRCP vaccination (reduces severity but does not prevent infection or latency)',
      'Minimise stress in cats known to be latent carriers',
      'Isolation of newly acquired cats for 14 days',
      'Good hygiene and ventilation in multi-cat environments',
    ],
    treatmentMethods: [
      'Famciclovir (antiviral) orally for active FHV-1 outbreaks',
      'Cidofovir 0.5% ophthalmic drops BID for ocular herpesvirus',
      'Broad-spectrum topical antibiotics for secondary bacterial conjunctivitis',
      'Nebulisation with saline to loosen nasal secretions',
      'Appetite stimulants and nutritional support',
    ],
    recoveryPeriod: '2–3 weeks (acute episode); lifelong carrier state',
    symptomNames: ['Sneezing', 'Nasal Discharge', 'Ocular Discharge', 'Lethargy', 'Loss of Appetite (Anorexia)', 'Fever', 'Corneal Ulceration'],
    treatmentNames: ['Upper Respiratory Infection Supportive Care'],
  },
  {
    name: 'Feline Calicivirus (FCV) Infection',
    description: 'Common feline upper respiratory pathogen and an important cause of oral ulceration. Highly variable pathogenicity — virulent systemic strains (VS-FCV) can cause severe haemorrhagic disease with high mortality. Multiple antigenically diverse strains exist, making complete vaccine protection difficult.',
    causes: [
      'Infection with Feline Calicivirus (FCV — a non-enveloped RNA virus)',
      'Direct contact with oronasal secretions, aerosol droplets, or fomites',
      'Shelter and multi-cat households facilitate transmission',
      'Virulent systemic strains (VS-FCV) cause severe outbreak disease',
    ],
    symptoms: [
      'Oral ulcers on the tongue, hard palate, and lips (pathognomonic pattern)',
      'Excessive salivation (ptyalism)',
      'Sneezing and nasal discharge',
      'Lameness (transient polyarthritis in kittens — "limping syndrome")',
      'Fever',
      'Lethargy and anorexia',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Core FVRCP vaccination (bivalent calicivirus strains included)',
      'Isolation of new cats for 14 days in multi-cat settings',
      'Environmental disinfection (FCV inactivated by 1:32 bleach)',
      'Annual boosters in high-risk environments (catteries, shelters)',
    ],
    treatmentMethods: [
      'Supportive care: fluid therapy and anti-nausea medication',
      'Analgesia (buprenorphine) for oral pain — critical for encouraging food intake',
      'Soft or liquidised food to minimise oral discomfort',
      'Antibiotics for secondary bacterial infection',
    ],
    recoveryPeriod: '1–3 weeks (acute); chronic carriers common',
    symptomNames: ['Oral Ulcers', 'Sneezing', 'Nasal Discharge', 'Fever', 'Lethargy', 'Loss of Appetite (Anorexia)'],
    treatmentNames: ['Upper Respiratory Infection Supportive Care'],
  },
  {
    name: 'Feline Leukaemia Virus (FeLV) Infection',
    description: 'Oncogenic retrovirus that integrates into the feline host genome, causing progressive immunosuppression, anaemia, lymphoma, and various other neoplastic and non-neoplastic diseases. The most important retroviral infection in cats; typically fatal within 2–3 years of progressive infection.',
    causes: [
      'Infection with Feline Leukaemia Virus (FeLV — a retrovirus)',
      'Exposure via mutual grooming, shared food/water bowls, or bite wounds from infected cats',
      'In-utero or colostral transmission from infected queens to kittens',
      'Outdoor cats and multi-cat households with untested animals are at highest risk',
    ],
    symptoms: [
      'Weight loss and muscle wasting',
      'Lethargy and weakness',
      'Lymphadenopathy',
      'Pale mucous membranes (non-regenerative anaemia — hallmark)',
      'Recurrent infections secondary to immunosuppression',
      'Oral ulcers and gingivitis',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Test all cats before introduction to a household (ELISA test)',
      'FeLV vaccination for outdoor or at-risk cats',
      'Keep FeLV-positive cats strictly indoors and separated from FeLV-negative cats',
      'Neuter cats to reduce fighting and exposure risk',
    ],
    treatmentMethods: [
      'No curative treatment available for FeLV infection itself',
      'Aggressive treatment of secondary infections with antibiotics',
      'Blood transfusions or darbepoetin alfa for non-regenerative anaemia',
      'Chemotherapy if FeLV-associated lymphoma develops',
      'Optimal nutrition and stress reduction to support immune function',
    ],
    recoveryPeriod: 'Progressive disease — median survival 2–3 years post-diagnosis',
    symptomNames: ['Weight Loss', 'Lethargy', 'Lymphadenopathy', 'Pale Mucous Membranes', 'Loss of Appetite (Anorexia)'],
    treatmentNames: ['IV Fluid Resuscitation', 'Systemic Antibiotic Therapy'],
  },
  {
    name: 'Feline Immunodeficiency Virus (FIV) Infection',
    description: 'Lentiviral infection causing progressive CD4+ T-lymphocyte depletion and immunosuppression, leading to opportunistic secondary infections and immune-mediated disease. Transmitted primarily via deep bite wounds. FIV-positive cats can live many years with good quality of life if managed appropriately.',
    causes: [
      'Infection with Feline Immunodeficiency Virus (FIV — a lentivirus)',
      'Deep bite wounds from infected cats are the primary transmission route',
      'Outdoor intact male cats in dense populations are at highest risk',
      'Vertical transmission from queen to kitten is possible but uncommon',
    ],
    symptoms: [
      'Recurrent and chronic infections (respiratory, skin, urinary)',
      'Severe oral ulcers and stomatitis (hallmark finding)',
      'Lymphadenopathy',
      'Chronic weight loss',
      'Lethargy',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Neuter cats to reduce fighting behaviour',
      'Keep FIV-positive cats strictly indoors',
      'Test all cats before introduction to a household',
      'Available FIV vaccine (variable geographic coverage — consult current AAFP guidelines)',
    ],
    treatmentMethods: [
      'No cure — management of secondary infections and complications',
      'Aggressive antibiotic therapy for bacterial infections',
      'Antifungal treatment for opportunistic fungal disease',
      'Stomatitis management (dental extractions, chlorhexidine rinse)',
      'Optimal nutrition and stress-free environment',
      'Regular monitoring (CBC, biochemistry, urinalysis every 6 months)',
    ],
    recoveryPeriod: 'Lifelong management; asymptomatic period can last years',
    symptomNames: ['Oral Ulcers', 'Lethargy', 'Weight Loss', 'Lymphadenopathy'],
    treatmentNames: ['Systemic Antibiotic Therapy', 'Dental Prophylaxis Under Anaesthesia'],
  },

  // ── FELINE NON-INFECTIOUS ──────────────────────────────────────────────────
  {
    name: 'Feline Hyperthyroidism',
    description: 'The most common endocrine disease in cats, caused by autonomous overproduction of thyroid hormones by one or both thyroid lobes. Typical presentation is an older cat with weight loss despite polyphagia and hyperactivity. Excellent prognosis with appropriate treatment.',
    causes: [
      'Benign thyroid adenoma or adenomatous hyperplasia (>98% of cases)',
      'Thyroid carcinoma (rare, <2%)',
      'Proposed dietary and environmental factors (iodine imbalance, PBDEs)',
      'Typically affects cats >10 years of age',
    ],
    symptoms: [
      'Weight loss despite increased appetite (polyphagia)',
      'Increased thirst and urination (PU/PD)',
      'Hyperactivity and restlessness',
      'Vomiting and diarrhoea',
      'Unkempt coat',
      'Tachycardia and secondary hypertrophic cardiomyopathy',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Annual bloodwork including T4 in cats >8 years',
      'SDMA and T4 testing for early detection in cats >10 years',
      'Monitor blood pressure in older cats',
    ],
    treatmentMethods: [
      'Methimazole (medical management) — daily oral or transdermal pinna application',
      "Iodine-restricted prescription diet (Hill's y/d) — effective but requires strict compliance",
      'Radioactive iodine (I-131) — curative in >95% of cases; treatment of choice where available',
      'Surgical thyroidectomy — curative; requires experienced surgeon',
      'Monitor post-treatment for CKD unmasking (restored renal blood flow may reveal underlying CKD)',
    ],
    recoveryPeriod: 'Medical management ongoing; I-131 or surgery curative within 1–3 months',
    symptomNames: ['Weight Loss', 'Increased Thirst (Polydipsia)', 'Increased Urination (Polyuria)', 'Vomiting', 'Diarrhoea'],
    treatmentNames: ['Chronic Kidney Disease (CKD) Management'],
  },
  {
    name: 'Feline Chronic Kidney Disease (CKD)',
    description: 'Progressive, irreversible deterioration of renal function affecting >30% of cats >10 years of age. Characterised by reduced GFR, azotaemia, and eventually uraemia. IRIS staging (I–IV) guides management and prognosis. One of the most prevalent diseases in geriatric cats.',
    causes: [
      'Chronic interstitial nephritis (most common — idiopathic)',
      'Polycystic kidney disease (PKD — genetic in Persians)',
      'Renal lymphoma',
      'Chronic pyelonephritis',
      'Renal infarction or hypertensive nephropathy',
      'Previous acute kidney injury',
      'Nephrotoxin exposure (NSAIDs, aminoglycosides, Easter lily ingestion)',
    ],
    symptoms: [
      'Increased thirst and urination (PU/PD)',
      'Weight loss and muscle wasting',
      'Lethargy and weakness',
      'Loss of appetite',
      'Vomiting (uraemic gastritis)',
      'Halitosis (ammonia-like uraemic breath)',
      'Pale mucous membranes (non-regenerative anaemia)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Annual bloodwork and urinalysis in cats >7 years',
      'SDMA testing for early detection (detects CKD 17 months earlier than creatinine)',
      'Blood pressure monitoring in older cats',
      'Avoid nephrotoxic medications',
      'Wet food diet to ensure adequate hydration',
    ],
    treatmentMethods: [
      'Renal prescription diet (protein/phosphate/sodium restriction)',
      'Phosphate binders to control hyperphosphataemia',
      'Antihypertensive therapy (amlodipine 0.625–1.25 mg/cat SID) if hypertensive',
      'Darbepoetin alfa for non-regenerative anaemia',
      'Subcutaneous fluid therapy at home for advanced stages',
      'Anti-nausea medication and H2 antagonists for uraemic gastritis',
      'Potassium supplementation for hypokalaemia',
    ],
    recoveryPeriod: 'Lifelong progressive disease; median survival 2–3 years post-IRIS Stage 2 diagnosis',
    symptomNames: ['Increased Thirst (Polydipsia)', 'Weight Loss', 'Lethargy', 'Loss of Appetite (Anorexia)', 'Vomiting', 'Halitosis (Bad Breath)', 'Pale Mucous Membranes'],
    treatmentNames: ['Chronic Kidney Disease (CKD) Management'],
  },
  {
    name: 'Feline Lower Urinary Tract Disease (FLUTD)',
    description: 'Syndrome encompassing multiple lower urinary tract conditions in cats, including feline idiopathic cystitis (FIC), urolithiasis, and urethral plugs. FIC is the most common cause in cats <10 years and is strongly associated with stress and indoor sedentary lifestyle. Urethral obstruction in male cats is a life-threatening emergency.',
    causes: [
      'Feline idiopathic cystitis (FIC) — sterile stress-related inflammation (most common <10 yr)',
      'Urolithiasis (struvite or calcium oxalate crystals/stones)',
      'Urethral plugs (protein matrix with mineral deposits)',
      'Bacterial UTI (more common in older or immunosuppressed cats)',
      'Stress, obesity, indoor sedentary lifestyle, dry food diet are predisposing factors',
    ],
    symptoms: [
      'Straining to urinate with small or absent urine output',
      'Blood in urine (haematuria)',
      'Frequent attempts to urinate with small volumes',
      'Vocalisation while urinating',
      'Urinating outside the litter box',
      'Licking at genital area',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Increase water intake (wet food, water fountains, multiple water sources)',
      'Weight management and environmental enrichment',
      'Adequate litter boxes (n+1 rule), clean daily',
      'Urinary prescription diet for prone cats',
      'Pheromone diffusers (Feliway) to reduce stress-related FIC',
    ],
    treatmentMethods: [
      'Urethral catheterisation for obstruction (emergency procedure)',
      'IV fluid therapy for dehydration and electrolyte correction',
      'Anti-inflammatory treatment (prednisolone) for FIC flares',
      'Analgesics (buprenorphine, meloxicam) for urinary pain',
      'Antispasmodics (prazosin) to relax urethral smooth muscle',
      'Urinary prescription diet',
      'Environmental enrichment and stress reduction',
    ],
    recoveryPeriod: 'Acute episode 5–7 days; FIC is recurrent without environmental management',
    symptomNames: ['Straining to Urinate (Dysuria)', 'Haematuria (Blood in Urine)', 'Increased Urination (Polyuria)', 'Abdominal Pain'],
    treatmentNames: ['Feline Urethral Obstruction Relief', 'IV Fluid Resuscitation'],
  },
  {
    name: 'Feline Diabetes Mellitus',
    description: 'Endocrine disorder characterised by persistent hyperglycaemia resulting from impaired insulin secretion and insulin resistance. Cats primarily develop Type 2-like diabetes. Obesity is the strongest risk factor. Diabetic remission is achievable in 50–70% of cats with tight early glycaemic control.',
    causes: [
      'Obesity (most important risk factor — increases insulin resistance 4-fold)',
      'Pancreatic beta-cell exhaustion from chronic amyloid deposition (IAPP)',
      'Concurrent disease causing insulin resistance (acromegaly, hyperadrenocorticism)',
      'Long-term corticosteroid or progestogen administration (iatrogenic)',
      'Genetic predisposition in Burmese cats',
    ],
    symptoms: [
      'Excessive thirst (polydipsia)',
      'Excessive urination (polyuria)',
      'Weight loss despite polyphagia (increased appetite)',
      'Plantigrade stance — walking on hocks (diabetic neuropathy)',
      'Unkempt coat',
      'Lethargy',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Maintain healthy body weight (BCS 4–5/9)',
      'High-protein, low-carbohydrate diet (avoid dry carbohydrate-rich diets)',
      'Regular exercise and environmental enrichment',
      'Avoid unnecessary corticosteroids or progestogens',
      'Annual blood glucose and urinalysis screening in obese or at-risk cats',
    ],
    treatmentMethods: [
      'Insulin therapy — glargine (Lantus) or PZI insulin BID SQ',
      'High-protein, low-carbohydrate diet (essential for remission)',
      'Weight management programme',
      'Serial glucose curves for glycaemic control monitoring',
      'Vitamin B12 supplementation for peripheral neuropathy',
    ],
    recoveryPeriod: 'Lifelong management; remission possible in 50–70% with tight early control',
    symptomNames: ['Increased Thirst (Polydipsia)', 'Increased Urination (Polyuria)', 'Weight Loss', 'Lethargy', 'Vomiting'],
    treatmentNames: ['Diabetes Mellitus Management'],
  },
  {
    name: 'Feline Infectious Peritonitis (FIP)',
    description: 'Fatal systemic disease caused by a mutant biotype of Feline Coronavirus (FCoV). The mutant virus acquires the ability to replicate within macrophages, causing a severe pyogranulomatous or granulomatous inflammation. Wet (effusive) FIP causes fluid accumulation; dry (non-effusive) FIP causes granulomas in organs.',
    causes: [
      'Mutation of endemic Feline Coronavirus (FCoV) to a virulent biotype',
      'Most common in cats from multi-cat environments (shelters, catteries)',
      'Young cats (3 months – 3 years) and senior cats >10 years are most susceptible',
      'Stress and immunosuppression (e.g. FeLV, FIV co-infection) are predisposing factors',
    ],
    symptoms: [
      'Abdominal distension (ascites — wet form)',
      'Lethargy and persistent fever unresponsive to antibiotics',
      'Weight loss and anorexia',
      'Jaundice (hepatic involvement)',
      'Neurological signs: ataxia, seizures (dry form)',
      'Uveitis (dry form — ocular involvement)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Reduce stress and overcrowding in multi-cat households',
      'Quarantine new cats for 4 weeks before introduction',
      'Hygiene measures to reduce FCoV shedding (separate litter boxes, regular cleaning)',
      'Intranasal FIP vaccine available in some regions but limited efficacy data',
    ],
    treatmentMethods: [
      'GS-441524 (nucleoside analogue antiviral) — highly effective, >85% remission in treated cats',
      'Prednisolone for initial anti-inflammatory control',
      'Supportive care: thoracocentesis or abdominocentesis for fluid relief',
      'Treatment duration typically 12 weeks minimum with GS-441524',
    ],
    recoveryPeriod: 'Previously fatal; with GS-441524 antiviral treatment, >85% achieve sustained remission',
    symptomNames: ['Abdominal Distension', 'Lethargy', 'Weight Loss', 'Jaundice (Icterus)', 'Ataxia (Incoordination)', 'Uveitis'],
    treatmentNames: ['IV Fluid Resuscitation'],
  },

  // ── CANINE DISEASES ────────────────────────────────────────────────────────
  {
    name: 'Canine Parvovirus Enteritis (CPV-2)',
    description: 'Highly contagious viral disease caused by Canine Parvovirus type 2 (CPV-2), characterised by acute haemorrhagic gastroenteritis, severe leukopenia, and high mortality in unvaccinated puppies. The virus is resistant to most disinfectants and persists in the environment for months to years.',
    causes: [
      'Infection with Canine Parvovirus type 2 (CPV-2a, 2b, or 2c)',
      'Faecal-oral route of transmission',
      'Environmental contamination — virus is extremely stable (bleach only effective disinfectant)',
      'Most susceptible: unvaccinated puppies 6 weeks – 6 months',
      'High-risk breeds: Rottweilers, Doberman Pinschers, American Staffordshire Terriers',
    ],
    symptoms: [
      'Profuse haemorrhagic diarrhoea (foul odour — characteristic)',
      'Severe vomiting',
      'Profound lethargy and depression',
      'Complete anorexia',
      'Fever (may be hypothermic in decompensating shock)',
      'Severe dehydration',
      'Abdominal pain',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Core DA2PP vaccination starting at 6–8 weeks, boosters every 3–4 weeks until 16–20 weeks',
      'Avoid unvaccinated puppy exposure to public areas until fully vaccinated',
      'Environmental decontamination with diluted bleach (1:30)',
      'Quarantine of suspected cases immediately',
    ],
    treatmentMethods: [
      'Aggressive IV fluid and electrolyte therapy (primary treatment)',
      'Broad-spectrum antibiotics to prevent septicaemia from intestinal bacterial translocation',
      'Anti-emetics (maropitant, ondansetron)',
      'Nutritional support — early enteral feeding via NE tube improves outcome',
      'Colloid therapy (fresh frozen plasma) for hypoproteinaemia',
      'Strict isolation and barrier nursing',
    ],
    recoveryPeriod: '5–7 days with intensive treatment; mortality 1–5% with treatment, up to 91% without',
    symptomNames: ['Diarrhoea', 'Vomiting', 'Lethargy', 'Loss of Appetite (Anorexia)', 'Fever', 'Dehydration', 'Abdominal Pain', 'Pale Mucous Membranes'],
    treatmentNames: ['IV Fluid Resuscitation', 'Systemic Antibiotic Therapy'],
  },
  {
    name: 'Canine Distemper Virus (CDV) Infection',
    description: 'Serious multisystemic viral disease of dogs caused by Canine Morbillivirus. Affects the respiratory, gastrointestinal, and central nervous systems. A leading cause of death in unvaccinated dogs worldwide. Neurological signs may appear weeks after apparent recovery from systemic illness.',
    causes: [
      'Infection with Canine Distemper Virus (CDV — a paramyxovirus)',
      'Aerosol droplets and respiratory secretions from infected animals',
      'Wildlife reservoir: foxes, wolves, raccoons, ferrets, mink',
      'Most susceptible: unvaccinated puppies 3–6 months',
    ],
    symptoms: [
      'Purulent nasal and ocular discharge',
      'Coughing and respiratory distress (pneumonia)',
      'Fever (biphasic)',
      'Vomiting and diarrhoea',
      'Hyperkeratosis of nasal planum and footpads ("hard pad disease")',
      'Seizures and ataxia (neurological phase)',
      'Myoclonus (rhythmic muscle twitching — pathognomonic)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Core DA2PP vaccination starting at 6–8 weeks, boosters every 3–4 weeks until 16 weeks, then 1-year booster',
      'Avoid contact with wildlife and unvaccinated dogs',
      'Isolation of suspected cases',
    ],
    treatmentMethods: [
      'No specific antiviral treatment — purely supportive care',
      'IV fluid therapy for systemic support and hydration',
      'Antibiotics for secondary bacterial pneumonia',
      'Anticonvulsants (phenobarbital, diazepam) for seizure control',
      'Anti-emetics and gastrointestinal protectants',
      'Nutritional support — assisted feeding if anorectic',
    ],
    recoveryPeriod: '2–4 weeks (acute phase); neurological signs may be permanent',
    symptomNames: ['Fever', 'Nasal Discharge', 'Ocular Discharge', 'Coughing', 'Vomiting', 'Diarrhoea', 'Seizures', 'Ataxia (Incoordination)'],
    treatmentNames: ['IV Fluid Resuscitation', 'Systemic Antibiotic Therapy'],
  },
  {
    name: 'Canine Infectious Tracheobronchitis (Kennel Cough)',
    description: 'Highly contagious upper respiratory syndrome of dogs characterised by a harsh, honking cough. Caused by multiple pathogens acting synergistically — most commonly Bordetella bronchiseptica combined with canine parainfluenza virus. Self-limiting in immunocompetent adults but can progress to pneumonia in vulnerable animals.',
    causes: [
      'Bordetella bronchiseptica (most important bacterial pathogen)',
      'Canine parainfluenza virus (CPiV)',
      'Canine adenovirus-2 (CAV-2)',
      'Mycoplasma spp. (contributing pathogen)',
      'Exposure in kennels, dog parks, training classes, or grooming salons',
      'Stress, crowding, and poor ventilation are predisposing factors',
    ],
    symptoms: [
      'Dry, harsh, honking cough ("goose-honk")',
      'Gagging and expectorating white foam after coughing',
      'Sneezing',
      'Nasal discharge (serous to mucopurulent)',
      'Generally well systemically in mild cases',
      'Fever and lethargy in severe or complicated cases',
    ],
    severity: 'LOW' as const,
    preventionMethods: [
      'Intranasal or oral Bordetella vaccination before boarding or kennelling (effective within 72 h)',
      'DA2PP vaccination provides protection against CAV-2 and CPiV components',
      'Good ventilation and hygiene in communal dog environments',
    ],
    treatmentMethods: [
      'Rest and reduced exercise for 1–2 weeks',
      'Cough suppressants (butorphanol, hydrocodone) for comfort',
      'Doxycycline for 10–14 days for the Bordetella component',
      'Steam/humidity exposure for mucosal soothing',
      'Hospitalisation and IV antibiotics for complicated pneumonia',
    ],
    recoveryPeriod: '1–3 weeks in uncomplicated cases',
    symptomNames: ['Coughing', 'Sneezing', 'Nasal Discharge', 'Lethargy', 'Fever'],
    treatmentNames: ['Systemic Antibiotic Therapy'],
  },
  {
    name: 'Canine Lymphoma',
    description: 'The most common haematopoietic malignancy in dogs, accounting for 7–14% of all canine tumours. Most commonly presents as multicentric lymphoma (generalised lymphadenopathy). Other forms include alimentary, mediastinal, and cutaneous lymphoma. Intermediate to high-grade B-cell lymphoma responds best to chemotherapy.',
    causes: [
      'Aetiology largely unknown — multifactorial',
      'Chromosomal abnormalities and oncogene activation',
      'Breed predisposition: Golden Retrievers, Boxers, Bulldogs, Rottweilers, Scottish Terriers',
      'Environmental exposures (herbicides — inconclusive evidence)',
    ],
    symptoms: [
      'Rapidly enlarging, non-painful peripheral lymph nodes (multicentric form)',
      'Lethargy and decreased activity',
      'Weight loss and muscle wasting',
      'Loss of appetite',
      'Vomiting and diarrhoea (alimentary form)',
      'Dyspnoea (mediastinal form)',
      'Increased thirst and urination (paraneoplastic hypercalcaemia — T-cell lymphoma)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'No proven prevention',
      'Regular physical examination — screen peripheral lymph nodes in predisposed breeds',
      'Early detection improves prognosis and treatment response',
    ],
    treatmentMethods: [
      'CHOP-based chemotherapy protocol — first-line, ~85% remission rate',
      'Prednisolone alone as palliative treatment',
      'L-asparaginase induction for high-grade lymphoma',
      'Rescue protocols (LOPP, MOPP) for relapsed disease',
      'Nutritional support throughout treatment',
    ],
    recoveryPeriod: 'Median survival 12–14 months with CHOP; ~20–25% survive >2 years',
    symptomNames: ['Lymphadenopathy', 'Lethargy', 'Weight Loss', 'Loss of Appetite (Anorexia)', 'Exercise Intolerance'],
    treatmentNames: ['CHOP Chemotherapy Protocol (Lymphoma)'],
  },
  {
    name: 'Canine Diabetes Mellitus',
    description: 'Endocrine disorder characterised by absolute insulin deficiency (Type 1 pattern, most common in dogs) resulting in persistent hyperglycaemia, glucosuria, and progressive clinical signs. Unlike cats, spontaneous diabetic remission is rare in dogs, making lifelong insulin therapy the standard of care.',
    causes: [
      'Immune-mediated destruction of pancreatic beta cells (most common in dogs)',
      'Chronic pancreatitis causing exocrine and endocrine pancreatic insufficiency',
      'Obesity and insulin resistance contributing to beta-cell exhaustion',
      'Diestrus-associated progesterone causing growth hormone-induced insulin resistance in intact females',
      'Long-term corticosteroid or megestrol acetate administration (iatrogenic)',
      'Predisposed breeds: Samoyeds, Australian Terriers, Miniature Schnauzers, Toy Poodles',
    ],
    symptoms: [
      'Polydipsia (increased thirst)',
      'Polyuria (increased urination)',
      'Polyphagia (increased appetite) with weight loss',
      'Bilateral posterior subcapsular cataracts (rapid onset — classic complication in dogs)',
      'Lethargy and weakness',
      'Recurrent urinary tract infections',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Neuter intact females to eliminate diestrus-related diabetes',
      'Maintain healthy body weight',
      'Avoid unnecessary corticosteroids',
      'Annual blood glucose and urinalysis for predisposed breeds >6 years',
    ],
    treatmentMethods: [
      'NPH (neutral protamine Hagedorn) insulin BID SQ — standard of care',
      'Consistent, high-fibre diet fed at insulin injection times',
      'Serial glucose curves for dose optimisation',
      'Ophthalmoscopy for cataract monitoring — prompt referral for cataract surgery if candidate',
      'Weight management programme for obese patients',
    ],
    recoveryPeriod: 'Lifelong management — diabetic remission is rare in dogs',
    symptomNames: ['Increased Thirst (Polydipsia)', 'Increased Urination (Polyuria)', 'Weight Loss', 'Lethargy', 'Vomiting'],
    treatmentNames: ['Diabetes Mellitus Management'],
  },
  {
    name: 'Canine Patellar Luxation',
    description: 'Displacement of the patella (kneecap) from its normal position in the femoral trochlear groove. Medial patellar luxation (MPL) is most common in small breeds. Graded I–IV based on reducibility and severity. Grade III–IV causes consistent lameness and typically requires surgical correction.',
    causes: [
      'Congenital skeletal malalignment (most common) — shallow trochlear groove, medial displacement of tibial tuberosity',
      'Genetic predisposition: Toy and small breeds (Yorkshire Terrier, Pomeranian, Chihuahua)',
      'Traumatic injury (less common, typically lateral luxation in large breeds)',
      'Obesity — additional mechanical loading of dysplastic joints',
    ],
    symptoms: [
      'Intermittent non-weight-bearing on hindlimb ("skipping gait")',
      'Sudden onset of lameness then resolution after patella self-reduces',
      'Continuous lameness in Grade III–IV cases',
      'Hindlimb held extended while shaking',
      'Muscle atrophy of affected limb in chronic cases',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Weight management — obesity exacerbates patellar luxation',
      'Avoid purchasing high-risk breeds from lines with known patellar problems',
      'Avoid high-impact repetitive exercise in known Grade I–II cases',
    ],
    treatmentMethods: [
      'Grade I–II: conservative management (weight loss, physiotherapy, joint supplements)',
      'Grade III–IV: surgical correction — trochleoplasty, tibial tuberosity transposition, femoral or tibial corrective osteotomy',
      'Post-surgical physiotherapy and hydrotherapy',
      'NSAIDs for pain management (meloxicam, carprofen)',
      'Glucosamine and chondroitin supplementation for secondary osteoarthritis',
    ],
    recoveryPeriod: '6–8 weeks post-surgery for primary repair; ongoing management for osteoarthritis',
    symptomNames: ['Lameness', 'Muscle Wasting'],
    treatmentNames: ['Wound Management and Debridement'],
  },

  // ── SHARED / MULTI-SPECIES ─────────────────────────────────────────────────
  {
    name: 'Flea Allergy Dermatitis (FAD)',
    description: 'The most common allergic skin disease in cats and dogs, caused by IgE-mediated hypersensitivity to Ctenocephalides felis salivary antigens. A single flea bite can trigger intense pruritus in sensitised animals. Paradoxically, FAD patients often have few visible fleas as they groom them off aggressively.',
    causes: [
      'IgE-mediated (immediate) and late-phase hypersensitivity to flea saliva antigens',
      'Heavy or intermittent flea exposure — sensitisation requires repeated bites',
      'Environmental flea contamination (95% of lifecycle in bedding and carpets)',
      'Concurrent skin conditions (atopy) increase sensitisation risk',
    ],
    symptoms: [
      'Intense pruritus — dorsal lumbosacral region, tail base, caudal abdomen (classic distribution)',
      'Alopecia and self-trauma lesions (excoriations, crusts)',
      'Miliary dermatitis pattern in cats (multiple small crusted papules)',
      'Secondary pyoderma (bacterial skin infection)',
      'Hyperpigmentation in chronic cases',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Year-round flea prevention on ALL in-contact animals (cats AND dogs)',
      'Environmental treatment with insect growth regulator (IGR) — methoprene or pyriproxyfen',
      'Monthly prescription-strength flea preventives (isoxazolines, spinosad, selamectin)',
      'Regular vacuuming and laundering of pet bedding',
    ],
    treatmentMethods: [
      'Rigorous flea control on all animals and in the environment (cornerstone)',
      'Glucocorticoids (prednisolone) for short-term relief of severe pruritus',
      'Oclacitinib (Apoquel) or lokivetmab (Cytopoint) for dogs as alternatives to steroids',
      'Antibiotics for secondary pyoderma',
    ],
    recoveryPeriod: 'Resolution of pruritus within 4–8 weeks with adequate flea control; recurrent without ongoing prevention',
    symptomNames: ['Pruritus (Itching)', 'Alopecia (Hair Loss)', 'Skin Lesions'],
    treatmentNames: ['Antiparasitic Treatment', 'Systemic Antibiotic Therapy'],
  },
  {
    name: 'Periodontal Disease',
    description: 'The most common disease in cats and dogs, affecting >80% of dogs and 70% of cats over 3 years of age. Begins as reversible gingivitis and progresses to irreversible periodontitis with alveolar bone loss and tooth loss. Bacteraemia from periodontitis has documented systemic health implications affecting the heart and kidneys.',
    causes: [
      'Dental plaque accumulation (biofilm of oral bacteria — Porphyromonas, Fusobacterium)',
      'Mineralisation of plaque into calculus (tartar)',
      'Lack of home dental care (daily tooth brushing)',
      'Breed and dental conformation (brachycephalic breeds, crowded teeth in small breeds)',
      'Age — prevalence and severity increase progressively',
    ],
    symptoms: [
      'Halitosis (bad breath — first owner-noticed sign)',
      'Oral ulcers and stomatitis in advanced cases',
      'Reluctance to eat hard food or chew toys',
      'Drooling',
      'Pawing at the mouth',
      'Red, swollen, bleeding gums',
    ],
    severity: 'MEDIUM' as const,
    preventionMethods: [
      'Daily tooth brushing with pet-safe toothpaste — single most effective preventive',
      'VOHC-approved dental diets, chews, and water additives as adjuncts',
      'Annual professional oral examination under anaesthesia',
      'Begin dental care in puppies and kittens to establish acceptance',
    ],
    treatmentMethods: [
      'Professional dental scaling and polishing under general anaesthesia',
      'Full-mouth dental radiography to assess bone loss',
      'Extraction of periodontally compromised teeth',
      'Chlorhexidine oral rinse or gel post-procedure',
      'Home dental care programme initiation at discharge',
    ],
    recoveryPeriod: 'Resolution of gingivitis within 2–4 weeks post-cleaning; advanced periodontitis requires extractions',
    symptomNames: ['Halitosis (Bad Breath)', 'Oral Ulcers', 'Loss of Appetite (Anorexia)'],
    treatmentNames: ['Dental Prophylaxis Under Anaesthesia'],
  },
  {
    name: 'Pyometra',
    description: 'Life-threatening uterine infection affecting intact female cats and dogs, most commonly occurring 1–8 weeks after the end of oestrus (luteal phase). Progesterone drives uterine gland secretion and reduces myometrial contractions, allowing bacterial proliferation. Emergency surgical intervention (ovariohysterectomy) is the standard treatment.',
    causes: [
      'Bacterial infection (predominantly E. coli) of the progesterone-primed uterus',
      'Cystic endometrial hyperplasia predisposes to infection',
      'Risk increases with age in intact females (repeated oestrus cycles without pregnancy)',
      'Exogenous progesterone or oestrogen administration',
    ],
    symptoms: [
      'Purulent vaginal discharge (open-cervix form)',
      'Lethargy and depression',
      'Loss of appetite',
      'Increased thirst and urination (E. coli endotoxin-induced renal dysfunction)',
      'Vomiting',
      'Abdominal distension (closed-cervix form)',
      'Fever (variable — hypothermia in septic shock)',
    ],
    severity: 'CRITICAL' as const,
    preventionMethods: [
      'Ovariohysterectomy (spay) eliminates risk entirely',
      'Avoid exogenous progesterone or oestrogen in intact females',
      'Annual examination of intact females, especially post-oestrus',
    ],
    treatmentMethods: [
      'Emergency ovariohysterectomy — definitive and standard treatment',
      'Pre-operative stabilisation with IV fluids and broad-spectrum antibiotics',
      'Amoxicillin-clavulanate plus metronidazole perioperatively',
      'Medical management (prostaglandin F2α + aglepristone) only in selected young breeding animals — significant risk and high recurrence rate',
      'Post-operative monitoring for peritonitis and sepsis',
    ],
    recoveryPeriod: '1–3 weeks post-surgical recovery',
    symptomNames: ['Vaginal Discharge', 'Lethargy', 'Loss of Appetite (Anorexia)', 'Vomiting', 'Abdominal Distension', 'Increased Thirst (Polydipsia)', 'Fever'],
    treatmentNames: ['IV Fluid Resuscitation', 'Systemic Antibiotic Therapy'],
  },
  {
    name: 'Toxoplasmosis',
    description: 'Zoonotic protozoal disease caused by Toxoplasma gondii. Cats are the definitive hosts (only animals that shed oocysts in faeces). Clinical disease is rare in immunocompetent animals but can cause severe multisystemic disease in immunocompromised individuals. Important zoonotic risk to pregnant women.',
    causes: [
      'Ingestion of oocysts from cat faeces or tissue cysts in raw or undercooked prey/meat',
      'Tissue cyst ingestion is the primary route for cats and dogs',
      'Transplacental (congenital) transmission',
      'Immunocompromised, FIV/FeLV-positive, or neonatal animals are most at risk for clinical disease',
    ],
    symptoms: [
      'Lethargy and depression',
      'Fever',
      'Loss of appetite',
      'Respiratory distress (pulmonary toxoplasmosis)',
      'Jaundice (hepatic toxoplasmosis)',
      'Uveitis (ocular involvement — common in cats)',
      'Ataxia and seizures (neurological toxoplasmosis)',
    ],
    severity: 'HIGH' as const,
    preventionMethods: [
      'Do not feed raw or undercooked meat to cats or dogs',
      'Keep cats indoors to prevent hunting',
      'Clean litter boxes daily (oocysts require >24 h to become infective)',
      'Pregnant women should avoid litter box cleaning or use gloves and wash hands thoroughly',
    ],
    treatmentMethods: [
      'Clindamycin (12.5–25 mg/kg BID for 4 weeks) — drug of choice for cats and dogs',
      'Trimethoprim-sulfadiazine as an alternative',
      'Systemic and ophthalmic corticosteroids for uveitis (after confirmed antiviral treatment)',
      'Supportive care: fluids and nutritional support',
    ],
    recoveryPeriod: '2–4 weeks with appropriate antibiotic therapy; neurological signs may be permanent',
    symptomNames: ['Lethargy', 'Fever', 'Loss of Appetite (Anorexia)', 'Jaundice (Icterus)', 'Uveitis', 'Ataxia (Incoordination)', 'Seizures'],
    treatmentNames: ['Systemic Antibiotic Therapy', 'IV Fluid Resuscitation'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Starting PawSense seed...\n')

  // ── 1. Upsert Symptoms ────────────────────────────────────────────────────
  console.log(`📋 Seeding ${SYMPTOMS.length} symptoms...`)
  const symptomMap = new Map<string, string>()

  for (const s of SYMPTOMS) {
    const existing = await prisma.symptom.findUnique({ where: { name: s.name } })
    let id: string
    if (existing) {
      await prisma.symptom.update({ where: { id: existing.id }, data: s })
      id = existing.id
      process.stdout.write(`  ↺ ${s.name}\n`)
    } else {
      const created = await prisma.symptom.create({ data: s })
      id = created.id
      process.stdout.write(`  ✓ ${s.name}\n`)
    }
    symptomMap.set(s.name, id)
  }

  // ── 2. Upsert Treatments ──────────────────────────────────────────────────
  console.log(`\n💊 Seeding ${TREATMENTS.length} treatments...`)
  const treatmentMap = new Map<string, string>()

  for (const t of TREATMENTS) {
    const { steps, ...treatmentData } = t
    const existing = await prisma.treatment.findUnique({ where: { name: t.name } })
    let id: string

    if (existing) {
      await prisma.treatment.update({ where: { id: existing.id }, data: treatmentData })
      await prisma.treatmentStep.deleteMany({ where: { treatmentId: existing.id } })
      id = existing.id
      process.stdout.write(`  ↺ ${t.name}\n`)
    } else {
      const created = await prisma.treatment.create({ data: treatmentData })
      id = created.id
      process.stdout.write(`  ✓ ${t.name}\n`)
    }

    for (let idx = 0; idx < steps.length; idx++) {
      await prisma.treatmentStep.create({
        data: { treatmentId: id, stepOrder: idx + 1, ...steps[idx]! },
      })
    }

    treatmentMap.set(t.name, id)
  }

  // ── 3. Upsert Diseases ────────────────────────────────────────────────────
  console.log(`\n🦠 Seeding ${DISEASES.length} diseases...`)

  for (const d of DISEASES) {
    const { symptomNames, treatmentNames, ...diseaseData } = d
    const existing = await prisma.disease.findUnique({ where: { name: d.name } })
    let id: string

    if (existing) {
      await prisma.disease.update({ where: { id: existing.id }, data: diseaseData })
      await prisma.diseaseSymptom.deleteMany({ where: { diseaseId: existing.id } })
      await prisma.diseaseTreatment.deleteMany({ where: { diseaseId: existing.id } })
      id = existing.id
      process.stdout.write(`  ↺ ${d.name}\n`)
    } else {
      const created = await prisma.disease.create({ data: diseaseData })
      id = created.id
      process.stdout.write(`  ✓ ${d.name}\n`)
    }

    // Link symptoms
    for (const sName of symptomNames) {
      const sId = symptomMap.get(sName)
      if (!sId) {
        console.warn(`    ⚠  Symptom not found: "${sName}"`)
        continue
      }
      await prisma.diseaseSymptom.upsert({
        where: { diseaseId_symptomId: { diseaseId: id, symptomId: sId } },
        update: {},
        create: { diseaseId: id, symptomId: sId },
      })
    }

    // Link treatments
    for (const tName of treatmentNames) {
      const tId = treatmentMap.get(tName)
      if (!tId) {
        console.warn(`    ⚠  Treatment not found: "${tName}"`)
        continue
      }
      await prisma.diseaseTreatment.upsert({
        where: { diseaseId_treatmentId: { diseaseId: id, treatmentId: tId } },
        update: {},
        create: { diseaseId: id, treatmentId: tId },
      })
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const [sc, tc, dc] = await Promise.all([
    prisma.symptom.count(),
    prisma.treatment.count(),
    prisma.disease.count(),
  ])

  console.log('\n✅ Seed complete!')
  console.log(`   Symptoms:   ${sc}`)
  console.log(`   Treatments: ${tc}`)
  console.log(`   Diseases:   ${dc}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
